# GavixaCare — Auth Testing Playbook

## Auth-Gated App Testing Playbook

### Step 1: Create Test User & Session (Mongo)
```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  auth_provider: 'google',
  role: 'patient',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

### Step 2: Test Backend API
```bash
# Auth check
curl -X GET "${BASE}/api/auth/me" -H "Authorization: Bearer $TOKEN"

# Vault list
curl -X GET "${BASE}/api/vault/documents" -H "Authorization: Bearer $TOKEN"
```

### Step 3: Browser Testing (Playwright)
```python
await page.context.add_cookies([{
    "name": "session_token",
    "value": SESSION_TOKEN,
    "domain": "nirmal-health.preview.emergentagent.com",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}])
```

### Email/Password Bypass (for testing)
- Test creds: `demo@gavixacare.in` / `Demo@1234`
- Seeded on backend startup so testing_agent can log in without OAuth.

### Debug Checklist
- User doc has `user_id` field (custom UUID)
- Session `user_id` matches user's `user_id`
- All queries use `{"_id": 0}` projection
- CORS allows credentials from frontend origin
- Cookie is `httpOnly`, `secure`, `samesite=none`

### Success Indicators
- ✅ /api/auth/me returns user data
- ✅ Dashboard loads without redirect
- ✅ Vault CRUD scoped to user works
