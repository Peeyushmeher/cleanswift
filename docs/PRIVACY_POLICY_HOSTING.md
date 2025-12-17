# Privacy Policy & Terms of Service Hosting Guide

This guide explains how to host your Privacy Policy and Terms of Service documents so they can be accessed via URLs (required for App Store submission).

## Quick Overview

You need to host your policy documents at publicly accessible URLs. The app is configured to use:
- Privacy Policy: `https://cleanswift.app/privacy-policy`
- Terms of Service: `https://cleanswift.app/terms-of-service`
- Refund Policy: `https://cleanswift.app/refund-policy`

## Step 1: Prepare Your Documents

1. Review and customize the templates:
   - `docs/privacy-policy-template.md` / `docs/privacy-policy-template.html`
   - `docs/terms-of-service-template.md` / `docs/terms-of-service-template.html`

2. Update all placeholders:
   - `[DATE]` - Set to current date
   - `[YOUR BUSINESS ADDRESS]` - Your actual business address
   - `[JURISDICTION]` - Your legal jurisdiction
   - `[ARBITRATION BODY]` - If using arbitration

3. Review all content for accuracy, especially:
   - Cancellation policies and fees
   - Data retention periods
   - Third-party services listed
   - Contact information

## Step 2: Choose a Hosting Option

### Option A: Your Existing Website (Recommended)

If you have a website at `cleanswift.app` (or similar):

1. Upload the HTML files to your web server:
   - `/privacy-policy.html` → Accessible at `https://cleanswift.app/privacy-policy`
   - `/terms-of-service.html` → Accessible at `https://cleanswift.app/terms-of-service`
   - `/refund-policy.html` → Accessible at `https://cleanswift.app/refund-policy` (optional, can link to terms)

2. Configure URL routing if needed:
   - Some hosts require `.html` extension: `https://cleanswift.app/privacy-policy.html`
   - Others support clean URLs: `https://cleanswift.app/privacy-policy`
   - Update `src/config/urls.ts` if using `.html` extension

### Option B: Static Hosting Services (Free/Paid)

#### GitHub Pages (Free)

1. Create a new repository (e.g., `cleanswift-policies`)
2. Upload HTML files to the repository root
3. Enable GitHub Pages in repository settings
4. Access at: `https://[username].github.io/cleanswift-policies/privacy-policy.html`
5. Update `src/config/urls.ts` with your GitHub Pages URL

#### Vercel (Free)

1. Create account at [vercel.com](https://vercel.com)
2. Create new project
3. Upload HTML files
4. Deploy
5. Access at: `https://[project-name].vercel.app/privacy-policy.html`
6. Optional: Connect custom domain
7. Update `src/config/urls.ts` with your Vercel URL

#### Netlify (Free)

1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop folder containing HTML files
3. Access at: `https://[random-id].netlify.app/privacy-policy.html`
4. Optional: Configure custom domain
5. Update `src/config/urls.ts` with your Netlify URL

#### Supabase Storage (If Using Supabase)

1. Create a public bucket in Supabase Storage
2. Upload HTML files
3. Get public URL: `https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/privacy-policy.html`
4. Update `src/config/urls.ts` with Supabase Storage URLs

### Option C: Domain with Static Hosting

If you have `cleanswift.app` domain but no website:

1. Purchase/configure domain (if not already owned)
2. Use one of the static hosting services above
3. Configure custom domain in hosting service
4. DNS configuration (hosting service will provide instructions)
5. Access at: `https://cleanswift.app/privacy-policy`

## Step 3: Update App Configuration

Once you have your URLs, update `src/config/urls.ts`:

```typescript
const POLICY_BASE_URL = 'https://cleanswift.app'; // Update with your actual domain
```

Or use environment variables for different environments:

```typescript
const POLICY_BASE_URL = 
  process.env.EXPO_PUBLIC_POLICY_BASE_URL || 
  'https://cleanswift.app';
```

Then set environment variable in EAS:
```bash
eas env:create --name EXPO_PUBLIC_POLICY_BASE_URL --value https://cleanswift.app --environment production --scope project
```

## Step 4: Test the URLs

1. **Test in browser**: Open URLs directly in browser to verify they load correctly
2. **Test in app**: Use the app to navigate to Privacy Policy and Terms of Service links
3. **Mobile testing**: Verify links work on iOS/Android devices
4. **SSL verification**: Ensure URLs use HTTPS (required by App Store)

## Step 5: Add to App Store Connect

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app
3. Go to **App Information** section
4. Find **Privacy Policy URL** field
5. Enter: `https://cleanswift.app/privacy-policy` (or your actual URL)
6. Save changes

**Note**: Privacy Policy URL is REQUIRED for App Store submission. The app will be rejected without it.

## File Structure Examples

### Example 1: Simple Static Site

```
your-website/
  index.html
  privacy-policy.html
  terms-of-service.html
  refund-policy.html
```

### Example 2: With Clean URLs (using .htaccess or server config)

```
your-website/
  privacy-policy/
    index.html
  terms-of-service/
    index.html
  refund-policy/
    index.html
```

Accessible as:
- `https://cleanswift.app/privacy-policy`
- `https://cleanswift.app/terms-of-service`

### Example 3: Subdomain

```
policies.cleanswift.app/
  privacy-policy.html
  terms-of-service.html
```

Update `POLICY_BASE_URL` to `https://policies.cleanswift.app`

## Troubleshooting

### URLs Return 404

- Verify files are uploaded to correct location
- Check file permissions (should be publicly readable)
- Verify server configuration (URL routing, file extensions)

### SSL Certificate Issues

- Ensure HTTPS is enabled (App Store requires HTTPS)
- Check SSL certificate is valid and not expired
- Some free hosts may require custom domain for SSL

### Content Not Updating

- Clear browser cache
- Check CDN cache if using CDN
- Verify correct file is being served

### App Store Rejection

If App Store rejects due to Privacy Policy:

1. Verify URL is accessible without authentication
2. Ensure URL uses HTTPS
3. Verify content matches app functionality
4. Check that all required sections are present
5. Ensure contact information is accurate

## Security Considerations

1. **HTTPS Required**: All policy URLs must use HTTPS
2. **Public Access**: Documents must be publicly accessible (no login required)
3. **No Redirects**: Avoid redirects that might break links
4. **Version Control**: Keep old versions accessible if URLs change

## Maintenance

- Review policies annually or when:
  - Adding new features that collect data
  - Changing third-party services
  - Updating business practices
  - Legal requirements change

- Update "Last Updated" date when making changes
- Notify users of material changes (may be required by law)

## Quick Checklist

- [ ] Templates reviewed and customized
- [ ] All placeholders replaced with actual information
- [ ] HTML files created from templates
- [ ] Files uploaded to hosting service
- [ ] URLs tested in browser
- [ ] URLs tested in app
- [ ] HTTPS verified
- [ ] `src/config/urls.ts` updated with correct URLs
- [ ] App Store Connect Privacy Policy URL added
- [ ] Content reviewed for accuracy

## Need Help?

If you need assistance:
1. Check hosting service documentation
2. Verify DNS configuration if using custom domain
3. Test URLs in multiple browsers/devices
4. Contact your hosting provider support
