from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import api
r = DefaultRouter()
r.register("profiles", api.ProfileViewSet, basename="profile")
r.register("posts", api.PostViewSet); r.register("events", api.EventViewSet)
r.register("projects", api.ProjectViewSet); r.register("challenges", api.ChallengeViewSet); r.register("jobs", api.JobViewSet, basename="job"); r.register("messages", api.MessageViewSet, basename="message")
r.register("courses", api.CourseViewSet, basename="course")
r.register("materials", api.StudyMaterialViewSet, basename="material")
urlpatterns = [path("", include(r.urls)), path("register/", api.register), path("stats/", api.stats),
    path("skills/", api.skills), path("verify/", api.verify), path("password-reset/", api.password_reset), path("password-reset/confirm/", api.password_reset_confirm),
    path("account/delete/", api.delete_account), path("comments/<int:pk>/report/", api.report_comment), path("submissions/<int:pk>/vote/", api.vote), path("resend/", api.resend),
    path("notifications/", api.notifications), path("notifications/read/", api.notifications_read), path("token/", api.ThrottledLogin.as_view()), path("token/refresh/", api.token_refresh), path("logout/", api.logout), path("csrf/", api.csrf),
    path("public-post/", api.public_post),
    path("public-post/<int:pk>/", api.public_post_update),
    path("public-post/<int:pk>/delete/", api.public_post_delete),
    path("public-event/", api.public_event),
    path("public-event/<int:pk>/", api.public_event_update),
    path("public-event/<int:pk>/delete/", api.public_event_delete),
    path("join/", api.join_community),
    path("applications/", api.list_applications),
    path("admin-data/", api.admin_data),
    path("admin-login/", api.admin_login),
    path("admin-approve/<int:pk>/", api.admin_approve),
]
