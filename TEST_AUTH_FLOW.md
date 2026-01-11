# ✅ Testing Checklist - Secure Auth Flow

## Prerequisites
- Backend running: `http://localhost:8088`
- Frontend running: `http://localhost:3000` (ou 3001)
- Chrome DevTools ouverts (F12)

---

## 1️⃣ Test: Page Login (No Session)

**Steps:**
```
1. Open http://localhost:3000/login in new tab
2. Check DevTools > Console
   ✅ Should see: [AuthStore] No active session, user is logged out
   ❌ Should NOT see: Infinite redirects or loops
3. Page should render login form (no reload)
```

**Expected Result:** Login page loads, no infinite loop ✅

---

## 2️⃣ Test: Successful Login

**Steps:**
```
1. Fill login form with test credentials
   Email: demo@example.com
   Password: demo123456

2. Click Login button
3. Check DevTools > Console
   ✅ Should see: [AuthStore] Login response: {...}
   ✅ Should see: Redirect to /dashboard
4. Should redirect to dashboard (no manual action)
```

**Expected Result:** Login succeeds, redirects automatically ✅

---

## 3️⃣ Test: Token in HttpOnly Cookie

**Steps:**
```
1. After login, open DevTools (F12)
2. Go to Application > Cookies
3. Find "token" cookie
4. Verify:
   ✅ HttpOnly is CHECKED
   ✅ Secure is UNCHECKED (dev mode)
   ✅ SameSite is Strict
   ✅ Value is a long JWT string (starts with 3 dots)
```

**Expected Result:** Token in secure cookie (not in localStorage) ✅

---

## 4️⃣ Test: Token NOT in Response Body

**Steps:**
```
1. Go to DevTools > Network tab
2. Refresh and login again
3. Find POST /api/auth/login request
4. Click on it > Response tab
5. Check JSON response:
   ✅ Should have: email, nomComplet, prenom, roles
   ✅ Should NOT have: "token" or "token": null
```

**Expected Result:** Token only in cookie, not in body ✅

---

## 5️⃣ Test: localStorage Persistence

**Steps:**
```
1. Open DevTools > Application > localStorage
2. Look for "auth-storage" key
3. Value should be:
   {
     "user": { ...userData },
     "isAuthenticated": true
   }
4. Verify NO "token" field
```

**Expected Result:** localStorage has isAuthenticated flag ✅

---

## 6️⃣ Test: Page Refresh (Session Restoration)

**Steps:**
```
1. You're on /dashboard (logged in)
2. Press F5 or Ctrl+R to refresh
3. Check DevTools > Console
   ✅ Should see: [AuthStore] Session restored from /auth/me: {...}
4. Dashboard should load immediately (no login redirect)
5. User data should be there
```

**Expected Result:** Session persists after refresh ✅

---

## 7️⃣ Test: Direct Access to Protected Route

**Steps:**
```
1. Open new tab and go directly to:
   http://localhost:3000/dashboard
2. Check:
   ✅ If logged in: dashboard loads
   ✅ If not logged in: redirects to /login
3. Check console for [AuthStore] logs
```

**Expected Result:** Protected route guards work ✅

---

## 8️⃣ Test: Logout

**Steps:**
```
1. From /dashboard, click Logout button
2. Check DevTools > Console
   ✅ Should see logout confirmed
3. Should redirect to /login
4. Check DevTools > Application > Cookies
   ✅ "token" cookie should be gone
5. Check localStorage > auth-storage
   ✅ Should be cleared or isAuthenticated: false
```

**Expected Result:** Logout clears session ✅

---

## 9️⃣ Test: Login After Logout

**Steps:**
```
1. On /login, fill form again
2. Login should work normally
3. Should redirect to /dashboard
4. New token cookie created
```

**Expected Result:** Can login again after logout ✅

---

## 🔟 Test: API Calls with Auth

**Steps:**
```
1. From /dashboard, make any API call (e.g., list employees)
2. Open DevTools > Network tab
3. Find the API request
4. Check Request Headers:
   ✅ Should see: Cookie: token=<JWT>
   ✅ No "Authorization" header needed (cookie is auto-included)
5. Response should have data (401 if not authed)
```

**Expected Result:** API requests include auth cookie ✅

---

## Summary

- [ ] Login loads without loop
- [ ] Login successful
- [ ] Token in HttpOnly cookie
- [ ] Token NOT in response body
- [ ] localStorage has auth-storage
- [ ] Page refresh keeps session
- [ ] Protected routes work
- [ ] Logout clears session
- [ ] Can login again
- [ ] API calls authenticated

**All ✅ = PRODUCTION READY!** 🚀
