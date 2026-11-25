import os, sys
from datetime import timedelta
from pathlib import Path
import dj_database_url

# Load .env file if present (check backend/ folder first, then project root)
_env_path = Path(__file__).resolve().parent.parent / '.env'
if not _env_path.exists():
    _env_path = Path(__file__).resolve().parent.parent.parent / '.env'
if _env_path.exists():
    for _line in _env_path.read_text().splitlines():
        _line = _line.strip()
        if _line and not _line.startswith('#') and '=' in _line:
            _k, _v = _line.split('=', 1)
            os.environ.setdefault(_k.strip(), _v.strip())

BASE_DIR = Path(__file__).resolve().parent.parent
DEBUG = os.environ.get("DEBUG", "0") == "1"
HTTPS = os.environ.get("HTTPS", "0") == "1"
TESTING = "test" in sys.argv
SECRET_KEY = os.environ.get("SECRET_KEY") or ("dev-only-insecure-key-wilmark-technologies-32b" if DEBUG else None)
if not SECRET_KEY: raise RuntimeError("Set the SECRET_KEY environment variable.")
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1,wilmarktechno.onrender.com,wilmarktechnologies.onrender.com").split(",")

INSTALLED_APPS = ["django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "corsheaders", "rest_framework", "rest_framework_simplejwt.token_blacklist", "community.apps.CommunityConfig"]
MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware", "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware", "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware", "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware"]
ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "APP_DIRS": True,
    "OPTIONS": {"context_processors": ["django.template.context_processors.request",
    "django.contrib.auth.context_processors.auth", "django.contrib.messages.context_processors.messages"]}}]

# SQLite by default; set DATABASE_URL=postgres://... for PostgreSQL
DATABASES = {"default": dj_database_url.config(default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}", conn_max_age=600)}

RATES = ({"anon": "100000/min", "user": "100000/min", "auth": "100000/min", "write": "100000/min"} if TESTING else
         {"anon": "120/min", "user": "300/min", "auth": "10/min", "write": "120/hour"})
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["community.auth.CookieJWTAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticatedOrReadOnly"],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination", "PAGE_SIZE": 50,
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.AnonRateThrottle", "rest_framework.throttling.UserRateThrottle"],
    "DEFAULT_THROTTLE_RATES": RATES}
SIMPLE_JWT = {"ACCESS_TOKEN_LIFETIME": timedelta(minutes=30), "REFRESH_TOKEN_LIFETIME": timedelta(days=14)}

CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")
CSRF_TRUSTED_ORIGINS = os.environ.get("CSRF_TRUSTED_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
CORS_ALLOW_CREDENTIALS = True  # lets the browser send the login cookies
CORS_ALLOW_HEADERS = [
    "accept", "accept-encoding", "authorization", "content-type",
    "dnt", "origin", "user-agent", "x-csrftoken", "x-requested-with",
    "x-admin-token",
]

if HTTPS:  # turn on when served behind HTTPS
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True; SESSION_COOKIE_SECURE = True; CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000; SECURE_HSTS_INCLUDE_SUBDOMAINS = True

if os.environ.get("EMAIL_HOST"):
    EMAIL_HOST = os.environ["EMAIL_HOST"]; EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
    EMAIL_HOST_USER = os.environ.get("EMAIL_USER", ""); EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_PASSWORD", "")
    EMAIL_USE_TLS = True
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"  # prints emails in the terminal
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "Wilmark Technologies <no-reply@localhost>")

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"}]

STATIC_URL = "static/"; STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"; MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
TIME_ZONE = "Africa/Nairobi"; USE_TZ = True

(BASE_DIR / "logs").mkdir(exist_ok=True)
LOGGING = {"version": 1, "disable_existing_loggers": False,
    "formatters": {"std": {"format": "%(asctime)s %(levelname)s %(name)s %(message)s"}},
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "std"},
        "file": {"class": "logging.handlers.RotatingFileHandler", "filename": BASE_DIR / "logs" / "app.log",
                 "maxBytes": 2_000_000, "backupCount": 5, "formatter": "std"}},
    "root": {"handlers": ["console", "file"], "level": "INFO"}}
