#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Krishi Voice Agent
Tests all endpoints including auth, profile, reminders, market, weather, chat, and disease analysis
"""

import requests
import sys
import json
import base64
from datetime import datetime
from pathlib import Path

class KrishiAPITester:
<<<<<<< HEAD
    def __init__(self, base_url="https://crops-ai-voice.preview.emergentagent.com"):
=======
    def __init__(self, base_url="https://crop-detect-demo.preview.emergentagent.com"):
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.user_token = None
        self.guest_token = None
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, use_token=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
            
        if use_token:
            test_headers['Authorization'] = f'Bearer {use_token}'

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                try:
                    error_data = response.json()
                    self.log(f"   Error: {error_data}", "ERROR")
                except:
                    self.log(f"   Response: {response.text[:200]}", "ERROR")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Exception: {str(e)}", "FAIL")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@krishi.app", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            self.log(f"Admin token obtained: {self.admin_token[:20]}...", "INFO")
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_user_{datetime.now().strftime('%H%M%S')}@krishi.app"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": "test123",
                "name": "Test User",
                "phone": "9876543210"
            }
        )
        if success and 'access_token' in response:
            self.user_token = response['access_token']
            self.log(f"User token obtained: {self.user_token[:20]}...", "INFO")
            return True
        return False

    def test_guest_login(self):
        """Test guest login"""
        success, response = self.run_test(
            "Guest Login",
            "POST",
            "auth/guest",
            200
        )
        if success and 'access_token' in response:
            self.guest_token = response['access_token']
            self.log(f"Guest token obtained: {self.guest_token[:20]}...", "INFO")
            return True
        return False

    def test_auth_me(self):
        """Test get current user"""
        if not self.user_token:
            self.log("No user token available for auth/me test", "SKIP")
            return False
            
        return self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200,
            use_token=self.user_token
        )[0]

    def test_profile_update(self):
        """Test profile update"""
        if not self.user_token:
            self.log("No user token available for profile update test", "SKIP")
            return False
            
        return self.run_test(
            "Update Profile",
            "PUT",
            "profile",
            200,
            data={
                "name": "Updated Test User",
                "language": "hi",
                "village": "Test Village",
                "district": "Test District",
                "state": "Test State",
                "primary_crop": "Rice",
                "land_size": "2 acres",
                "farming_type": "Organic"
            },
            use_token=self.user_token
        )[0]

    def test_reminders_crud(self):
        """Test reminders CRUD operations"""
        if not self.user_token:
            self.log("No user token available for reminders test", "SKIP")
            return False

        # Create reminder
        success, response = self.run_test(
            "Create Reminder",
            "POST",
            "reminders",
            200,
            data={
                "title": "Test Reminder",
                "description": "This is a test reminder",
                "reminder_time": "2024-12-25T10:00:00",
                "priority": "high",
                "category": "irrigation"
            },
            use_token=self.user_token
        )
        
        if not success:
            return False
            
        reminder_id = response.get('id')
        if not reminder_id:
            self.log("No reminder ID returned", "ERROR")
            return False

        # Get reminders
        success, _ = self.run_test(
            "Get Reminders",
            "GET",
            "reminders",
            200,
            use_token=self.user_token
        )
        
        if not success:
            return False

        # Update reminder
        success, _ = self.run_test(
            "Update Reminder",
            "PUT",
            f"reminders/{reminder_id}",
            200,
            data={"completed": True},
            use_token=self.user_token
        )
        
        if not success:
            return False

        # Delete reminder
        return self.run_test(
            "Delete Reminder",
            "DELETE",
            f"reminders/{reminder_id}",
            200,
            use_token=self.user_token
        )[0]

    def test_market_listings(self):
        """Test market listings"""
        if not self.user_token:
            self.log("No user token available for market test", "SKIP")
            return False

        # Create listing
        success, response = self.run_test(
            "Create Market Listing",
            "POST",
            "market/listings",
            200,
            data={
                "crop_name": "Tomatoes",
                "quantity": "100",
                "unit": "kg",
                "price_per_unit": 25.50,
                "description": "Fresh organic tomatoes",
                "location": "Test Village"
            },
            use_token=self.user_token
        )
        
        if not success:
            return False
            
        listing_id = response.get('id')

        # Get all listings
        success, _ = self.run_test(
            "Get Market Listings",
            "GET",
            "market/listings",
            200
        )
        
        if not success:
            return False

        # Get my listings
        success, _ = self.run_test(
            "Get My Listings",
            "GET",
            "market/my-listings",
            200,
            use_token=self.user_token
        )
        
        if not success:
            return False

        # Delete listing if we have ID
        if listing_id:
            return self.run_test(
                "Delete Market Listing",
                "DELETE",
                f"market/listings/{listing_id}",
                200,
                use_token=self.user_token
            )[0]
        
        return True

    def test_weather_api(self):
        """Test weather API"""
        return self.run_test(
            "Get Weather Data",
            "GET",
            "weather?lat=20.5937&lon=78.9629",
            200
        )[0]

    def test_alerts_api(self):
        """Test alerts API"""
        return self.run_test(
            "Get Alerts",
            "GET",
            "alerts",
            200,
            use_token=self.user_token if self.user_token else None
        )[0]

    def test_chat_api(self):
        """Test chat API"""
        return self.run_test(
            "Chat with AI",
            "POST",
            "chat",
            200,
            data={
                "message": "What is the best time to water crops?",
                "language": "en"
            },
            use_token=self.user_token if self.user_token else None
        )[0]

    def test_disease_analysis(self):
        """Test disease analysis with mock image"""
        # Create a simple base64 encoded test image (1x1 pixel PNG)
        test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77mgAAAABJRU5ErkJggg=="
        
        return self.run_test(
            "Disease Analysis",
            "POST",
            "analyze-disease",
            200,
            data={
                "image_base64": test_image_b64,
                "language": "en",
                "crop_type": "tomato"
            },
            use_token=self.user_token if self.user_token else None
        )[0]

    def test_logout(self):
        """Test logout"""
        return self.run_test(
            "Logout",
            "POST",
            "auth/logout",
            200,
            use_token=self.user_token if self.user_token else None
        )[0]

    def run_all_tests(self):
        """Run all tests in sequence"""
        self.log("Starting Krishi Voice Agent API Tests", "START")
        self.log(f"Testing against: {self.base_url}", "INFO")
        
        # Health check
        self.test_health_check()
        
        # Authentication tests
        self.test_admin_login()
        self.test_user_registration()
        self.test_guest_login()
        self.test_auth_me()
        
        # Profile tests
        self.test_profile_update()
        
        # Feature tests
        self.test_reminders_crud()
        self.test_market_listings()
        self.test_weather_api()
        self.test_alerts_api()
        self.test_chat_api()
        self.test_disease_analysis()
        
        # Cleanup
        self.test_logout()
        
        # Results
        self.log(f"Tests completed: {self.tests_passed}/{self.tests_run} passed", "RESULT")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"Success rate: {success_rate:.1f}%", "RESULT")
        
        return self.tests_passed == self.tests_run

def main():
    tester = KrishiAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())