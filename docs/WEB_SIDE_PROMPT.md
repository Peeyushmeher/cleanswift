# Prompt for Building Web Side - Privacy Policy & Terms Hosting

Use this prompt in Cursor or another AI tool to create the web infrastructure for hosting your policy documents.

---

## PROMPT START

I need to create a simple web application to host Privacy Policy and Terms of Service documents for my mobile app called CleanSwift (car detailing booking platform). The app is already configured to link to these URLs, and I need them accessible for App Store submission.

**Requirements:**

1. **Simple static website** that serves HTML documents at:
   - `https://[your-domain]/privacy-policy` (or `/privacy-policy.html`)
   - `https://[your-domain]/terms-of-service` (or `/terms-of-service.html`)
   - `https://[your-domain]/refund-policy` (or `/refund-policy.html`)

2. **Content to include:**

   **Privacy Policy should cover:**
   - Data collection: User accounts (email, name, phone), payment info via Stripe (not stored locally), vehicle information, location data (service addresses), booking history, reviews/ratings
   - Third-party services: Stripe (payment processing), Supabase (auth/database), Google Maps API (geocoding), Apple Sign-In, Google Sign-In
   - Data retention: Booking history retained for 7 years for tax/accounting, other data retained as needed for service
   - User rights: Access, correction, deletion, data portability, opt-out
   - Security measures, international transfers, children's privacy (18+ service)
   - Contact: support@cleanswift.app
   - Last updated date
   - Business address placeholder

   **Terms of Service should cover:**
   - Service description: Car detailing booking platform connecting customers with service providers
   - Account requirements: Must be 18+, accurate information, account security
   - Booking terms: Subject to availability, accurate vehicle/location info required
   - **Cancellation policy: Free cancellation up to 4 hours before service, late cancellation may incur fee, no-show results in full charges**
   - Rescheduling: Up to 2 hours before service time
   - Payment: Processed via Stripe at booking time, accepts cards and Apple Pay
   - Refunds: According to refund policy, 5-10 business days, no refunds for completed services unless material failure
   - User conduct: No illegal use, harassment, fraud, etc.
   - Service provider relationship: Independent contractors, quality standards, dispute resolution
   - Limitation of liability, indemnification, dispute resolution (arbitration)
   - Termination, changes to terms, governing law
   - Contact: support@cleanswift.app

   **Refund Policy** (can be separate or reference Terms of Service section):
   - Free cancellation up to 4 hours before service
   - Refunds processed within 5-10 business days
   - No refunds for completed services unless material service failure
   - Contact support@cleanswift.app for refund requests

3. **Technical requirements:**
   - Clean, readable HTML/CSS design (mobile-friendly)
   - Professional appearance matching a car detailing service brand
   - Responsive design (works on mobile, tablet, desktop)
   - SEO-friendly structure
   - Fast loading
   - HTTPS required (for App Store)

4. **Hosting options to consider:**
   - Static site hosting (Vercel, Netlify, GitHub Pages)
   - Or simple Node.js/Express server if preferred
   - Should support custom domain (cleanswift.app or similar)

5. **Structure needed:**
   ```
   /privacy-policy → Privacy Policy document
   /terms-of-service → Terms of Service document  
   /refund-policy → Refund Policy document (or redirect to terms section)
   / → Optional landing/home page
   ```

6. **Styling preferences:**
   - Clean, professional look
   - Dark theme preferred (matching app's dark UI: #030B18 background, #1DA4F3 accent blue, #6FF0C4 teal)
   - But light theme with good contrast is also fine for readability
   - Easy to read typography
   - Proper spacing and hierarchy

**Deliverables:**
1. Complete HTML files with styled, professional content
2. CSS for styling (inline or separate file)
3. Setup instructions for deployment
4. Any necessary configuration files (package.json, vercel.json, netlify.toml, etc.)
5. README with deployment steps

**Important notes:**
- Replace [DATE] with current date
- Replace [YOUR BUSINESS ADDRESS] with placeholder that user can fill
- Replace [JURISDICTION] with placeholder
- Keep content comprehensive but allow user to customize
- Ensure all third-party service links are correct (Stripe, Supabase, Google, Apple privacy policy URLs)
- Make it easy for user to update contact info and dates later

Please create a complete, production-ready solution that can be deployed immediately.

## PROMPT END

---

## Additional Context You Can Add

If you want to provide more specific context, you can add:

**App Details:**
- App Name: CleanSwift
- Bundle ID: com.cleanswift.app
- Support Email: support@cleanswift.app
- Domain: cleanswift.app (or your actual domain)

**Business Details:**
- [Add your actual business address if you have it]
- [Add your jurisdiction/legal location]
- [Add any specific legal requirements for your region]

**Deployment Preference:**
- Prefer static hosting (Vercel/Netlify) OR
- Need Node.js server OR
- Have existing hosting infrastructure

**Styling:**
- Want dark theme matching app OR
- Prefer light theme for better readability
- Have brand colors/assets to include
