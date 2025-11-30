# OAuth Branding & Custom Domain Setup

This guide explains how to customize the OAuth authentication flow so users see your company branding instead of the Supabase project URL.

## Current State

Currently, when users sign in with Google, they see:
- Supabase project URL: `nxxjpstkgbyaazmcybsf.supabase.co`
- Generic Supabase branding

## Option 1: Custom Domain (Recommended for Production)

Set up a custom domain for Supabase Auth so users see your domain instead of the Supabase URL.

### Steps:

1. **Get a Domain**
   - Purchase a domain (e.g., `cleanswift.com`) or use a subdomain (e.g., `auth.cleanswift.com`)
   - Recommended: Use `auth.yourdomain.com` for the auth subdomain

2. **Configure in Supabase Dashboard**
   - Go to: **Supabase Dashboard** → **Authentication** → **URL Configuration**
   - Scroll to **Custom Domain** section
   - Click **Add Custom Domain**
   - Enter your domain (e.g., `auth.cleanswift.com`)

3. **Configure DNS Records**
   Supabase will provide DNS records to add:
   - **CNAME record**: Point your auth subdomain to Supabase's auth endpoint
   - Example:
     ```
     Type: CNAME
     Name: auth
     Value: [provided by Supabase]
     TTL: 3600
     ```

4. **Verify Domain**
   - Supabase will verify ownership via DNS
   - This may take a few minutes to propagate

5. **Update Environment Variables** (if needed)
   - The custom domain will automatically work with your existing code
   - No code changes required - Supabase handles the routing

### Result:
- Users will see: `auth.cleanswift.com` instead of `nxxjpstkgbyaazmcybsf.supabase.co`
- More professional and branded experience

---

## Option 2: Customize Auth UI Branding

Customize the hosted auth page appearance (colors, logo, text) while still using Supabase domain.

### Steps:

1. **Go to Auth Templates**
   - **Supabase Dashboard** → **Authentication** → **Templates**

2. **Customize Email Templates**
   - **Magic Link** template
   - **Change Email Address** template
   - **Reset Password** template
   - Add your logo, company name, colors

3. **Customize Auth UI** (if available)
   - Some Supabase plans allow customizing the hosted auth page
   - Check: **Authentication** → **Settings** → **Auth UI**

4. **Update Site Metadata**
   - **Authentication** → **URL Configuration**
   - Set **Site URL** and **Redirect URLs**
   - Add your app name/logo

### Limitations:
- Domain will still show Supabase URL (unless using Option 1)
- Customization options vary by Supabase plan

---

## Option 3: Build Custom OAuth Flow (Most Control)

Implement OAuth entirely in your app, bypassing Supabase's hosted auth page.

### Implementation Steps:

1. **Install Google OAuth SDK**
   ```bash
   npx expo install expo-auth-session expo-crypto
   ```

2. **Get Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 Client ID
   - Add redirect URI: `cleanswift://auth/callback`

3. **Update SignInScreen.tsx**
   - Use Google's OAuth directly
   - Handle callback in app
   - Exchange token with Supabase

4. **Benefits:**
   - Full control over UI/UX
   - No Supabase branding visible
   - Custom user experience

5. **Drawbacks:**
   - More code to maintain
   - Need to handle OAuth flow manually
   - More complex error handling

---

## Recommended Approach

**For Production:**
1. ✅ **Use Option 1 (Custom Domain)** - Professional, easy to set up
2. ✅ **Combine with Option 2 (Branding)** - Customize colors/logo
3. ⚠️ **Option 3 only if needed** - More complex, but full control

---

## Quick Checklist

### Custom Domain Setup:
- [ ] Purchase/configure domain (e.g., `auth.cleanswift.com`)
- [ ] Add custom domain in Supabase Dashboard
- [ ] Configure DNS CNAME record
- [ ] Verify domain ownership
- [ ] Test OAuth flow with custom domain
- [ ] Update Google Cloud Console redirect URI (if needed)

### Branding Customization:
- [ ] Customize email templates in Supabase
- [ ] Add company logo to templates
- [ ] Update colors to match brand
- [ ] Set site name and metadata
- [ ] Test email delivery

### Testing:
- [ ] Test Google OAuth with custom domain
- [ ] Verify redirect works correctly
- [ ] Check email templates render properly
- [ ] Test on iOS and Android

---

## Notes

- Custom domain setup is **free** on Supabase
- DNS propagation can take 24-48 hours (usually faster)
- No code changes needed for custom domain
- Custom domain works with existing `cleanswift://auth/callback` deep link
- Google Cloud Console redirect URI should point to your custom domain's callback URL

---

## Resources

- [Supabase Custom Domain Docs](https://supabase.com/docs/guides/auth/auth-deep-linking#custom-domains)
- [Supabase Auth UI Customization](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

---

**Last Updated:** 2025-01-23
**Status:** Ready for implementation when needed

