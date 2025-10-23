# 📱 Phase 1: Customer App Polish & Testing Guide

**Goal:** Ensure the customer app is production-ready, polished, and bug-free
**Duration:** 1-2 days
**Status:** IN PROGRESS

---

## 🎯 **Testing Objectives**

1. ✅ Verify all features work as expected
2. 🐛 Identify and fix bugs
3. 🎨 Polish UI/UX
4. 📱 Test on real mobile devices
5. 🌐 Ensure i18n completeness
6. ⚡ Optimize performance
7. 📊 Document findings

---

## 🔗 **Access Information**

### **Current Network:**
- **IP Address:** `172.20.10.2`
- **Customer App:** `http://172.20.10.2:3002`
- **Backend API:** `http://172.20.10.2:3001`

### **Test on Mobile:**
1. Connect mobile device to same WiFi network
2. Open browser on mobile
3. Navigate to: `http://172.20.10.2:3002`
4. Add to home screen for PWA experience

---

## 📋 **COMPREHENSIVE TEST CHECKLIST**

---

## **TEST 1: Complete Order Flow** 🛒

### **1.1 Browse Menu**
- [ ] Menu loads successfully
- [ ] All categories display correctly
- [ ] Images load properly
- [ ] Prices show in correct format (FCFA)
- [ ] Category filtering works
- [ ] Search functionality works
- [ ] Item details modal opens
- [ ] Can see ingredients/description

### **1.2 Add to Cart**
- [ ] Click "Add to Cart" button
- [ ] Item appears in cart
- [ ] Quantity can be increased/decreased
- [ ] Price updates correctly
- [ ] Can add notes to items
- [ ] Cart badge shows correct count
- [ ] Toast notification appears
- [ ] Can remove items from cart

### **1.3 Checkout Process**
- [ ] Navigate to checkout
- [ ] All cart items display
- [ ] Total amount is correct
- [ ] Tax calculation is accurate
- [ ] Customer info form works
  - [ ] Name field validation
  - [ ] Phone field validation
  - [ ] Table number validation
  - [ ] Order type selection (Dine-in/Takeout/Delivery)

### **1.4 Payment Method Selection**
- [ ] Cash option selectable
- [ ] Card option selectable
- [ ] Mobile Money option selectable
- [ ] Selected method highlighted
- [ ] Payment method icons display
- [ ] Descriptions are clear

### **1.5 Order Submission**
- [ ] Submit button works
- [ ] Loading indicator shows
- [ ] Order number generated
- [ ] Success message displays
- [ ] Redirects to order status page
- [ ] Cart clears after order

**Test Data:**
```
Customer Name: Test User
Phone: +22612345678
Table: 5
Order Type: DINE_IN
Payment: Cash
Items: 2x Attiéké + Poulet, 1x Bissap
```

---

## **TEST 2: Order Tracking & Status** 📍

### **2.1 Order Status Page**
- [ ] Order number displays
- [ ] Status timeline shows
- [ ] Current status is highlighted
- [ ] All order items listed
- [ ] Item images display
- [ ] Quantities correct
- [ ] Prices correct
- [ ] Total amount correct
- [ ] Customer info displayed
- [ ] Order time shown

### **2.2 Real-Time Updates (WebSocket)**
**Setup:**
1. Place an order
2. Keep status page open
3. Use curl to update order status

**Test Commands:**
```bash
# Confirm order
curl -X PATCH http://localhost:3001/api/orders/[ORDER_NUMBER]/status \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED"}'

# Mark preparing
curl -X PATCH http://localhost:3001/api/orders/[ORDER_NUMBER]/status \
  -H "Content-Type: application/json" \
  -d '{"status": "PREPARING", "estimatedTime": 15}'

# Mark ready
curl -X PATCH http://localhost:3001/api/orders/[ORDER_NUMBER]/status \
  -H "Content-Type: application/json" \
  -d '{"status": "READY"}'
```

**Verify:**
- [ ] Status updates automatically (no refresh)
- [ ] Toast notification appears for each status
- [ ] Timeline UI updates
- [ ] Progress bar animates
- [ ] Estimated time shows
- [ ] Notification sound (if enabled)
- [ ] Browser notification (if permission granted)

### **2.3 Cancel Order**
- [ ] Cancel button shows for PENDING/CONFIRMED
- [ ] Cancel button hidden for PREPARING/READY
- [ ] Confirmation modal appears
- [ ] Can dismiss modal
- [ ] Cancellation succeeds
- [ ] Status changes to CANCELLED
- [ ] Toast notification shows
- [ ] Order marked cancelled in history

---

## **TEST 3: Order History** 📜

### **3.1 Profile Page**
- [ ] Navigate to Profile
- [ ] Customer name displays
- [ ] Phone number displays
- [ ] Order count is accurate
- [ ] Order history section loads

### **3.2 Order History List**
- [ ] All past orders display
- [ ] Orders sorted by date (newest first)
- [ ] Order cards show:
  - [ ] Order number
  - [ ] Date/time
  - [ ] Status badge
  - [ ] Item previews (first 2)
  - [ ] Total amount
- [ ] "+X more items" indicator
- [ ] Empty state if no orders

### **3.3 Reorder Functionality**
- [ ] Click "Reorder" button
- [ ] Cart clears
- [ ] All items from order added to cart
- [ ] Quantities match original order
- [ ] Toast notification shows
- [ ] Redirects to home/menu
- [ ] Cart badge updates
- [ ] Can proceed to checkout

### **3.4 View Order Details**
- [ ] Click "Details" button
- [ ] Navigates to order status page
- [ ] Correct order loads
- [ ] All details accurate

---

## **TEST 4: Multi-Language** 🌍

### **4.1 Language Toggle**
- [ ] Language button visible in Profile
- [ ] Shows current language (FR/EN)
- [ ] Click toggles language
- [ ] Toast notification shows
- [ ] All text translates immediately
- [ ] Language persists on refresh
- [ ] Language persists across navigation

### **4.2 Translation Coverage**
Navigate through all pages and verify translations:

**Pages to Check:**
- [ ] Home/Menu page
  - [ ] Category names
  - [ ] Button text
  - [ ] Search placeholder
- [ ] Cart
  - [ ] Headers
  - [ ] Button labels
  - [ ] Empty state
- [ ] Checkout
  - [ ] Form labels
  - [ ] Payment options
  - [ ] Button text
  - [ ] Validation messages
- [ ] Order Status
  - [ ] Status labels
  - [ ] Timeline text
  - [ ] Button labels
- [ ] Profile
  - [ ] Headers
  - [ ] Stats labels
  - [ ] Quick actions
- [ ] Order History
  - [ ] Headers
  - [ ] Empty state
  - [ ] Button labels

**Missing Translations to Add:**
- [ ] Identify any hardcoded French text
- [ ] Identify any hardcoded English text
- [ ] Add to i18n files

---

## **TEST 5: Error Handling** ⚠️

### **5.1 Network Errors**
**Simulate:** Turn off backend server

- [ ] Menu fails gracefully
- [ ] Error message shows
- [ ] Retry option available
- [ ] Offline indicator appears
- [ ] Previous data cached (if available)

### **5.2 Validation Errors**
- [ ] Empty cart → Error message
- [ ] Invalid phone number → Validation error
- [ ] Invalid table number → Validation error
- [ ] Missing required fields → Highlighted

### **5.3 API Errors**
**Test scenarios:**
- [ ] 404 errors (order not found)
- [ ] 500 errors (server error)
- [ ] Timeout errors
- [ ] Each shows appropriate error message
- [ ] User can retry

---

## **TEST 6: Performance** ⚡

### **6.1 Load Times**
- [ ] Initial page load < 3 seconds
- [ ] Menu loads < 2 seconds
- [ ] Images load progressively
- [ ] No layout shift (CLS)
- [ ] Smooth scrolling

### **6.2 Responsiveness**
- [ ] Buttons respond instantly (<100ms)
- [ ] Animations are smooth (60fps)
- [ ] No lag when typing
- [ ] No lag when scrolling
- [ ] Cart updates instantly

### **6.3 Bundle Size**
```bash
# Check bundle size
cd frontend/customer-app
npm run build

# Should see output like:
# dist/assets/index-abc123.js   XXX kB
```
- [ ] Main bundle < 500KB
- [ ] Vendor bundle < 300KB
- [ ] CSS bundle < 100KB
- [ ] Images optimized

---

## **TEST 7: Mobile-Specific** 📱

### **7.1 Touch Interactions**
- [ ] Tap targets large enough (44x44px min)
- [ ] No accidental clicks
- [ ] Scroll is smooth
- [ ] Swipe gestures work (if any)
- [ ] Pull-to-refresh works (if enabled)

### **7.2 Screen Sizes**
Test on different resolutions:
- [ ] iPhone SE (375x667) - Small
- [ ] iPhone 12/13 (390x844) - Medium
- [ ] iPhone 14 Pro Max (430x932) - Large
- [ ] Samsung Galaxy (360x740) - Small Android
- [ ] iPad (768x1024) - Tablet

### **7.3 Orientation**
- [ ] Portrait mode works
- [ ] Landscape mode works
- [ ] Layout adapts appropriately

### **7.4 PWA Features**
- [ ] Can add to home screen
- [ ] App icon displays correctly
- [ ] Splash screen shows
- [ ] Works offline (cached pages)
- [ ] Service worker registered

---

## **TEST 8: Cross-Browser** 🌐

### **8.1 Mobile Browsers**
- [ ] Safari iOS (iPhone/iPad)
- [ ] Chrome Android
- [ ] Firefox Mobile
- [ ] Samsung Internet

### **8.2 Desktop Browsers (for dev)**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## **TEST 9: Edge Cases** 🔍

### **9.1 Cart Edge Cases**
- [ ] Add 50+ items to cart
- [ ] Add same item 20+ times
- [ ] Remove all items
- [ ] Add item, clear cart, add again

### **9.2 Order Edge Cases**
- [ ] Very long customer name (100+ chars)
- [ ] Special characters in name
- [ ] Very long notes (500+ chars)
- [ ] Multiple orders in quick succession

### **9.3 Connectivity Edge Cases**
- [ ] Start online, go offline, come back
- [ ] Submit order offline (should queue)
- [ ] Slow network (3G simulation)
- [ ] Network timeout mid-request

---

## **TEST 10: Accessibility** ♿

### **10.1 Basic Accessibility**
- [ ] All images have alt text
- [ ] Buttons have descriptive labels
- [ ] Form inputs have labels
- [ ] Color contrast is sufficient
- [ ] Focus indicators visible
- [ ] Tab navigation works

### **10.2 Screen Reader** (Optional)
- [ ] VoiceOver (iOS) reads content
- [ ] TalkBack (Android) reads content
- [ ] Navigation makes sense

---

## 🐛 **BUG TRACKING**

### **Bug Report Template:**

```markdown
## Bug #X: [Short Description]

**Severity:** Critical / High / Medium / Low
**Page:** Home / Cart / Checkout / Profile / Order Status
**Device:** iPhone 12 / Samsung Galaxy / Desktop Chrome
**Language:** FR / EN

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
[Attach if possible]

**Console Errors:**
[Copy any errors from browser console]

**Status:** Open / In Progress / Fixed / Won't Fix
```

---

## 📊 **TEST RESULTS SUMMARY**

### **Critical Issues (Must Fix Before Launch):**
- [ ] None found yet

### **High Priority Issues:**
- [ ] None found yet

### **Medium Priority Issues:**
- [ ] None found yet

### **Low Priority / Nice-to-Have:**
- [ ] None found yet

---

## 🎨 **UI/UX POLISH CHECKLIST**

### **Visual Consistency**
- [ ] Colors match design system
- [ ] Typography is consistent
- [ ] Spacing is consistent (4px/8px/16px grid)
- [ ] Border radius consistent
- [ ] Shadows consistent

### **Animations**
- [ ] Toast notifications slide in smoothly
- [ ] Modal animations
- [ ] Button press feedback
- [ ] Loading spinners
- [ ] Page transitions

### **Empty States**
- [ ] Cart empty state
- [ ] Order history empty state
- [ ] Search no results
- [ ] Error states
- [ ] All have helpful messages and actions

### **Loading States**
- [ ] Menu loading skeleton
- [ ] Order status loading
- [ ] Button loading states
- [ ] Image loading placeholders

---

## 🚀 **PERFORMANCE OPTIMIZATION**

### **Images**
```bash
# Check image sizes
find frontend/customer-app/public -type f -name "*.jpg" -o -name "*.png" | xargs ls -lh

# Optimize if needed
```
- [ ] All images < 200KB
- [ ] Use WebP format where possible
- [ ] Lazy load images below fold
- [ ] Responsive images (srcset)

### **Code Splitting**
- [ ] Route-based code splitting
- [ ] Component lazy loading
- [ ] Vendor bundles separated

### **Caching**
- [ ] Service worker caching strategy
- [ ] API responses cached (appropriate TTL)
- [ ] Static assets cached

---

## 📝 **TESTING SCRIPT**

### **Quick 15-Minute Test Flow:**

```markdown
1. **Homepage** (2 min)
   - Load menu
   - Check categories
   - Search for item

2. **Add to Cart** (1 min)
   - Add 3 items
   - Modify quantities
   - Add notes

3. **Checkout** (2 min)
   - Fill customer info
   - Select payment method
   - Submit order

4. **Track Order** (3 min)
   - View order status
   - Test real-time updates (curl commands)
   - Verify toast notifications

5. **Order History** (2 min)
   - Check profile
   - View past orders
   - Test reorder

6. **Language Toggle** (1 min)
   - Switch to English
   - Verify translations
   - Switch back to French

7. **Cancel Order** (2 min)
   - Place new order
   - Cancel it
   - Verify status

8. **Error Handling** (2 min)
   - Test with backend offline
   - Test invalid inputs
   - Check error messages
```

---

## 🎯 **ACCEPTANCE CRITERIA**

### **Must Pass:**
- ✅ Complete order flow works end-to-end
- ✅ Real-time updates functional
- ✅ All new features work (reorder, cancel, language)
- ✅ No critical bugs
- ✅ Works on both iOS and Android
- ✅ Performance acceptable (< 3s load)
- ✅ Major translations complete

### **Should Pass:**
- ⚡ All high-priority bugs fixed
- ⚡ PWA installable
- ⚡ Offline mode functional
- ⚡ All translations complete

### **Nice to Have:**
- 🌟 All medium/low priority bugs fixed
- 🌟 Perfect accessibility score
- 🌟 100% translation coverage
- 🌟 Performance optimized (< 1s load)

---

## 📱 **MOBILE TESTING CHECKLIST**

### **iOS Testing:**
- [ ] iPhone SE (Small screen)
- [ ] iPhone 12/13 (Standard)
- [ ] iPhone 14 Pro Max (Large)
- [ ] iPad (Tablet)
- [ ] Safari browser
- [ ] Chrome browser

### **Android Testing:**
- [ ] Samsung Galaxy (Standard)
- [ ] Google Pixel (Pure Android)
- [ ] OnePlus (Large screen)
- [ ] Chrome browser
- [ ] Samsung Internet

---

## 🔧 **COMMON FIXES**

### **If images don't load:**
```bash
# Check image paths
# Ensure images are in /public folder
# Update URLs if needed
```

### **If WebSocket doesn't connect:**
```bash
# Check backend is running
lsof -ti:3001

# Check Socket.io logs
# Verify firewall not blocking
```

### **If translations missing:**
```javascript
// Add to frontend/customer-app/src/plugins/i18n.ts
// In messages.fr or messages.en
```

### **If performance is slow:**
```bash
# Build production bundle
npm run build

# Analyze bundle size
npm run build -- --report
```

---

## 📊 **METRICS TO TRACK**

### **Technical Metrics:**
- Page load time: ___ms
- Time to interactive: ___ms
- First contentful paint: ___ms
- Bundle size: ___KB
- API response time: ___ms

### **User Experience Metrics:**
- Time to place order: ___min
- Number of taps to checkout: ___
- Error rate: ___%
- Conversion rate: ___%

### **Quality Metrics:**
- Bugs found: ___
- Bugs fixed: ___
- Test coverage: ___%
- Accessibility score: ___/100

---

## ✅ **SIGN-OFF CHECKLIST**

Before marking Phase 1 complete:

- [ ] All critical bugs fixed
- [ ] All high-priority bugs fixed
- [ ] Core features tested on mobile
- [ ] Real-time updates working
- [ ] Language toggle working
- [ ] Performance acceptable
- [ ] Test report documented
- [ ] Screenshots/video captured
- [ ] Ready for production

**Tested By:** _____________
**Date:** _____________
**Sign-off:** _____________

---

## 🚀 **NEXT STEPS AFTER TESTING**

Once Phase 1 is complete:

1. **Document findings** in test report
2. **Fix all critical bugs**
3. **Create demo video** for stakeholders
4. **Prepare for deployment** (Phase 9)
5. **Or continue to Phase 2** (Admin POS)

---

**Good luck with testing!** 🎉

Remember: The goal is to find bugs NOW, not after launch! Be thorough! 🔍
