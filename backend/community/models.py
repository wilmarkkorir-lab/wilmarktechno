from django.contrib.auth.models import User
from django.db import models

class Skill(models.Model):
    name = models.CharField(max_length=40, unique=True)
    def __str__(self): return self.name

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    headline = models.CharField(max_length=120, blank=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=80, blank=True)
    github = models.URLField(blank=True)
    portfolio = models.URLField(blank=True)
    open_to_collab = models.BooleanField(default=True)
    skills = models.ManyToManyField(Skill, blank=True, related_name="teachers")
    wants = models.ManyToManyField(Skill, blank=True, related_name="learners")
    points = models.IntegerField(default=0)
    email_verified = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    @property
    def badge(self):
        p = self.points
        return "Mentor" if p >= 100 else "Contributor" if p >= 30 else "Builder" if p >= 10 else "Newcomer"

class Endorsement(models.Model):
    giver = models.ForeignKey(User, on_delete=models.CASCADE)
    receiver = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="endorsements")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    class Meta: unique_together = ("giver", "receiver", "skill")

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    body = models.TextField()
    code = models.TextField(blank=True)
    hidden = models.BooleanField(default=False)
    likes = models.ManyToManyField(User, blank=True, related_name="liked_posts")
    created = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created"]

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField()
    hidden = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

class Event(models.Model):
    organizer = models.ForeignKey(User, on_delete=models.CASCADE)
    organizer_name = models.CharField(max_length=120, blank=True)
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    date = models.DateTimeField()
    start_time = models.CharField(max_length=20, blank=True)
    end_date = models.DateField(null=True, blank=True)
    end_time = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=120, default="Online")
    location_type = models.CharField(max_length=40, default="Venue")
    location_details = models.CharField(max_length=200, blank=True)
    price = models.CharField(max_length=50, default="Free")
    ticket_quantity = models.IntegerField(default=0)
    image_url = models.TextField(blank=True)
    attendees = models.ManyToManyField(User, blank=True, related_name="rsvps")
    class Meta: ordering = ["date"]

class Project(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    description = models.TextField()
    looking_for = models.ManyToManyField(Skill, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created"]

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent")
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received")
    body = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["created"]

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    text = models.CharField(max_length=200)
    link = models.CharField(max_length=100, blank=True)
    read = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created"]

class Report(models.Model):
    reporter = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, null=True, blank=True, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, null=True, blank=True, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, null=True, blank=True, on_delete=models.CASCADE)
    reason = models.CharField(max_length=200, blank=True)
    resolved = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

class PointEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    key = models.CharField(max_length=80)
    class Meta: unique_together = ("user", "key")

class Block(models.Model):
    blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocking")
    blocked = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocked_by")
    class Meta: unique_together = ("blocker", "blocked")

class Challenge(models.Model):
    title = models.CharField(max_length=160)
    description = models.TextField()
    starts = models.DateTimeField()
    ends = models.DateTimeField()
    class Meta: ordering = ["-starts"]

class Submission(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name="submissions")
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    link = models.URLField(blank=True)
    body = models.TextField(blank=True)
    votes = models.ManyToManyField(User, blank=True, related_name="voted")
    created = models.DateTimeField(auto_now_add=True)

class Job(models.Model):
    poster = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    company = models.CharField(max_length=120)
    description = models.TextField()
    location = models.CharField(max_length=120, default="Remote")
    remote = models.BooleanField(default=True)
    apply_url = models.URLField()
    active = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created"]

class Course(models.Model):
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    instructor = models.CharField(max_length=120, blank=True)
    schedule = models.CharField(max_length=160, blank=True)
    link = models.URLField(blank=True)  # class/meeting link
    image_url = models.URLField(blank=True)
    price = models.CharField(max_length=60, default="Free")
    active = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created"]

class CourseRegistration(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="registrations")
    full_name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created"]; unique_together = ("course", "email")

class StudyMaterial(models.Model):
    TYPES = [("link","Link"),("video","Video"),("doc","Document"),("other","Other")]
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=80, blank=True)
    material_type = models.CharField(max_length=20, choices=TYPES, default="link")
    url = models.URLField(blank=True)
    active = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created"]

class JoinApplication(models.Model):
    # Section 1
    full_name = models.CharField(max_length=120)
    preferred_name = models.CharField(max_length=80, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    country = models.CharField(max_length=80)
    city = models.CharField(max_length=80)
    gender = models.CharField(max_length=20, blank=True)
    age_range = models.CharField(max_length=20)
    # Section 2
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    portfolio = models.URLField(blank=True)
    social_other = models.CharField(max_length=200, blank=True)
    # Section 3
    course = models.CharField(max_length=120)
    cohort = models.CharField(max_length=80, blank=True)
    start_date = models.CharField(max_length=30, blank=True)
    completion_date = models.CharField(max_length=30, blank=True)
    heard_via = models.CharField(max_length=40)
    skills_learned = models.JSONField(default=list)
    skill_level_before = models.CharField(max_length=30)
    skill_level_after = models.CharField(max_length=30)
    projects = models.TextField(blank=True)
    approved = models.BooleanField(null=True, default=None)  # None=pending, True=approved, False=rejected
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']

