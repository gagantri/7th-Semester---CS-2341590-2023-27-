"""
GavixaCare Cookie-Based Auth Regression Test Suite
Tests the migration from localStorage JWT to httpOnly session_token cookies.
"""
import requests
import sys
import time
import uuid
from datetime import datetime

class CookieAuthTester:
    def __init__(self, base_url="https://nirmal-health.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.session = requests.Session()  # Use session to maintain cookies

    def log_result(self, test_name, passed, message=""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = {
            "test": test_name,
            "passed": passed,
            "message": message
        }
        self.test_results.append(result)
        
        print(f"{status} - {test_name}")
        if message:
            print(f"    {message}")

    def test_regression_1_login_cookie(self):
        """REGRESSION 1: Login should set session_token cookie"""
        print("\n" + "="*60)
        print("REGRESSION 1: Login Cookie Authentication")
        print("="*60)
        
        url = f"{self.base_url}/auth/login"
        payload = {
            "email": "demo@gavixacare.in",
            "password": "Demo@1234"
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=10)
            
            # Check status code
            if response.status_code != 200:
                self.log_result(
                    "Login returns 200",
                    False,
                    f"Expected 200, got {response.status_code}: {response.text[:200]}"
                )
                return False
            
            self.log_result("Login returns 200", True)
            
            # Check response has user and access_token
            data = response.json()
            if 'user' not in data or 'access_token' not in data:
                self.log_result(
                    "Login response has user + access_token",
                    False,
                    f"Missing fields in response: {list(data.keys())}"
                )
                return False
            
            self.log_result("Login response has user + access_token", True)
            
            # Check Set-Cookie header
            set_cookie_header = response.headers.get('Set-Cookie', '')
            if 'session_token=' not in set_cookie_header:
                self.log_result(
                    "Login sets session_token cookie",
                    False,
                    f"Set-Cookie header: {set_cookie_header}"
                )
                return False
            
            self.log_result("Login sets session_token cookie", True)
            
            # Verify cookie attributes
            cookie_checks = {
                'HttpOnly': 'HttpOnly' in set_cookie_header,
                'Secure': 'Secure' in set_cookie_header,
                'SameSite=None': 'SameSite=None' in set_cookie_header or 'SameSite=none' in set_cookie_header,
                'Path=/': 'Path=/' in set_cookie_header
            }
            
            all_attrs_present = all(cookie_checks.values())
            missing_attrs = [k for k, v in cookie_checks.items() if not v]
            
            if not all_attrs_present:
                self.log_result(
                    "Cookie has correct attributes (HttpOnly, Secure, SameSite=None, Path=/)",
                    False,
                    f"Missing attributes: {missing_attrs}. Header: {set_cookie_header}"
                )
                return False
            
            self.log_result(
                "Cookie has correct attributes (HttpOnly, Secure, SameSite=None, Path=/)",
                True
            )
            
            # Store access_token for optional Bearer test
            self.bearer_token = data['access_token']
            
            return True
            
        except Exception as e:
            self.log_result("Login with demo credentials", False, f"Error: {str(e)}")
            return False

    def test_regression_1_me_with_cookie(self):
        """REGRESSION 1: GET /api/auth/me should work with cookie only"""
        print("\n" + "="*60)
        print("REGRESSION 1: /auth/me with Cookie Only")
        print("="*60)
        
        url = f"{self.base_url}/auth/me"
        
        try:
            # Make request WITHOUT Authorization header, relying only on cookie
            response = self.session.get(url, timeout=10)
            
            if response.status_code != 200:
                self.log_result(
                    "GET /auth/me with cookie returns 200",
                    False,
                    f"Expected 200, got {response.status_code}: {response.text[:200]}"
                )
                return False
            
            self.log_result("GET /auth/me with cookie returns 200", True)
            
            data = response.json()
            if 'email' not in data or data['email'] != 'demo@gavixacare.in':
                self.log_result(
                    "Response contains correct user",
                    False,
                    f"User data: {data}"
                )
                return False
            
            self.log_result(
                "Response contains correct user (demo@gavixacare.in)",
                True,
                f"User: {data.get('name')}, City: {data.get('default_city')}"
            )
            
            return True
            
        except Exception as e:
            self.log_result("GET /auth/me with cookie", False, f"Error: {str(e)}")
            return False

    def test_regression_2_signup_cookie(self):
        """REGRESSION 2: Signup should set session_token cookie"""
        print("\n" + "="*60)
        print("REGRESSION 2: Signup Cookie Authentication")
        print("="*60)
        
        # Create a new session for signup test
        signup_session = requests.Session()
        
        url = f"{self.base_url}/auth/signup"
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Test User",
            "email": unique_email,
            "password": "TestPass@123",
            "default_city": "Mumbai"
        }
        
        try:
            response = signup_session.post(url, json=payload, timeout=10)
            
            # Check status code
            if response.status_code != 200:
                self.log_result(
                    "Signup returns 200",
                    False,
                    f"Expected 200, got {response.status_code}: {response.text[:200]}"
                )
                return False
            
            self.log_result("Signup returns 200", True)
            
            # Check response has user and access_token
            data = response.json()
            if 'user' not in data or 'access_token' not in data:
                self.log_result(
                    "Signup response has user + access_token",
                    False,
                    f"Missing fields in response: {list(data.keys())}"
                )
                return False
            
            self.log_result("Signup response has user + access_token", True)
            
            # Check Set-Cookie header
            set_cookie_header = response.headers.get('Set-Cookie', '')
            if 'session_token=' not in set_cookie_header:
                self.log_result(
                    "Signup sets session_token cookie",
                    False,
                    f"Set-Cookie header: {set_cookie_header}"
                )
                return False
            
            self.log_result("Signup sets session_token cookie", True)
            
            # Now test that /auth/me works with only the cookie
            me_url = f"{self.base_url}/auth/me"
            me_response = signup_session.get(me_url, timeout=10)
            
            if me_response.status_code != 200:
                self.log_result(
                    "GET /auth/me after signup returns 200",
                    False,
                    f"Expected 200, got {me_response.status_code}"
                )
                return False
            
            me_data = me_response.json()
            if me_data.get('email') != unique_email:
                self.log_result(
                    "GET /auth/me returns correct user after signup",
                    False,
                    f"Expected {unique_email}, got {me_data.get('email')}"
                )
                return False
            
            self.log_result(
                "GET /auth/me after signup returns correct user",
                True,
                f"Created user: {me_data.get('name')} ({unique_email})"
            )
            
            return True
            
        except Exception as e:
            self.log_result("Signup with cookie test", False, f"Error: {str(e)}")
            return False

    def test_regression_5_logout(self):
        """REGRESSION 5: Logout should clear cookie"""
        print("\n" + "="*60)
        print("REGRESSION 5: Logout Clears Cookie")
        print("="*60)
        
        # First ensure we're logged in
        login_url = f"{self.base_url}/auth/login"
        logout_session = requests.Session()
        
        try:
            # Login
            login_response = logout_session.post(
                login_url,
                json={"email": "demo@gavixacare.in", "password": "Demo@1234"},
                timeout=10
            )
            
            if login_response.status_code != 200:
                self.log_result(
                    "Login before logout test",
                    False,
                    f"Login failed: {login_response.status_code}"
                )
                return False
            
            self.log_result("Login before logout test", True)
            
            # Verify we're authenticated
            me_url = f"{self.base_url}/auth/me"
            me_response = logout_session.get(me_url, timeout=10)
            
            if me_response.status_code != 200:
                self.log_result(
                    "Verify authenticated before logout",
                    False,
                    f"Not authenticated: {me_response.status_code}"
                )
                return False
            
            self.log_result("Verify authenticated before logout", True)
            
            # Logout
            logout_url = f"{self.base_url}/auth/logout"
            logout_response = logout_session.post(logout_url, timeout=10)
            
            if logout_response.status_code not in [200, 204]:
                self.log_result(
                    "Logout returns success",
                    False,
                    f"Expected 200/204, got {logout_response.status_code}"
                )
                return False
            
            self.log_result("Logout returns success", True)
            
            # Try to access /auth/me again - should fail with 401
            me_after_logout = logout_session.get(me_url, timeout=10)
            
            if me_after_logout.status_code != 401:
                self.log_result(
                    "GET /auth/me after logout returns 401",
                    False,
                    f"Expected 401, got {me_after_logout.status_code}"
                )
                return False
            
            self.log_result("GET /auth/me after logout returns 401", True)
            
            return True
            
        except Exception as e:
            self.log_result("Logout test", False, f"Error: {str(e)}")
            return False

    def test_optional_bearer_fallback(self):
        """OPTIONAL: Verify Bearer token still works as fallback"""
        print("\n" + "="*60)
        print("OPTIONAL: Bearer Token Fallback")
        print("="*60)
        
        if not hasattr(self, 'bearer_token'):
            self.log_result(
                "Bearer token fallback test",
                False,
                "No bearer token available from login test"
            )
            return False
        
        url = f"{self.base_url}/auth/me"
        headers = {
            'Authorization': f'Bearer {self.bearer_token}'
        }
        
        try:
            # Use a fresh session without cookies
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code != 200:
                self.log_result(
                    "GET /auth/me with Bearer token returns 200",
                    False,
                    f"Expected 200, got {response.status_code}: {response.text[:200]}"
                )
                return False
            
            self.log_result("GET /auth/me with Bearer token returns 200", True)
            
            data = response.json()
            if data.get('email') != 'demo@gavixacare.in':
                self.log_result(
                    "Bearer token returns correct user",
                    False,
                    f"User data: {data}"
                )
                return False
            
            self.log_result(
                "Bearer token returns correct user",
                True,
                "Bearer token auth still works for programmatic clients"
            )
            
            return True
            
        except Exception as e:
            self.log_result("Bearer token fallback test", False, f"Error: {str(e)}")
            return False

    def test_regression_14_backend_endpoints(self):
        """REGRESSION 14: Verify no 500 errors on key endpoints"""
        print("\n" + "="*60)
        print("REGRESSION 14: Backend Endpoints Health Check")
        print("="*60)
        
        endpoints = [
            ("GET", "hospitals/facets", 200),
            ("GET", "hospitals?query=Delhi&limit=5", 200),
            ("GET", "hospitals/compare?ids=aiims-delhi,apollo-delhi", 200),
        ]
        
        all_passed = True
        
        for method, endpoint, expected_status in endpoints:
            url = f"{self.base_url}/{endpoint}"
            try:
                if method == "GET":
                    response = requests.get(url, timeout=10)
                
                if response.status_code != expected_status:
                    self.log_result(
                        f"{method} /{endpoint}",
                        False,
                        f"Expected {expected_status}, got {response.status_code}"
                    )
                    all_passed = False
                else:
                    self.log_result(f"{method} /{endpoint}", True)
                    
            except Exception as e:
                self.log_result(f"{method} /{endpoint}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("COOKIE AUTH REGRESSION TEST SUMMARY")
        print("="*60)
        print(f"Total tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 All cookie auth regression tests passed!")
            return 0
        else:
            print("\n⚠️  Some tests failed. See details above.")
            return 1

def main():
    print("="*60)
    print("GavixaCare Cookie-Based Auth Regression Test Suite")
    print("="*60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tester = CookieAuthTester()
    
    # Run regression tests in order
    tester.test_regression_1_login_cookie()
    tester.test_regression_1_me_with_cookie()
    tester.test_regression_2_signup_cookie()
    tester.test_regression_5_logout()
    tester.test_optional_bearer_fallback()
    tester.test_regression_14_backend_endpoints()
    
    # Print summary
    exit_code = tester.print_summary()
    
    print(f"\nFinished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    return exit_code

if __name__ == "__main__":
    sys.exit(main())
