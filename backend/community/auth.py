from rest_framework import exceptions
from rest_framework.authentication import CSRFCheck
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

def enforce_csrf(request):
    check = CSRFCheck(lambda r: None)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason: raise exceptions.PermissionDenied(f"CSRF Failed: {reason}")

class CookieJWTAuthentication(JWTAuthentication):
    """Reads the access token from an HttpOnly cookie (an Authorization header still works for API clients).
    Cookie requests that change data must also carry the CSRF token."""
    def authenticate(self, request):
        if self.get_header(request) is not None: return super().authenticate(request)
        raw = request.COOKIES.get("access")
        if not raw: return None
        try: token = self.get_validated_token(raw)
        except (InvalidToken, TokenError): return None  # expired: treated as logged out, the frontend then refreshes
        enforce_csrf(request)
        return self.get_user(token), token
