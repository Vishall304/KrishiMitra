## Auth Testing Playbook

Step 1: MongoDB Verification
- db.users.find({role: "admin"}).pretty()
- Verify bcrypt hash starts with $2b$

Step 2: API Testing
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@krishi.app","password":"admin123"}'

Login should return user object and set cookies.
