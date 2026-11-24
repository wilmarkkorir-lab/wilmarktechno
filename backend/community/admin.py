from django.contrib import admin
from . import models

@admin.action(description="Hide selected posts")
def hide(modeladmin, request, qs): qs.update(hidden=True)
@admin.action(description="Restore selected posts")
def restore(modeladmin, request, qs): qs.update(hidden=False)
@admin.action(description="Hide the reported posts and mark reports resolved")
def resolve(modeladmin, request, qs):
    models.Post.objects.filter(report__in=qs).update(hidden=True); models.Comment.objects.filter(report__in=qs).update(hidden=True); qs.update(resolved=True)
@admin.action(description="Suspend selected users")
def suspend(modeladmin, request, qs): qs.update(is_active=False)
@admin.action(description="Approve selected applications")
def approve_apps(modeladmin, request, qs): qs.update(approved=True)
@admin.action(description="Reject selected applications")
def reject_apps(modeladmin, request, qs): qs.update(approved=False)

@admin.register(models.Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "hidden", "created"); list_filter = ("hidden",); actions = [hide, restore]
@admin.register(models.Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("post", "reporter", "reason", "resolved", "created"); list_filter = ("resolved",); actions = [resolve]

@admin.register(models.JoinApplication)
class JoinApplicationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "phone", "course", "approved", "created")
    list_filter = ("approved",)
    search_fields = ("full_name", "email", "phone", "course")
    readonly_fields = ("created",)
    actions = [approve_apps, reject_apps]

for m in (models.Skill, models.Profile, models.Event, models.Project, models.Endorsement, models.Notification, models.Challenge, models.Submission, models.Job, models.Block, models.Comment, models.Course, models.CourseRegistration, models.StudyMaterial): admin.site.register(m)
from django.contrib.auth.models import User
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "is_active"); actions = [suspend]; search_fields = ("username", "email")
admin.site.unregister(User); admin.site.register(User, UserAdmin)
