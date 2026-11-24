from django.contrib.auth.models import User
from django.core import mail
from rest_framework.test import APIClient, APITestCase
from .api import signer
from datetime import timedelta
from django.contrib.auth.tokens import default_token_generator
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from .models import Profile, Skill, Post, Notification, Comment, Challenge, Job, Submission

def make(name, verified=True):
    u = User.objects.create_user(name, f"{name}@x.com", "pass-12345-xyz")
    Profile.objects.filter(user=u).update(email_verified=verified)
    return User.objects.get(pk=u.pk)

def skill(profile, field, name): getattr(profile, field).add(Skill.objects.get_or_create(name=name)[0])

class AuthTests(APITestCase):
    def signup(self, **kw):
        d = {"username": "amani", "email": "a@x.com", "password": "S3cure-pass-9"}; d.update(kw)
        return self.client.post("/api/register/", d, format="json")
    def test_register_creates_profile_and_sends_verification_email(self):
        self.assertEqual(self.signup().status_code, 201)
        self.assertTrue(Profile.objects.filter(user__username="amani", email_verified=False).exists())
        self.assertEqual(len(mail.outbox), 1)
    def test_weak_password_rejected(self): self.assertEqual(self.signup(password="12345678").status_code, 400)
    def test_duplicate_username_and_email_rejected(self):
        self.signup(); self.assertEqual(self.signup(email="b@x.com").status_code, 400)
        self.assertEqual(self.signup(username="other").status_code, 400)
    def test_user_created_outside_signup_gets_profile(self):
        u = User.objects.create_user("admin-made"); self.assertTrue(Profile.objects.filter(user=u).exists())
    def test_verify_link_marks_email_verified(self):
        self.signup(); r = self.client.get("/api/verify/", {"token": signer.sign("amani")})
        self.assertEqual(r.status_code, 200); self.assertTrue(Profile.objects.get(user__username="amani").email_verified)
    def test_bad_verify_token_rejected(self): self.assertEqual(self.client.get("/api/verify/", {"token": "nope"}).status_code, 400)

class PermissionTests(APITestCase):
    def test_anonymous_can_read_feed_but_not_post(self):
        self.assertEqual(self.client.get("/api/posts/").status_code, 200)
        self.assertEqual(self.client.post("/api/posts/", {"title": "t", "body": "b"}, format="json").status_code, 401)
    def test_unverified_user_cannot_post_verified_user_can(self):
        self.client.force_authenticate(make("raw", verified=False))
        self.assertEqual(self.client.post("/api/posts/", {"title": "t", "body": "b"}, format="json").status_code, 403)
        self.client.force_authenticate(make("ok"))
        self.assertEqual(self.client.post("/api/posts/", {"title": "t", "body": "b"}, format="json").status_code, 201)
    def test_unverified_user_can_still_edit_own_profile(self):
        u = make("raw", verified=False); self.client.force_authenticate(u)
        r = self.client.patch(f"/api/profiles/{u.profile.id}/", {"headline": "Dev", "skills": ["django"]}, format="json")
        self.assertEqual(r.status_code, 200); self.assertEqual(r.data["skill_names"], ["django"])

class MatchAndEndorseTests(APITestCase):
    def test_matches_need_mutual_skill_overlap(self):
        a, b, c = make("a"), make("b"), make("c")
        skill(a.profile, "skills", "django"); skill(a.profile, "wants", "react")
        skill(b.profile, "skills", "react"); skill(b.profile, "wants", "django")
        skill(c.profile, "skills", "react")
        self.client.force_authenticate(a); r = self.client.get("/api/profiles/matches/")
        self.assertEqual([p["username"] for p in r.data], ["b"])
    def test_endorsement_awards_points_and_notifies(self):
        a, b = make("a"), make("b"); skill(b.profile, "skills", "django")
        self.client.force_authenticate(a); r = self.client.post(f"/api/profiles/{b.profile.id}/endorse/", {"skill": "django"}, format="json")
        self.assertEqual(r.status_code, 200); self.assertEqual(Profile.objects.get(user=b).points, 5)
        self.assertTrue(Notification.objects.filter(user=b).exists())
        self.client.post(f"/api/profiles/{b.profile.id}/endorse/", {"skill": "django"}, format="json")
        self.assertEqual(Profile.objects.get(user=b).points, 5)
    def test_cannot_endorse_self(self):
        a = make("a"); skill(a.profile, "skills", "django"); self.client.force_authenticate(a)
        self.assertEqual(self.client.post(f"/api/profiles/{a.profile.id}/endorse/", {"skill": "django"}, format="json").status_code, 400)

class ModerationTests(APITestCase):
    def setUp(self): self.author = make("author"); self.post = Post.objects.create(author=self.author, title="Spam", body="x")
    def report(self, user):
        self.client.force_authenticate(user); return self.client.post(f"/api/posts/{self.post.id}/report/", {"reason": "spam"}, format="json")
    def test_three_different_reporters_hide_post(self):
        for n in "abc": self.assertEqual(self.report(make(n)).status_code, 200)
        self.post.refresh_from_db(); self.assertTrue(self.post.hidden)
        self.assertEqual(self.client.get("/api/posts/").data["count"], 0)
    def test_same_reporter_counts_once(self):
        u = make("a")
        for _ in range(4): self.report(u)
        self.post.refresh_from_db(); self.assertFalse(self.post.hidden)

class NotificationTests(APITestCase):
    def test_like_notifies_author_and_read_clears_unread(self):
        a, b = make("a"), make("b"); p = Post.objects.create(author=a, title="Tip", body="x")
        self.client.force_authenticate(b); self.client.post(f"/api/posts/{p.id}/like/")
        self.client.force_authenticate(a); r = self.client.get("/api/notifications/")
        self.assertEqual(r.data["unread"], 1)
        self.client.post("/api/notifications/read/"); self.assertEqual(self.client.get("/api/notifications/").data["unread"], 0)
    def test_users_only_see_their_own_notifications(self):
        a, b = make("a"), make("b"); Notification.objects.create(user=a, text="private")
        self.client.force_authenticate(b); self.assertEqual(self.client.get("/api/notifications/").data["items"], [])
    def test_message_notifies_recipient(self):
        a, b = make("a"), make("b"); self.client.force_authenticate(a)
        self.assertEqual(self.client.post("/api/messages/", {"to": "b", "body": "hi"}, format="json").status_code, 201)
        self.assertEqual(Notification.objects.filter(user=b).count(), 1)


def jpost(client, url, data=None): return client.post(url, data or {}, format="json")

class SafetyTests(APITestCase):
    def test_like_toggles_and_points_awarded_once(self):
        a, b = make("a"), make("b"); p = Post.objects.create(author=a, title="T", body="x"); self.client.force_authenticate(b)
        for _ in range(3): jpost(self.client, f"/api/posts/{p.id}/like/")
        self.assertEqual(p.likes.count(), 1); self.assertEqual(Profile.objects.get(user=a).points, 1)
    def test_password_reset_flow(self):
        u = make("a"); jpost(self.client, "/api/password-reset/", {"email": "a@x.com"}); self.assertEqual(len(mail.outbox), 1)
        body = {"uid": urlsafe_base64_encode(force_bytes(u.pk)), "token": default_token_generator.make_token(u), "password": "N3w-strong-pass-7"}
        self.assertEqual(jpost(self.client, "/api/password-reset/confirm/", body).status_code, 200)
        self.assertTrue(User.objects.get(pk=u.pk).check_password("N3w-strong-pass-7"))
        self.assertEqual(jpost(self.client, "/api/password-reset/confirm/", body).status_code, 400)
    def test_reset_for_unknown_email_looks_the_same_and_sends_nothing(self):
        self.assertEqual(jpost(self.client, "/api/password-reset/", {"email": "nobody@x.com"}).status_code, 200); self.assertEqual(len(mail.outbox), 0)
    def test_account_deletion_requires_password(self):
        u = make("a"); self.client.force_authenticate(u)
        self.assertEqual(jpost(self.client, "/api/account/delete/", {"password": "wrong"}).status_code, 400)
        self.assertEqual(jpost(self.client, "/api/account/delete/", {"password": "pass-12345-xyz"}).status_code, 204)
        self.assertFalse(User.objects.filter(pk=u.pk).exists())
    def test_blocking_stops_messages_and_hides_posts(self):
        a, b = make("a"), make("b"); self.client.force_authenticate(a); jpost(self.client, f"/api/profiles/{b.profile.id}/block/")
        Post.objects.create(author=b, title="x", body="y"); self.assertEqual(self.client.get("/api/posts/").data["count"], 0)
        self.client.force_authenticate(b); self.assertEqual(jpost(self.client, "/api/messages/", {"to": "a", "body": "hi"}).status_code, 403)
    def test_comment_hidden_after_three_reports(self):
        a = make("a"); c = Comment.objects.create(post=Post.objects.create(author=a, title="t", body="b"), author=a, body="spam")
        for n in "xyz": self.client.force_authenticate(make(n)); jpost(self.client, f"/api/comments/{c.id}/report/")
        c.refresh_from_db(); self.assertTrue(c.hidden)
    def test_posts_with_many_links_rejected(self):
        self.client.force_authenticate(make("a")); body = " ".join(f"http://s{i}.com" for i in range(4))
        self.assertEqual(jpost(self.client, "/api/posts/", {"title": "t", "body": body}).status_code, 400)

class JobAndChallengeTests(APITestCase):
    def test_job_posting_and_remote_filter(self):
        self.client.force_authenticate(make("a"))
        d = {"title": "Dev", "company": "Acme", "description": "x", "location": "Nairobi", "remote": False, "apply_url": "https://acme.com/jobs"}
        self.assertEqual(jpost(self.client, "/api/jobs/", d).status_code, 201)
        jpost(self.client, "/api/jobs/", {**d, "remote": True, "title": "Remote dev"})
        self.assertEqual(self.client.get("/api/jobs/?remote=1").data["count"], 1)
    def test_only_poster_can_delete_job(self):
        a, b = make("a"), make("b"); j = Job.objects.create(poster=a, title="t", company="c", description="d", apply_url="https://x.com")
        self.client.force_authenticate(b); self.assertEqual(self.client.delete(f"/api/jobs/{j.id}/").status_code, 403)
    def test_challenge_submit_vote_and_no_self_vote(self):
        a, b = make("a"), make("b"); now = timezone.now()
        c = Challenge.objects.create(title="C", description="d", starts=now, ends=now + timedelta(days=7))
        self.client.force_authenticate(a); jpost(self.client, f"/api/challenges/{c.id}/submit/", {"link": "https://x.com", "body": "mine"})
        s = Submission.objects.get(author=a); self.assertEqual(jpost(self.client, f"/api/submissions/{s.id}/vote/").status_code, 400)
        self.client.force_authenticate(b); jpost(self.client, f"/api/submissions/{s.id}/vote/"); self.assertEqual(s.votes.count(), 1)
    def test_ended_challenge_rejects_entries(self):
        now = timezone.now(); c = Challenge.objects.create(title="C", description="d", starts=now - timedelta(days=9), ends=now - timedelta(days=2))
        self.client.force_authenticate(make("a")); self.assertEqual(jpost(self.client, f"/api/challenges/{c.id}/submit/", {"body": "late"}).status_code, 400)


class CookieAuthTests(APITestCase):
    def login(self, client=None):
        make("amani"); return (client or self.client).post("/api/token/", {"username": "amani", "password": "pass-12345-xyz"}, format="json")
    def test_login_sets_httponly_cookies_and_returns_no_tokens(self):
        r = self.login()
        self.assertEqual(r.status_code, 200); self.assertNotIn("access", r.data); self.assertNotIn("refresh", r.data)
        self.assertTrue(r.cookies["access"]["httponly"]); self.assertTrue(r.cookies["refresh"]["httponly"])
        self.assertEqual(self.client.get("/api/profiles/me/").status_code, 200)
    def test_wrong_password_sets_no_cookies(self):
        make("amani"); r = self.client.post("/api/token/", {"username": "amani", "password": "nope"}, format="json")
        self.assertEqual(r.status_code, 401); self.assertNotIn("access", r.cookies)
    def test_refresh_issues_new_access_cookie(self):
        self.login(); r = self.client.post("/api/token/refresh/")
        self.assertEqual(r.status_code, 200); self.assertIn("access", r.cookies)
    def test_refresh_without_cookie_is_401(self): self.assertEqual(self.client.post("/api/token/refresh/").status_code, 401)
    def test_logout_clears_cookies_and_blacklists_refresh_token(self):
        self.login(); old = self.client.cookies["refresh"].value
        r = self.client.post("/api/logout/"); self.assertEqual(r.cookies["access"].value, "")
        self.assertEqual(self.client.get("/api/profiles/me/").status_code, 401)
        self.client.cookies["refresh"] = old
        self.assertEqual(self.client.post("/api/token/refresh/").status_code, 401)
    def test_cookie_writes_need_csrf_token(self):
        c = APIClient(enforce_csrf_checks=True); self.login(c); body = {"title": "t", "body": "b"}
        self.assertEqual(c.post("/api/posts/", body, format="json").status_code, 403)
        token = c.get("/api/csrf/").data["csrfToken"]
        self.assertEqual(c.post("/api/posts/", body, format="json", HTTP_X_CSRFTOKEN=token).status_code, 201)
