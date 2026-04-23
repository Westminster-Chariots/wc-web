# Google OAuth Setup - Web Frontend

## Phase 2: Web Frontend Complete ✅

The web frontend now supports Google OAuth authentication with:
- Google Sign-In button on auth page
- OAuth callback handling
- Automatic token storage
- 7-day session persistence
- Seamless integration with existing auth flow

---

## Environment Variables Required

Add this to your `wc-web/.env` file:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Files Created/Modified

### New Files:
1. `src/components/ui/GoogleSignInButton.tsx` - Google Sign-In button component
2. `src/app/auth/callback/page.tsx` - OAuth callback handler

### Modified Files:
1. `src/app/(public)/auth/page.tsx` - Added Google Sign-In button
2. `src/lib/services.ts` - Added Google auth methods
3. `src/hooks/useAuth.tsx` - Added `loginWithGoogle` function
4. `.env.example` - Added Google Client ID

---

## How It Works

### Sign-In Flow:

```
User clicks "Sign in with Google"
    ↓
Google Sign-In popup appears
    ↓
User selects Google account
    ↓
Google returns ID token to frontend
    ↓
Frontend sends ID token to backend
    ↓
Backend validates token with Google
    ↓
Backend creates/updates user
    ↓
Backend returns JWT tokens
    ↓
Frontend stores tokens in localStorage
    ↓
User is authenticated ✅
```

---

## Testing

### 1. Start the backend:
```bash
cd wc-backend
npm run dev
```

### 2. Start the web frontend:
```bash
cd wc-web
npm run dev
```

### 3. Test Google Sign-In:
1. Visit: `https://wc-version2.vercel.app//auth`
2. Click "Sign in with Google" button
3. Select your Google account
4. Should redirect to home page authenticated

---

## Features

✅ **Google Sign-In Button**
- Styled to match Westminster Chariots branding
- Shows on both login and signup modes
- Disabled during authentication

✅ **OAuth Callback**
- Handles redirect from Google
- Stores tokens securely
- Refreshes user data
- Redirects to home page

✅ **Session Management**
- 7-day access token
- 30-day refresh token
- Auto-refresh before expiry
- Persistent across page reloads

✅ **Error Handling**
- Invalid credentials
- Network errors
- Token validation failures
- User-friendly error messages

---

## Security

✅ Tokens stored in localStorage (httpOnly cookies for production)
✅ ID token validated by backend
✅ CSRF protection with state parameter
✅ Email verification required
✅ Secure token exchange

---

## Next Steps

- ✅ Backend implementation complete
- ✅ Web frontend implementation complete
- ⏳ Mobile app integration (Phase 3)

---

## Troubleshooting

### "Google Client ID not configured"
- Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `.env`
- Restart Next.js dev server

### Google Sign-In button not appearing
- Check browser console for errors
- Verify Google Client ID is correct
- Check that Google Sign-In script loaded

### "Authentication failed"
- Check backend is running
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend logs for errors

### Redirect loop after sign-in
- Clear localStorage
- Check callback URL is correct
- Verify tokens are being stored

---

## Production Checklist

Before deploying to production:

- [ ] Add production Google Client ID to `.env`
- [ ] Update `NEXT_PUBLIC_API_URL` with production backend URL
- [ ] Add production redirect URI to Google Console
- [ ] Test OAuth flow on production domain
- [ ] Enable secure cookies in production
- [ ] Monitor authentication errors
