import os
from urllib.parse import quote
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core import signing
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db.models import Q
from django.db import models
from rest_framework import serializers, viewsets, permissions, status
from django.contrib.auth.tokens import default_token_generator
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from django.middleware.csrf import get_token
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from .models import Skill, Profile, Endorsement, Post, Comment, Event, Project, Message, Notification, Report, PointEvent, Block, Challenge, Submission, Job, JoinApplication, Course, CourseRegistration, StudyMaterial

def names(qs): return [s.name for s in qs.all()]
def to_skills(items): return [Skill.objects.get_or_create(name=n.strip().lower())[0] for n in items if n.strip()]

def award(user, n):
    p, _ = Profile.objects.get_or_create(user=user); p.points += n; p.save(update_fields=["points"])

signer = signing.TimestampSigner(salt="email-verify")

def notify(user, text, link=""): Notification.objects.create(user=user, text=text[:200], link=link)

def send_verification(user):
    url = f"{settings.FRONTEND_URL}/verify?token={quote(signer.sign(user.username))}"
    send_mail("Verify your Wilmark Technologies email", f"Hi {user.username},\n\nConfirm your email: {url}\n\nThe link works for 2 days.",
              None, [user.email])

class Verified(permissions.BasePermission):
    message = "Verify your email first. Check your inbox for the link."
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS: return True
        u = request.user
        return bool(u.is_authenticated and u.profile.email_verified)

class AuthThrottle(AnonRateThrottle): scope = "auth"

class WriteThrottle(UserRateThrottle):
    scope = "write"
    def allow_request(self, request, view):
        return True if request.method in permissions.SAFE_METHODS else super().allow_request(request, view)

WRITE = [WriteThrottle, AnonRateThrottle, UserRateThrottle]

def set_auth_cookies(resp, access=None, refresh=None):
    kw = {"httponly": True, "secure": settings.HTTPS, "samesite": "Lax"}
    life = settings.SIMPLE_JWT
    if access: resp.set_cookie("access", access, max_age=int(life["ACCESS_TOKEN_LIFETIME"].total_seconds()), path="/", **kw)
    if refresh: resp.set_cookie("refresh", refresh, max_age=int(life["REFRESH_TOKEN_LIFETIME"].total_seconds()), path="/api/token/", **kw)

class ThrottledLogin(TokenObtainPairView):
    throttle_classes = [AuthThrottle]
    def post(self, request, *a, **k):
        resp = super().post(request, *a, **k)
        if resp.status_code == 200:  # tokens go into HttpOnly cookies, never into the response body
            set_auth_cookies(resp, resp.data["access"], resp.data["refresh"])
            resp.data = {"username": request.data.get("username")}
        return resp

def award_once(user, key, n):
    _, new = PointEvent.objects.get_or_create(user=user, key=key)
    if new: award(user, n)

def blocked_between(a, b): return Block.objects.filter(Q(blocker=a, blocked=b) | Q(blocker=b, blocked=a)).exists()

class ProfileSer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    badge = serializers.CharField(read_only=True)
    skill_names = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    want_names = serializers.SerializerMethodField()
    endorsements = serializers.SerializerMethodField()
    skills = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    wants = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    class Meta:
        model = Profile
        fields = ["id", "username", "headline", "bio", "location", "github", "portfolio", "open_to_collab",
                  "points", "email_verified", "avatar_url", "badge", "skill_names", "want_names", "endorsements", "skills", "wants"]
        read_only_fields = ["points", "email_verified"]
    def get_skill_names(self, o): return names(o.skills)
    def get_avatar_url(self, o):
        r = self.context.get("request")
        return r.build_absolute_uri(o.avatar.url) if o.avatar and r else None
    def get_want_names(self, o): return names(o.wants)
    def get_endorsements(self, o):
        out = {}
        for e in o.endorsements.select_related("skill"): out[e.skill.name] = out.get(e.skill.name, 0) + 1
        return out
    def update(self, inst, data):
        sk, wa = data.pop("skills", None), data.pop("wants", None)
        inst = super().update(inst, data)
        if sk is not None: inst.skills.set(to_skills(sk))
        if wa is not None: inst.wants.set(to_skills(wa))
        return inst

class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSer
    http_method_names = ["get", "patch", "post", "head", "options"]
    def get_queryset(self):
        qs = Profile.objects.select_related("user").prefetch_related("skills", "wants")
        q, s = self.request.query_params.get("q"), self.request.query_params.get("skill")
        if q: qs = qs.filter(Q(user__username__icontains=q) | Q(headline__icontains=q) | Q(skills__name__icontains=q))
        if s: qs = qs.filter(skills__name=s.lower())
        if self.request.query_params.get("collab") == "1": qs = qs.filter(open_to_collab=True)
        return qs.distinct().order_by("-points")
    def create(self, request): return Response(status=405)
    def partial_update(self, request, *a, **k):
        if self.get_object().user != request.user: return Response(status=403)
        return super().partial_update(request, *a, **k)
    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request): return Response(self.get_serializer(Profile.objects.get_or_create(user=request.user)[0]).data)
    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def matches(self, request):
        me = Profile.objects.get_or_create(user=request.user)[0]
        qs = Profile.objects.exclude(user=request.user).filter(
            skills__in=me.wants.all(), wants__in=me.skills.all()).distinct()
        return Response(self.get_serializer(qs, many=True).data)
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def block(self, request, pk=None):
        t = self.get_object()
        if t.user == request.user: return Response(status=400)
        b, made = Block.objects.get_or_create(blocker=request.user, blocked=t.user)
        if not made: b.delete()
        return Response({"blocked": made})
    @action(detail=True, methods=["post"], permission_classes=[Verified])
    def report(self, request, pk=None):
        Report.objects.get_or_create(reporter=request.user, profile=self.get_object(), defaults={"reason": request.data.get("reason", "")[:200]})
        return Response({"ok": True})
    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser, FormParser], permission_classes=[permissions.IsAuthenticated])
    def avatar(self, request):
        from PIL import Image
        f = request.FILES.get("avatar")
        if not f or f.size > 2 * 1024 * 1024: return Response({"error": "Upload an image under 2 MB."}, status=400)
        try: Image.open(f).verify(); f.seek(0)
        except Exception: return Response({"error": "That file is not a valid image."}, status=400)
        p = Profile.objects.get_or_create(user=request.user)[0]; p.avatar = f; p.save()
        return Response(self.get_serializer(p).data)
    @action(detail=True, methods=["post"], permission_classes=[Verified])
    def endorse(self, request, pk=None):
        target, skill = self.get_object(), Skill.objects.filter(name=request.data.get("skill", "").lower()).first()
        if target.user == request.user or not skill or skill not in target.skills.all(): return Response(status=400)
        _, made = Endorsement.objects.get_or_create(giver=request.user, receiver=target, skill=skill)
        if made:
            award(target.user, 5); notify(target.user, f"{request.user.username} endorsed you for {skill.name}", "/settings")
        return Response(self.get_serializer(target).data)

class PostSer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.username", read_only=True)
    like_count = serializers.IntegerField(source="likes.count", read_only=True)
    comment_list = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = ["id", "author", "title", "body", "code", "created", "like_count", "comment_list"]
    def validate(self, d):
        if (d.get("body", "") + d.get("code", "")).lower().count("http") > 3: raise serializers.ValidationError("Posts can include at most 3 links.")
        return d
    def get_comment_list(self, o): return [{"id": c.id, "author": c.author.username, "body": c.body} for c in o.comments.filter(hidden=False)]

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(hidden=False); serializer_class = PostSer; permission_classes = [Verified]; throttle_classes = WRITE
    def get_queryset(self):
        u = self.request.user; qs = Post.objects.filter(hidden=False)
        return qs.exclude(author__in=Block.objects.filter(blocker=u).values("blocked")) if u.is_authenticated else qs
    def perform_create(self, s): s.save(author=self.request.user); award(self.request.user, 3)
    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        p = self.get_object()
        if p.likes.filter(pk=request.user.pk).exists(): p.likes.remove(request.user)
        else:
            p.likes.add(request.user)
            if p.author != request.user:
                award_once(p.author, f"like:{p.id}:{request.user.id}", 1)
                notify(p.author, f"{request.user.username} liked your post: {p.title}", "/feed")
        return Response(self.get_serializer(p).data)
    @action(detail=True, methods=["post"])
    def comment(self, request, pk=None):
        p = self.get_object(); Comment.objects.create(post=p, author=request.user, body=request.data.get("body", ""))
        award(request.user, 1)
        if p.author != request.user: notify(p.author, f"{request.user.username} commented on your post: {p.title}", "/feed")
        return Response(self.get_serializer(p).data)
    @action(detail=True, methods=["post"])
    def report(self, request, pk=None):
        p = self.get_object()
        Report.objects.get_or_create(reporter=request.user, post=p, defaults={"reason": request.data.get("reason", "")[:200]})
        if p.report_set.count() >= 3: p.hidden = True; p.save(update_fields=["hidden"])
        return Response({"ok": True})

class EventSer(serializers.ModelSerializer):
    organizer = serializers.CharField(source="organizer.username", read_only=True)
    attending = serializers.IntegerField(source="attendees.count", read_only=True)
    class Meta:
        model = Event
        fields = [
            "id", "organizer", "organizer_name", "title", "description", "date", "start_time",
            "end_date", "end_time", "location", "location_type", "location_details",
            "price", "ticket_quantity", "image_url", "attending"
        ]

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all(); serializer_class = EventSer; permission_classes = [Verified]; throttle_classes = WRITE
    def perform_create(self, s): s.save(organizer=self.request.user); award(self.request.user, 10)
    @action(detail=True, methods=["post"])
    def rsvp(self, request, pk=None):
        e = self.get_object(); e.attendees.add(request.user)
        if e.organizer != request.user: notify(e.organizer, f"{request.user.username} is attending {e.title}", "/events")
        return Response(self.get_serializer(e).data)

class ProjectSer(serializers.ModelSerializer):
    owner = serializers.CharField(source="owner.username", read_only=True)
    looking_for = serializers.SlugRelatedField(many=True, slug_field="name", read_only=True)
    needs = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    class Meta: model = Project; fields = ["id", "owner", "title", "description", "looking_for", "needs", "created"]
    def create(self, data):
        needs = data.pop("needs", []); p = super().create(data); p.looking_for.set(to_skills(needs)); return p

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all(); serializer_class = ProjectSer; permission_classes = [Verified]; throttle_classes = WRITE
    def perform_create(self, s): s.save(owner=self.request.user); award(self.request.user, 5)

class MessageSer(serializers.ModelSerializer):
    sender = serializers.CharField(source="sender.username", read_only=True)
    to = serializers.SlugRelatedField(source="recipient", slug_field="username", queryset=User.objects.all())
    class Meta: model = Message; fields = ["id", "sender", "to", "body", "created"]

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSer; permission_classes = [permissions.IsAuthenticated, Verified]; throttle_classes = WRITE
    http_method_names = ["get", "post"]
    def get_queryset(self):
        u, w = self.request.user, self.request.query_params.get("with")
        qs = Message.objects.filter(Q(sender=u) | Q(recipient=u))
        return qs.filter(Q(sender__username=w) | Q(recipient__username=w)) if w else qs
    def perform_create(self, s):
        if blocked_between(self.request.user, s.validated_data["recipient"]): raise PermissionDenied("You can't message this person.")
        m = s.save(sender=self.request.user)
        notify(m.recipient, f"New message from {self.request.user.username}", f"/inbox?to={self.request.user.username}")

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@throttle_classes([AuthThrottle])
def register(request):
    u, pw = request.data.get("username", "").strip(), request.data.get("password", "")
    email = request.data.get("email", "").strip().lower()
    if len(u) < 3 or "@" not in email: return Response({"error": "Enter a username of 3+ characters and a valid email."}, status=400)
    if User.objects.filter(username__iexact=u).exists(): return Response({"error": "That username is taken."}, status=400)
    if User.objects.filter(email__iexact=email).exists(): return Response({"error": "That email is already registered."}, status=400)
    try: validate_password(pw, User(username=u, email=email))
    except ValidationError as e: return Response({"error": " ".join(e.messages)}, status=400)
    user = User.objects.create_user(u, email, pw)  # a signal creates the profile
    send_verification(user)
    return Response({"ok": True}, status=status.HTTP_201_CREATED)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def stats(request):
    return Response({"members": Profile.objects.count(), "skills": Skill.objects.count(),
                     "posts": Post.objects.count(), "events": Event.objects.count()})

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def skills(request): return Response(sorted(Skill.objects.values_list("name", flat=True)))

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def verify(request):
    try: username = signer.unsign(request.query_params.get("token", ""), max_age=172800)
    except signing.BadSignature: return Response({"error": "This link is invalid or has expired. Request a new one."}, status=400)
    Profile.objects.filter(user__username=username).update(email_verified=True)
    return Response({"ok": True})

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def resend(request):
    if not request.user.profile.email_verified: send_verification(request.user)
    return Response({"ok": True})

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def notifications(request):
    items = [{"id": n.id, "text": n.text, "link": n.link, "read": n.read, "created": n.created} for n in request.user.notifications.all()[:30]]
    return Response({"unread": request.user.notifications.filter(read=False).count(), "items": items})

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def notifications_read(request):
    request.user.notifications.filter(read=False).update(read=True)
    return Response({"ok": True})

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@throttle_classes([AuthThrottle])
def password_reset(request):
    email = request.data.get("email", "").strip().lower()
    for u in User.objects.filter(email__iexact=email, is_active=True)[:1]:
        uid, token = urlsafe_base64_encode(force_bytes(u.pk)), default_token_generator.make_token(u)
        send_mail("Reset your Wilmark Technologies password",
                  f"Hi {u.username},\n\nReset your password: {settings.FRONTEND_URL}/reset?uid={uid}&token={token}\n\nIf you did not ask for this, ignore this email.",
                  None, [u.email])
    return Response({"ok": True})  # same answer whether or not the email exists

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@throttle_classes([AuthThrottle])
def password_reset_confirm(request):
    try: u = User.objects.get(pk=force_str(urlsafe_base64_decode(request.data.get("uid", ""))))
    except (User.DoesNotExist, ValueError, TypeError, OverflowError): u = None
    if not u or not default_token_generator.check_token(u, request.data.get("token", "")):
        return Response({"error": "This reset link is invalid or has expired."}, status=400)
    try: validate_password(request.data.get("password", ""), u)
    except ValidationError as e: return Response({"error": " ".join(e.messages)}, status=400)
    u.set_password(request.data["password"]); u.save()
    return Response({"ok": True})

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def delete_account(request):
    if not request.user.check_password(request.data.get("password", "")): return Response({"error": "Wrong password."}, status=400)
    request.user.delete()
    return Response(status=204)

@api_view(["POST"])
@permission_classes([Verified])
def report_comment(request, pk):
    c = Comment.objects.filter(pk=pk).first()
    if not c: return Response(status=404)
    Report.objects.get_or_create(reporter=request.user, comment=c, defaults={"reason": request.data.get("reason", "")[:200]})
    if c.report_set.count() >= 3: c.hidden = True; c.save(update_fields=["hidden"])
    return Response({"ok": True})

class ChallengeSer(serializers.ModelSerializer):
    submissions = serializers.SerializerMethodField()
    class Meta: model = Challenge; fields = ["id", "title", "description", "starts", "ends", "submissions"]
    def get_submissions(self, o):
        u = self.context["request"].user
        rows = [{"id": s.id, "author": s.author.username, "link": s.link, "body": s.body, "votes": s.votes.count(),
                 "voted": u.is_authenticated and s.votes.filter(pk=u.pk).exists()} for s in o.submissions.all()]
        return sorted(rows, key=lambda r: -r["votes"])

class ChallengeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Challenge.objects.all(); serializer_class = ChallengeSer
    @action(detail=True, methods=["post"], permission_classes=[Verified], throttle_classes=WRITE)
    def submit(self, request, pk=None):
        c = self.get_object()
        if c.ends < timezone.now(): return Response({"error": "This challenge has ended."}, status=400)
        link = request.data.get("link", "")
        Submission.objects.update_or_create(challenge=c, author=request.user, defaults={
            "link": link if link.startswith(("http://", "https://")) else "", "body": request.data.get("body", "")[:2000]})
        award_once(request.user, f"submit:{c.id}", 5)
        return Response(self.get_serializer(c).data)

@api_view(["POST"])
@permission_classes([Verified])
def vote(request, pk):
    s = Submission.objects.filter(pk=pk).first()
    if not s or s.author == request.user: return Response(status=400)
    if s.votes.filter(pk=request.user.pk).exists(): s.votes.remove(request.user)
    else:
        s.votes.add(request.user); award_once(s.author, f"vote:{s.id}:{request.user.id}", 2)
        notify(s.author, f"{request.user.username} voted for your challenge entry", "/challenges")
    return Response({"ok": True})

class JobSer(serializers.ModelSerializer):
    poster = serializers.CharField(source="poster.username", read_only=True)
    class Meta: model = Job; fields = ["id", "poster", "title", "company", "description", "location", "remote", "apply_url", "created"]

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSer; permission_classes = [Verified]; throttle_classes = WRITE
    http_method_names = ["get", "post", "delete", "head", "options"]
    def get_queryset(self):
        qs = Job.objects.filter(active=True)
        return qs.filter(remote=True) if self.request.query_params.get("remote") == "1" else qs
    def perform_create(self, s): s.save(poster=self.request.user)
    def destroy(self, request, *a, **k):
        if self.get_object().poster != request.user and not request.user.is_staff: return Response(status=403)
        return super().destroy(request, *a, **k)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@authentication_classes([])
def token_refresh(request):
    try:
        s = TokenRefreshSerializer(data={"refresh": request.COOKIES.get("refresh", "")}); s.is_valid(raise_exception=True)
    except Exception: return Response({"error": "Session expired. Log in again."}, status=401)
    resp = Response({"ok": True}); set_auth_cookies(resp, s.validated_data["access"])
    return resp

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@authentication_classes([])
def logout(request):
    try: RefreshToken(request.COOKIES.get("refresh", "")).blacklist()  # the old refresh token stops working
    except Exception: pass
    resp = Response({"ok": True}); resp.delete_cookie("access", path="/"); resp.delete_cookie("refresh", path="/api/token/")
    return resp

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@authentication_classes([])
def csrf(request): return Response({"csrfToken": get_token(request)})

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([AnonRateThrottle])
def public_post(request):
    title = request.data.get('title', '').strip()
    body = request.data.get('body', '').strip()
    if not title or not body:
        return Response({'error': 'Title and body are required.'}, status=400)
    system_user, _ = User.objects.get_or_create(
        username='wilmark_public',
        defaults={'email': 'public@wilmark.co.ke'}
    )
    Profile.objects.get_or_create(user=system_user, defaults={'email_verified': True, 'headline': 'Public submissions'})
    post = Post.objects.create(author=system_user, title=title[:160], body=body)
    return Response({'ok': True, 'id': post.id}, status=201)

@api_view(['PATCH'])
@permission_classes([permissions.AllowAny])
@throttle_classes([AnonRateThrottle])
def public_post_update(request, pk):
    try:
        post = Post.objects.get(pk=pk, author__username='wilmark_public')
    except Post.DoesNotExist:
        return Response({'error': 'Post not found.'}, status=404)
    if request.data.get('title'):
        post.title = request.data['title'][:160]
    if request.data.get('body') is not None:
        post.body = request.data['body']
    if request.data.get('code') is not None:
        post.code = request.data['code']
    post.save()
    return Response({'ok': True})

@api_view(['DELETE'])
@permission_classes([permissions.AllowAny])
@throttle_classes([AnonRateThrottle])
def public_post_delete(request, pk):
    try:
        post = Post.objects.get(pk=pk, author__username='wilmark_public')
        post.delete()
        return Response({'ok': True}, status=204)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found.'}, status=404)

from .models import Skill, Profile, Endorsement, Post, Comment, Event, Project, Message, Notification, Report, PointEvent, Block, Challenge, Submission, Job, JoinApplication, Course, CourseRegistration, StudyMaterial

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([AnonRateThrottle])
def join_community(request):
    d = request.data
    required = ['full_name', 'email', 'phone', 'country', 'city', 'age_range', 'course', 'heard_via', 'skill_level_before', 'skill_level_after']
    for f in required:
        if not d.get(f, '').strip():
            return Response({'error': f'{f.replace("_"," ").title()} is required.'}, status=400)
    JoinApplication.objects.create(
        full_name=d.get('full_name','')[:120],
        preferred_name=d.get('preferred_name','')[:80],
        email=d.get('email','')[:254],
        phone=d.get('phone','')[:30],
        country=d.get('country','')[:80],
        city=d.get('city','')[:80],
        gender=d.get('gender','')[:20],
        age_range=d.get('age_range','')[:20],
        linkedin=d.get('linkedin','')[:200],
        github=d.get('github','')[:200],
        portfolio=d.get('portfolio','')[:200],
        social_other=d.get('social_other','')[:200],
        course=d.get('course','')[:120],
        cohort=d.get('cohort','')[:80],
        start_date=d.get('start_date','')[:30],
        completion_date=d.get('completion_date','')[:30],
        heard_via=d.get('heard_via','')[:40],
        skills_learned=d.get('skills_learned', []),
        skill_level_before=d.get('skill_level_before','')[:30],
        skill_level_after=d.get('skill_level_after','')[:30],
        projects=d.get('projects','')[:5000],
    )
    return Response({'ok': True}, status=201)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def admin_login(request):
    user = request.data.get('username', '')
    pw = request.data.get('password', '')
    expected_user = os.environ.get('ADMIN_PANEL_USER', 'admin')
    expected_pw = os.environ.get('ADMIN_PANEL_PASSWORD', '')
    if not expected_pw:
        return Response({'error': 'Admin panel not configured.'}, status=503)
    if user == expected_user and pw == expected_pw:
        import hmac, hashlib
        token = hmac.new(expected_pw.encode(), user.encode(), hashlib.sha256).hexdigest()
        return Response({'token': token})
    return Response({'error': 'Invalid credentials.'}, status=401)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def admin_data(request):
    import hmac, hashlib
    expected_user = os.environ.get('ADMIN_PANEL_USER', 'admin')
    expected_pw = os.environ.get('ADMIN_PANEL_PASSWORD', '')
    if not expected_pw:
        return Response({'error': 'Admin panel not configured.'}, status=503)
    expected_token = hmac.new(expected_pw.encode(), expected_user.encode(), hashlib.sha256).hexdigest()
    if request.headers.get('X-Admin-Token') != expected_token:
        return Response({'error': 'Forbidden'}, status=403)
    apps = JoinApplication.objects.order_by('-created').values(
        'id','full_name','preferred_name','email','phone','country','city','gender','age_range',
        'linkedin','github','portfolio','course','cohort','heard_via','skills_learned',
        'skill_level_before','skill_level_after','projects','approved','created'
    )
    return Response(list(apps))

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def admin_approve(request, pk):
    import hmac, hashlib
    expected_user = os.environ.get('ADMIN_PANEL_USER', 'admin')
    expected_pw = os.environ.get('ADMIN_PANEL_PASSWORD', '')
    if not expected_pw:
        return Response({'error': 'Admin panel not configured.'}, status=503)
    expected_token = hmac.new(expected_pw.encode(), expected_user.encode(), hashlib.sha256).hexdigest()
    if request.headers.get('X-Admin-Token') != expected_token:
        return Response({'error': 'Forbidden'}, status=403)
    try:
        app = JoinApplication.objects.get(pk=pk)
    except JoinApplication.DoesNotExist:
        return Response({'error': 'Not found.'}, status=404)
    app.approved = request.data.get('approved')  # True or False
    app.save(update_fields=['approved'])
    return Response({'ok': True, 'approved': app.approved})

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([AnonRateThrottle])
def public_event(request):
    d = request.data
    title = (d.get('title') or '').strip()
    if not title:
        return Response({'error': 'Event title is required.'}, status=400)
    
    organizer_name = (d.get('organizer') or '').strip() or 'Wilmark Community'
    system_user, _ = User.objects.get_or_create(
        username='wilmark_public',
        defaults={'email': 'public@wilmark.co.ke'}
    )
    Profile.objects.get_or_create(user=system_user, defaults={'email_verified': True, 'headline': 'Public submissions'})
    
    from datetime import datetime, time
    from django.utils.dateparse import parse_datetime, parse_date
    
    dt = None
    start_date_str = d.get('start_date') or d.get('date')
    if start_date_str:
        try:
            dt = parse_datetime(start_date_str)
            if dt and timezone.is_naive(dt):
                dt = timezone.make_aware(dt)
            elif not dt:
                p_date = parse_date(start_date_str)
                if p_date:
                    dt = timezone.make_aware(datetime.combine(p_date, time(10, 0)))
        except Exception:
            pass
    if not dt:
        dt = timezone.now()

    end_date_val = None
    if d.get('end_date'):
        try:
            end_date_val = parse_date(d.get('end_date'))
        except Exception:
            pass

    price_val = d.get('price', 'Free')
    if d.get('is_free'):
        price_val = 'Free'

    event = Event.objects.create(
        organizer=system_user,
        organizer_name=organizer_name[:120],
        title=title[:160],
        description=d.get('description', '') or d.get('summary', ''),
        date=dt,
        start_time=d.get('start_time', '')[:20],
        end_date=end_date_val,
        end_time=d.get('end_time', '')[:20],
        location=d.get('location', '')[:120] or d.get('location_details', '')[:120] or d.get('location_type', 'Venue'),
        location_type=d.get('location_type', 'Venue')[:40],
        location_details=d.get('location_details', '')[:200],
        price=str(price_val)[:50],
        ticket_quantity=int(d.get('ticket_quantity') or 0),
        image_url=d.get('image_url', ''),
    )
    return Response(EventSer(event).data, status=201)

@api_view(['PATCH'])
@permission_classes([permissions.AllowAny])
@throttle_classes([AnonRateThrottle])
def public_event_update(request, pk):
    try:
        event = Event.objects.get(pk=pk)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found.'}, status=404)
    d = request.data
    if d.get('title'): event.title = d['title'][:160]
    if d.get('description') is not None: event.description = d['description']
    if d.get('start_time'): event.start_time = d['start_time'][:20]
    if d.get('end_time'): event.end_time = d['end_time'][:20]
    if d.get('location_details'):
        event.location_details = d['location_details'][:200]
        event.location = d['location_details'][:120]
    if d.get('location_type'): event.location_type = d['location_type'][:40]
    if d.get('price'): event.price = d['price'][:50]
    if d.get('ticket_quantity') is not None:
        try: event.ticket_quantity = int(d['ticket_quantity'])
        except Exception: pass
    if d.get('image_url') is not None: event.image_url = d['image_url']
    if d.get('organizer'): event.organizer_name = d['organizer'][:120]
    event.save()
    return Response(EventSer(event).data)

@api_view(['DELETE'])
@permission_classes([permissions.AllowAny])
@throttle_classes([AnonRateThrottle])
def public_event_delete(request, pk):
    try:
        event = Event.objects.get(pk=pk)
        event.delete()
        return Response({'ok': True}, status=204)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found.'}, status=404)

class StudyMaterialSer(serializers.ModelSerializer):
    url = serializers.URLField(required=False, allow_blank=True)
    class Meta:
        model = StudyMaterial
        fields = ["id", "title", "description", "category", "material_type", "url", "active", "created"]

class CourseSer(serializers.ModelSerializer):
    registrations_count = serializers.SerializerMethodField(read_only=True)
    link = serializers.URLField(required=False, allow_blank=True)
    class Meta:
        model = Course
        fields = ["id", "title", "description", "instructor", "schedule", "link", "image_url", "price", "active", "created", "registrations_count"]
    def get_registrations_count(self, obj):
        return obj.registrations.count()

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        qs = Course.objects.all().order_by("-created")
        if self.request.query_params.get("all") != "1": qs = qs.filter(active=True)
        return qs
    @action(detail=True, methods=["post"], permission_classes=[permissions.AllowAny], throttle_classes=[AnonRateThrottle])
    def register(self, request, pk=None):
        course = self.get_object()
        name = (request.data.get("full_name") or "").strip()
        email = (request.data.get("email") or "").strip().lower()
        phone = (request.data.get("phone") or "").strip()
        if len(name) < 2 or "@" not in email:
            return Response({"error": "Enter your name and a valid email."}, status=400)
        obj, made = CourseRegistration.objects.get_or_create(course=course, email=email, defaults={"full_name": name[:120], "phone": phone[:40]})
        if not made: return Response({"ok": True, "message": "You are already registered for this class."})
        return Response({"ok": True, "message": "Registration successful. Use the class link to join when live."}, status=201)

class StudyMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = StudyMaterialSer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        qs = StudyMaterial.objects.all().order_by("-created")
        if self.request.query_params.get("all") != "1": qs = qs.filter(active=True)
        cat = self.request.query_params.get("category")
        if cat: qs = qs.filter(category__iexact=cat)
        return qs

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def list_applications(request):
    apps = JoinApplication.objects.all().order_by('-created')
    data = [{
        'id': a.id, 'full_name': a.full_name, 'preferred_name': a.preferred_name,
        'email': a.email, 'phone': a.phone, 'country': a.country, 'city': a.city,
        'gender': a.gender, 'age_range': a.age_range, 'linkedin': a.linkedin,
        'github': a.github, 'portfolio': a.portfolio, 'social_other': a.social_other,
        'course': a.course, 'cohort': a.cohort, 'start_date': a.start_date,
        'completion_date': a.completion_date, 'heard_via': a.heard_via,
        'skills_learned': a.skills_learned, 'skill_level_before': a.skill_level_before,
        'skill_level_after': a.skill_level_after, 'projects': a.projects,
        'approved': a.approved, 'created': a.created,
    } for a in apps]
    return Response(data)
