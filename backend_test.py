"""
GavixaCare Backend API Test Suite
Tests all critical endpoints including auth, hospitals, AI features, emergency, and vault.
"""
import requests
import sys
import time
from datetime import datetime

class GavixaCareAPITester:
    def __init__(self, base_url="https://nirmal-health.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, passed, message="", response_time=None):
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
            "message": message,
            "response_time": response_time
        }
        self.test_results.append(result)
        
        time_str = f" ({response_time:.2f}s)" if response_time else ""
        print(f"{status} - {test_name}{time_str}")
        if message:
            print(f"    {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        req_headers = {'Content-Type': 'application/json'}
        
        if headers:
            req_headers.update(headers)
        elif self.token:
            req_headers['Authorization'] = f'Bearer {self.token}'

        start_time = time.time()
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers, timeout=timeout)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=req_headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers, timeout=timeout)
            
            response_time = time.time() - start_time
            
            success = response.status_code == expected_status
            
            if success:
                self.log_result(name, True, f"Status: {response.status_code}", response_time)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    msg += f" - {error_detail}"
                except:
                    msg += f" - {response.text[:200]}"
                self.log_result(name, False, msg, response_time)
                return False, {}

        except requests.exceptions.Timeout:
            response_time = time.time() - start_time
            self.log_result(name, False, f"Request timeout after {timeout}s", response_time)
            return False, {}
        except Exception as e:
            response_time = time.time() - start_time
            self.log_result(name, False, f"Error: {str(e)}", response_time)
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n" + "="*60)
        print("TESTING: Health & Basic Endpoints")
        print("="*60)
        
        self.run_test("GET /api/", "GET", "", 200)
        self.run_test("GET /api/health", "GET", "health", 200)

    def test_auth_login(self):
        """Test login with demo credentials"""
        print("\n" + "="*60)
        print("TESTING: Authentication")
        print("="*60)
        
        success, response = self.run_test(
            "POST /api/auth/login (demo user)",
            "POST",
            "auth/login",
            200,
            data={
                "email": "demo@gavixacare.in",
                "password": "Demo@1234"
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"    ✓ Token obtained: {self.token[:20]}...")
            return True
        else:
            print(f"    ✗ Failed to obtain token")
            return False

    def test_auth_me(self):
        """Test GET /api/auth/me with Bearer token"""
        if not self.token:
            self.log_result("GET /api/auth/me", False, "No token available")
            return False
        
        success, response = self.run_test(
            "GET /api/auth/me (authenticated)",
            "GET",
            "auth/me",
            200
        )
        
        if success and 'email' in response:
            print(f"    ✓ User: {response.get('email')}, City: {response.get('default_city')}")
        
        return success

    def test_hospitals_endpoints(self):
        """Test hospital-related endpoints"""
        print("\n" + "="*60)
        print("TESTING: Hospitals API")
        print("="*60)
        
        # Test list with limit
        success, response = self.run_test(
            "GET /api/hospitals?limit=5",
            "GET",
            "hospitals?limit=5",
            200
        )
        if success and 'hospitals' in response:
            count = len(response['hospitals'])
            print(f"    ✓ Returned {count} hospitals")
        
        # Test facets
        success, response = self.run_test(
            "GET /api/hospitals/facets",
            "GET",
            "hospitals/facets",
            200
        )
        if success:
            cities = response.get('cities', [])
            tiers = response.get('tiers', [])
            print(f"    ✓ Facets: {len(cities)} cities, {len(tiers)} tiers")
        
        # Test specific hospital detail
        success, response = self.run_test(
            "GET /api/hospitals/aiims-delhi",
            "GET",
            "hospitals/aiims-delhi",
            200
        )
        if success and 'name' in response:
            print(f"    ✓ Hospital: {response.get('name')}")
        
        # Test compare
        success, response = self.run_test(
            "GET /api/hospitals/compare",
            "GET",
            "hospitals/compare?ids=aiims-delhi,apollo-delhi",
            200
        )
        if success and 'hospitals' in response:
            count = len(response['hospitals'])
            print(f"    ✓ Compare returned {count} hospitals")

    def test_emergency_endpoint(self):
        """Test emergency nearest hospitals"""
        print("\n" + "="*60)
        print("TESTING: Emergency API")
        print("="*60)
        
        # Delhi coordinates
        success, response = self.run_test(
            "GET /api/emergency/nearest (Delhi coords)",
            "GET",
            "emergency/nearest?lat=28.6139&lng=77.2090&limit=5",
            200
        )
        if success and 'hospitals' in response:
            count = len(response['hospitals'])
            print(f"    ✓ Found {count} emergency hospitals")

    def test_ai_cost_estimate(self):
        """Test AI cost estimator (real AI call, ~20-30s)"""
        print("\n" + "="*60)
        print("TESTING: AI Cost Estimator (may take 20-30s)")
        print("="*60)
        
        payload = {
            "condition": "Cataract Surgery",
            "city": "Delhi",
            "tier": "private",
            "insurance_type": "no insurance"
        }
        
        success, response = self.run_test(
            "POST /api/ai/cost-estimate",
            "POST",
            "ai/cost-estimate",
            200,
            data=payload,
            timeout=60
        )
        
        if success:
            if 'cost_range' in response:
                cost_range = response['cost_range']
                print(f"    ✓ Cost range: ₹{cost_range.get('low'):,} - ₹{cost_range.get('high'):,}")
            if 'breakdown' in response:
                print(f"    ✓ Breakdown items: {len(response['breakdown'])}")

    def test_ai_bill_analyze(self):
        """Test AI bill fraud detector (real AI call, ~30-40s)"""
        print("\n" + "="*60)
        print("TESTING: AI Bill Fraud Detector (may take 30-40s)")
        print("="*60)
        
        bill_text = """APOLLO HOSPITAL DELHI
Surgeon Fee 85,000
Anaesthesia 35,000
ICU 2 days 72,000
OT Charges 42,000
Consumables 58,000
Total 2,92,000"""
        
        payload = {
            "bill_text": bill_text,
            "hospital_name": "Apollo Delhi",
            "city": "Delhi",
            "tier": "private"
        }
        
        success, response = self.run_test(
            "POST /api/ai/bill-analyze",
            "POST",
            "ai/bill-analyze",
            200,
            data=payload,
            timeout=90
        )
        
        if success:
            if 'total_billed' in response:
                print(f"    ✓ Total billed: ₹{response['total_billed']:,}")
            if 'fair_estimate' in response:
                print(f"    ✓ Fair estimate: ₹{response['fair_estimate']:,}")
            if 'line_items' in response:
                print(f"    ✓ Line items analyzed: {len(response['line_items'])}")

    def test_vault_endpoints(self):
        """Test vault endpoints (requires auth)"""
        print("\n" + "="*60)
        print("TESTING: Health Vault API")
        print("="*60)
        
        if not self.token:
            self.log_result("Vault tests", False, "No auth token available")
            return
        
        # Test GET vault documents
        success, response = self.run_test(
            "GET /api/vault/documents",
            "GET",
            "vault/documents",
            200
        )
        if success:
            docs = response if isinstance(response, list) else response.get('documents', [])
            print(f"    ✓ User has {len(docs)} documents")

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 All tests passed!")
            return 0
        else:
            print("\n⚠️  Some tests failed. See details above.")
            return 1

def main():
    print("="*60)
    print("GavixaCare Backend API Test Suite")
    print("="*60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tester = GavixaCareAPITester()
    
    # Run all test suites
    tester.test_health_endpoints()
    
    # Auth is critical - if it fails, some other tests won't work
    auth_success = tester.test_auth_login()
    if auth_success:
        tester.test_auth_me()
    
    tester.test_hospitals_endpoints()
    tester.test_emergency_endpoint()
    
    # AI tests (these take time)
    tester.test_ai_cost_estimate()
    tester.test_ai_bill_analyze()
    
    # Vault (requires auth)
    if auth_success:
        tester.test_vault_endpoints()
    
    # Print summary
    exit_code = tester.print_summary()
    
    print(f"\nFinished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    return exit_code

if __name__ == "__main__":
    sys.exit(main())
