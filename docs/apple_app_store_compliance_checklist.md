# Apple App Store Compliance Checklist for CleanSwift

**Date:** December 2024  
**Status:** Pre-Submission Review

---

## ✅ COMPLIANT - Current Configuration

### 1. App Icon & Splash Screen
- ✅ **App Icon**: CleanSwift logo configured (`./assets/cleanswift_logo_1024x1024.png`)
- ✅ **Splash Screen**: Logo configured with proper background color
- ✅ **Build Number**: Set to "2" for new build

### 2. Privacy Permissions
- ✅ **Camera Permission**: `NSCameraUsageDescription` configured
  - Description: "This app uses the camera to scan payment cards and capture photos for service documentation."
  - **Status**: Compliant

### 3. Encryption Declaration
- ✅ **ITSAppUsesNonExemptEncryption**: Set to `false`
  - **Status**: Compliant (standard HTTPS/TLS encryption is exempt)

### 4. Payment Processing (CRITICAL - VERIFIED COMPLIANT)
- ✅ **Payment Method**: Using Stripe for physical services (car detailing)
- ✅ **Apple Policy Compliance**: 
  - **Physical goods/services are EXEMPT from In-App Purchase requirements**
  - CleanSwift provides real-world car detailing services (physical service)
  - Stripe integration is **100% compliant** with Apple guidelines
  - No IAP (In-App Purchase) required for physical services
- ✅ **Merchant Identifier**: `merchant.com.cleanswift` configured
- ✅ **Entitlements**: `com.apple.developer.in-app-payments` enabled

### 5. Bundle Identifier
- ✅ **Bundle ID**: `com.cleanswift.app` - properly configured

---

## ⚠️ POTENTIAL ISSUES - Need Attention

### 1. Privacy Policy & Terms of Service (REQUIRED)
**Status**: ⚠️ **MISSING - MUST ADD**

**Apple Requirement:**
- Apps must provide a link to privacy policy in App Store Connect metadata
- Privacy policy must be accessible within the app
- Privacy policy must clearly state:
  - What data is collected
  - How data is collected
  - All uses of collected data
  - Third parties with whom data is shared
  - Data retention and deletion policies
  - How users can revoke consent or request data deletion

**Current State:**
- Code references exist (`HelpSupportScreen.tsx`, `ProfileScreen.tsx`) but actual policy pages/links may not be implemented
- Need to verify if privacy policy URL is accessible in-app

**Action Required:**
1. Create privacy policy document (web page or in-app)
2. Add privacy policy link in App Store Connect
3. Ensure in-app links to privacy policy work
4. Include data collection details:
   - User account data (email, name, phone)
   - Payment information (processed by Stripe, not stored)
   - Location data (addresses for service delivery)
   - Booking history
   - Photos (if camera is used)

### 2. Location Permissions (POTENTIALLY NEEDED)
**Status**: ⚠️ **MAY BE REQUIRED**

**Current State:**
- App uses Google Maps API for address geocoding (server-side)
- App stores latitude/longitude coordinates
- **No direct device location access detected** (no `getCurrentPosition` calls found)

**Apple Requirement:**
- If app accesses device location directly, must include:
  - `NSLocationWhenInUseUsageDescription` (for foreground location)
  - `NSLocationAlwaysAndWhenInUseUsageDescription` (if background location needed)

**Recommendation:**
- If you're only using server-side geocoding (Google Maps API), you may NOT need location permissions
- However, if you plan to:
  - Get user's current location automatically
  - Track detailer location in real-time
  - Use device GPS for distance calculations
- Then you MUST add location permission strings

**Action Required:**
- Verify if app directly accesses device location
- If yes, add appropriate location permission descriptions to `app.json`:
```json
"infoPlist": {
  "NSLocationWhenInUseUsageDescription": "This app uses your location to find nearby detailers and calculate service distances."
}
```

### 3. Photo Library Permission (IF NEEDED)
**Status**: ⚠️ **CHECK IF REQUIRED**

**Current State:**
- Camera permission is set (for card scanning)
- No photo library access detected

**Apple Requirement:**
- If app accesses photo library, must include:
  - `NSPhotoLibraryUsageDescription` (read access)
  - `NSPhotoLibraryAddUsageDescription` (write access)

**Action Required:**
- Only add if app allows users to:
  - Select photos from library
  - Save photos to library
- Currently appears NOT needed

### 4. App Store Connect Metadata (REQUIRED)
**Status**: ⚠️ **MUST COMPLETE IN APP STORE CONNECT**

**Required Information:**
1. **App Description**: Clear description of car detailing service
2. **Privacy Policy URL**: Link to your privacy policy (REQUIRED)
3. **Support URL**: Customer support contact information
4. **Marketing URL** (optional): Your website
5. **App Category**: Lifestyle or Utilities
6. **Age Rating**: Complete questionnaire
7. **Screenshots**: Required for App Store listing
   - iPhone 6.7" (iPhone 14 Pro Max, etc.)
   - iPhone 6.5" (iPhone 11 Pro Max, etc.)
   - iPhone 5.5" (iPhone 8 Plus, etc.)
8. **App Preview Video** (optional but recommended)

**Action Required:**
- Complete all required fields in App Store Connect before submission

### 5. User Data Collection Disclosure
**Status**: ⚠️ **MUST DISCLOSE IN PRIVACY POLICY**

**Data Your App Collects:**
- ✅ User account information (email, name, phone)
- ✅ Payment information (processed by Stripe - not stored by you)
- ✅ Location data (service addresses)
- ✅ Booking history
- ✅ Device information (for analytics, if used)

**Action Required:**
- Document all data collection in privacy policy
- Disclose third-party services:
  - Stripe (payment processing)
  - Supabase (backend/database)
  - Google Maps API (geocoding)
  - Any analytics services

---

## ✅ LIKELY COMPLIANT - Verify

### 1. Content Guidelines
- ✅ App appears to be legitimate service (car detailing)
- ✅ No prohibited content detected
- ✅ No misleading functionality

### 2. Functionality
- ✅ App appears functional and complete
- ✅ No placeholder content detected
- ✅ Proper error handling

### 3. Design Guidelines
- ✅ App icon properly sized (1024x1024)
- ✅ Splash screen configured
- ✅ Status bar styling configured

---

## 📋 PRE-SUBMISSION CHECKLIST

### Before Submitting to App Store:

- [ ] **Privacy Policy**: Create and publish privacy policy, add link in App Store Connect
- [ ] **Terms of Service**: Create terms of service document
- [ ] **Location Permissions**: Verify if needed, add if required
- [ ] **App Store Connect**: Complete all required metadata fields
- [ ] **Screenshots**: Prepare required screenshots for all device sizes
- [ ] **Support Information**: Add support URL and contact information
- [ ] **Age Rating**: Complete age rating questionnaire
- [ ] **TestFlight**: Test app thoroughly in TestFlight before submission
- [ ] **Payment Testing**: Verify Stripe payments work correctly
- [ ] **Privacy Policy Links**: Test in-app privacy policy links work

### App Store Connect Required Fields:
- [ ] App Name
- [ ] Subtitle
- [ ] Description
- [ ] Keywords
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Privacy Policy URL (REQUIRED)
- [ ] Category
- [ ] Age Rating
- [ ] Screenshots (all required sizes)
- [ ] App Preview (optional)

---

## 🎯 CRITICAL SUCCESS FACTORS

### 1. Payment Compliance ✅
**Your app is COMPLIANT** - Physical services (car detailing) are exempt from IAP requirements. Stripe is the correct payment method.

### 2. Privacy Policy ⚠️
**MUST HAVE** - This is a hard requirement. Without it, your app will be rejected.

### 3. Location Permissions ⚠️
**Verify if needed** - Only add if app directly accesses device location. Server-side geocoding doesn't require it.

### 4. App Store Connect Metadata ⚠️
**MUST COMPLETE** - All required fields must be filled before submission.

---

## 📝 RECOMMENDED ACTIONS (Priority Order)

1. **HIGH PRIORITY**:
   - Create privacy policy document
   - Add privacy policy link in App Store Connect
   - Verify privacy policy links work in-app

2. **MEDIUM PRIORITY**:
   - Complete App Store Connect metadata
   - Prepare screenshots
   - Add support contact information

3. **LOW PRIORITY** (if applicable):
   - Add location permissions if direct device location access is needed
   - Add photo library permissions if photo selection is implemented

---

## ✅ SUMMARY

**Overall Compliance Status**: 🟡 **MOSTLY COMPLIANT - MINOR FIXES NEEDED**

**Key Strengths:**
- ✅ Payment method (Stripe) is fully compliant for physical services
- ✅ Camera permission properly configured
- ✅ Encryption declaration correct
- ✅ App structure appears sound

**Must Fix Before Submission:**
- ⚠️ Privacy Policy (REQUIRED)
- ⚠️ App Store Connect metadata completion

**Verify Before Submission:**
- ⚠️ Location permissions (only if direct device access)
- ⚠️ In-app privacy policy links functionality

**Estimated Time to Fix**: 2-4 hours (mostly creating privacy policy and completing App Store Connect)

---

## 📚 References

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple Privacy Requirements](https://developer.apple.com/app-store/review/guidelines/#privacy)
- [Apple Payment Guidelines](https://developer.apple.com/app-store/review/guidelines/#payments)
