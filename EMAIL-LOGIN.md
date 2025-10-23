# 📧 Email-Only Login - No Token Required!

## 🎉 What Changed?

The standalone version now works **exactly like the Google Sheets version** - just enter your email and you're in!

### Before (Token Required ❌)

```
1. Go to Avery app
2. Find your token
3. Copy token
4. Paste in standalone app
5. Save token
6. Start using app
```

### After (Email Only ✅)

```
1. Enter your email
2. Click "Login"
3. Start using app!
```

---

## 🚀 How It Works

### User Experience

1. **Open the app**: `http://localhost:3000`
2. **See login screen**:
   ```
   👋 Welcome to Avery Notion Sync
   Enter your Avery email to get started:
   [you@example.com]
   [Login]
   ```
3. **Click Login** - Done!

No password, no token copying, no confusion!

### Behind the Scenes

```javascript
// Frontend calls
POST /api/login
Body: { email: "you@example.com" }

// Backend does
1. Call Avery API: POST /user/ with email
2. Avery returns: { userToken: "...", email: "...", ... }
3. Save token automatically to data/config.json
4. User is logged in!
```

---

## 🔐 Technical Details

### New API Endpoint

**`POST /api/login`**

**Request:**

```json
{
  "email": "you@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "email": "you@example.com",
    "userToken": "generated-token-here",
    "accounts": [...],
    "subscription": {...}
  }
}
```

### New Client Method

**File**: `src/avery-client.js`

```javascript
async createUser(email) {
  // Create/get user by email - returns user object with token
  const url = `${this.baseUrl}/user/`;
  const response = await axios.post(url, { email });
  return response.data;
}
```

### Storage Updates

**File**: `src/storage.js`

```javascript
// Now stores both email and token
setUserEmail(email);
getUserEmail();

// Token is saved automatically after login
saveUserToken(token);
```

---

## 📋 Updated Workflow

### First-Time User

1. Enter email → Avery creates account
2. Token generated and saved automatically
3. Ready to sync!

### Returning User

1. Enter email → Avery finds existing account
2. Token retrieved and saved automatically
3. All previous data intact!

### Already Logged In

1. Open app → Automatically detects saved token
2. Shows "Logged in as: you@example.com"
3. Skip login, go straight to features!

---

## 🎯 Feature Comparison

| Feature              | Google Sheets Version | Standalone (Old) | Standalone (New)  |
| -------------------- | --------------------- | ---------------- | ----------------- |
| **Authentication**   | Email only            | Manual token     | **Email only** ✅ |
| **User Experience**  | Seamless              | Complex          | **Seamless** ✅   |
| **Steps to Start**   | 1 step                | 3 steps          | **1 step** ✅     |
| **Token Visibility** | Hidden                | Visible          | **Hidden** ✅     |

---

## 🔧 Advanced: Manual Token Mode

For power users who prefer manual control:

1. **Expand "Advanced" section** at bottom of login card
2. **Paste token directly**
3. **Click "Save Token"**

This mode is still available but hidden by default.

---

## 💾 Data Storage

**File**: `data/config.json`

```json
{
  "USER_EMAIL": "you@example.com",
  "AVERY_USER_TOKEN": "auto-generated-token",
  "NOTION_DATABASE_ID": "...",
  "CATEGORY_RULES": [...],
  "AUTOSYNC_SETTINGS": {...}
}
```

Both email and token are saved automatically!

---

## 🔄 Logout Feature

New **"Logout"** button:

- Clears saved email and token
- Hides all other cards
- Returns to login screen
- Data is safe (categories, rules, etc. remain)

---

## 📱 UI Updates

### Login Card (New)

```html
👋 Welcome to Avery Notion Sync Enter your Avery email to get started:
[you@example.com] [Login] ℹ️ Note: No password needed! We'll create or access
your Avery account using just your email. ▶ Advanced: Login with token instead
```

### Logged In Card (New)

```html
✅ Logged In Logged in as: you@example.com [Logout]
```

---

## 🎨 User Flow

```
┌─────────────────┐
│  Open App       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│ Has Token?      │────▶│ Show Login   │
│                 │ No  │ Card         │
└────────┬────────┘     └──────┬───────┘
         │ Yes                  │
         │                      │ Login
         │                      ▼
         │              ┌──────────────┐
         │              │ Call /login  │
         │              │ with email   │
         │              └──────┬───────┘
         │                      │
         │                      │ Success
         ▼                      ▼
    ┌─────────────────────────────┐
    │  Show "Logged In" Card      │
    │  + All Other Features       │
    └─────────────────────────────┘
```

---

## 🆚 Comparison with Original Apps Script

### Google Apps Script Version

```javascript
// Automatic
const userEmail = Session.getActiveUser().getEmail();
const user = client.createUser(userEmail);
```

### Standalone Version (NOW)

```javascript
// User enters email, then:
const user = await client.createUser(email);
storage.saveUserToken(user.userToken);
storage.setUserEmail(email);
```

**Result**: Same user experience, different platform! 🎉

---

## ✅ Benefits

1. **🎯 Simpler**: No token hunting
2. **🚀 Faster**: One-click login
3. **😊 User-Friendly**: Like the Sheets version
4. **🔒 Secure**: Token hidden from user
5. **💾 Persistent**: Auto-remembers login
6. **🔄 Flexible**: Manual mode still available

---

## 🐛 Troubleshooting

### "Login failed"

- Check email is valid
- Verify Avery API is accessible
- Try manual token mode as fallback

### "Already logged in but can't see features"

- Refresh page
- Check browser console for errors
- Try logout and login again

### "Want to use different email"

- Click "Logout"
- Enter new email
- Login again

---

## 🔮 Future Enhancements

Potential additions:

- ✨ OAuth flow (like "Login with Google")
- 📧 Email verification
- 🔐 Optional password protection
- 👥 Multi-user support
- 📱 Remember me checkbox

---

## 📞 Support

If you have issues:

1. Check `data/config.json` for saved email/token
2. Try manual token mode
3. Check server logs
4. Verify Avery API endpoint is working

---

**Enjoy the simplified login experience!** 🎊

No more token copying - just enter your email and go! ✨
