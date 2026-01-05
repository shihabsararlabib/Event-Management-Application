# Frontend Testing Guide - EventShield

## Complete UI/UX Testing Instructions

---

## Prerequisites

### 1. Start the Application

**Terminal 1 - Backend:**
```powershell
cd c:\Users\AABATT\Event-Management-Application\server
npm start
```
Wait for: `Server running on port 8080`

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\AABATT\Event-Management-Application\frontend
npm start
```
Wait for: `webpack compiled successfully`

**Terminal 3 - MongoDB:**
Make sure MongoDB is running as a service, or start it:
```powershell
mongod
```

### 2. Open Browser
Navigate to: **http://localhost:3000**

---

## Test 1: Landing Page (Home)

### Steps:
1. Open `http://localhost:3000` or `http://localhost:3000/home`
2. Observe the page loading

### What to Check:
- ✅ **Hero Section**
  - Purple gradient background visible
  - "EventShield" title displayed with gradient effect
  - Tagline: "Your Complete Event Management Solution"
  - Animated badge at top (pulsing dot)
  - "Create Account" button with hover effect

- ✅ **Statistics Section**
  - "1000+ Events Hosted" card
  - "50K+ Happy Attendees" card
  - "99.9% Uptime" card
  - "256-bit Encryption" card

- ✅ **Features Section**
  - 4 feature cards visible:
    1. 🔐 Military-Grade Encryption
    2. 🎟️ Smart Ticket System
    3. ✅ Attendance Tracking
    4. 👥 Participant Management

- ✅ **Call-to-Action Banner**
  - "Ready to get started?" section at bottom
  - "Create Your Account Today" button

### Interactions to Test:
1. Click "Create Account" button → Should redirect to `/signup`
2. Click "EventShield" logo → Should reload home page
3. Click "Events" in navbar → Should go to `/dashboard`
4. Hover over buttons → Should see color change and scale effect
5. Scroll down → Check smooth scrolling

### Responsive Test:
1. Press `F12` to open DevTools
2. Press `Ctrl+Shift+M` to toggle device toolbar
3. Select different devices:
   - iPhone 12 Pro (390x844)
   - iPad Air (820x1180)
   - Desktop (1920x1080)
4. Verify layout adjusts properly

### Screenshot:
📸 **Take screenshot:** `home_page.png`

---

## Test 2: Navigation Bar

### What to Check:
- ✅ **Logo & Brand**
  - EventShield logo visible (logo192.png)
  - Text "EventShield" with purple gradient
  - Clickable (returns to home)

- ✅ **Menu Items**
  - "Home" link
  - "Events" link
  - "About" link (if visible)
  - "Login" link
  - "Sign Up" button (purple gradient)

- ✅ **Styling**
  - Sticky navigation (stays on top when scrolling)
  - White background with blur effect
  - Shadow under navbar
  - Hover effects on links

### Interactions to Test:
1. Click "Home" → Go to home page
2. Click "Events" → Go to dashboard
3. Click "Login" → Go to login page
4. Click "Sign Up" → Go to signup page
5. Scroll down page → Navbar should stick to top

### Responsive Test:
- On mobile view (< 768px), check if navbar adapts

### Screenshot:
📸 **Take screenshot:** `navbar.png`

---

## Test 3: Sign Up Page

### Steps:
1. Navigate to `http://localhost:3000/signup`
2. Observe the signup form

### What to Check:
- ✅ **Page Layout**
  - Purple gradient background
  - White centered card with shadow
  - "Sign Up" title with gradient effect
  - All input fields visible

- ✅ **Form Fields**
  - First Name input
  - Last Name input
  - Email input
  - Password input
  - All have icons
  - Placeholder text visible

- ✅ **Password Field**
  - Eye icon for show/hide password
  - Password hidden by default

- ✅ **Submit Button**
  - "Sign Up" button
  - Purple gradient background
  - Rounded corners

- ✅ **Additional Links**
  - "Already have an account?" text
  - "Log In" link

### Interactions to Test:

**Test 1: Empty Form Submission**
1. Click "Sign Up" without filling anything
2. Expected: Browser validation (HTML5)
3. Should see "Please fill out this field" messages

**Test 2: Invalid Email**
1. First Name: `John`
2. Last Name: `Doe`
3. Email: `invalid-email` (no @)
4. Password: `password123`
5. Click "Sign Up"
6. Expected: "Please include '@' in email address"

**Test 3: Valid Registration**
1. First Name: `John`
2. Last Name: `Doe`
3. Email: `john.doe@test.com`
4. Password: `SecurePass123!`
5. Click "Sign Up"
6. Expected: 
   - Success message or redirect to login
   - Check browser console for response

**Test 4: Password Visibility Toggle**
1. Enter password: `MyPassword123`
2. Click eye icon
3. Password should become visible
4. Click again
5. Password should be hidden

**Test 5: Already Registered Email**
1. Try to register with same email again
2. Expected: Error message "Email already exists"

**Test 6: Navigation**
1. Click "Log In" link
2. Should redirect to `/login`

### Responsive Test:
- Test on mobile (390px width)
- Form should be full width
- Inputs should be stacked vertically

### Screenshot:
📸 **Take screenshots:**
- `signup_page.png` (empty form)
- `signup_filled.png` (filled form)
- `signup_success.png` (after successful registration)

---

## Test 4: Login Page

### Steps:
1. Navigate to `http://localhost:3000/login`
2. Observe the login form

### What to Check:
- ✅ **Page Layout**
  - Purple gradient background
  - White centered card
  - "Log In" title with gradient

- ✅ **Form Fields**
  - Email input with icon
  - Password input with icon
  - "Remember Me" checkbox
  - "Forgot Password?" link (optional)

- ✅ **Submit Button**
  - "Log In" button
  - Purple gradient
  - Hover effects

- ✅ **Additional Links**
  - "Don't have an account?" text
  - "Sign Up" link

### Interactions to Test:

**Test 1: Empty Form**
1. Click "Log In" without credentials
2. Expected: Validation errors

**Test 2: Invalid Credentials**
1. Email: `wrong@email.com`
2. Password: `wrongpassword`
3. Click "Log In"
4. Expected: Error alert "Invalid credentials"

**Test 3: Valid Login**
1. Email: `john.doe@test.com` (from previous signup)
2. Password: `SecurePass123!`
3. Click "Log In"
4. Expected:
   - Redirect to `/dashboard`
   - JWT token stored
   - User logged in

**Test 4: Remember Me**
1. Check "Remember Me" checkbox
2. Login
3. Close browser
4. Reopen
5. Should still be logged in (if implemented)

**Test 5: Password Visibility**
1. Enter password
2. Click eye icon
3. Verify password visibility toggle

**Test 6: Navigation**
1. Click "Sign Up" link
2. Should go to `/signup`

### Console Verification:
1. Open DevTools (F12)
2. Go to Console tab
3. After login, check for:
   - Success message
   - Token received
   - No error messages

### Screenshot:
📸 **Take screenshots:**
- `login_page.png` (empty form)
- `login_filled.png` (with credentials)
- `login_success.png` (after login, showing dashboard)

---

## Test 5: Dashboard (Events Page)

### Steps:
1. Make sure you're logged in
2. Navigate to `http://localhost:3000/dashboard`

### What to Check:
- ✅ **Header Section**
  - Title: "Discover Events" with gradient
  - Subtitle: "Find and register for amazing events"
  - "Create New Event" button (purple gradient)

- ✅ **Search Bar**
  - Large rounded search input
  - Placeholder: "🔍 Search events..."
  - Purple border
  - White background

- ✅ **Filter Buttons** (if implemented)
  - Category filters
  - Date filters

- ✅ **Events Grid**
  - Event cards displayed in grid
  - 3 columns on desktop
  - 2 columns on tablet
  - 1 column on mobile

- ✅ **Event Cards**
  Each card should show:
  - Event name
  - Description (truncated)
  - Date
  - Venue
  - "Register" or "View Details" button

- ✅ **Empty State**
  If no events:
  - "No events found" message
  - "Create New Event" suggestion

### Interactions to Test:

**Test 1: View All Events**
1. Page loads
2. Verify events are displayed
3. Check loading state (if visible)

**Test 2: Search Functionality**
1. Click in search bar
2. Type: `tech`
3. Expected: Events filter in real-time
4. Clear search
5. All events should reappear

**Test 3: Click Event Card**
1. Click on any event card
2. Expected: 
   - Show event details modal
   - OR navigate to event details page

**Test 4: Create New Event Button**
1. Click "Create New Event" button
2. Expected: Navigate to `/addevent`

**Test 5: Scroll Behavior**
1. Scroll down page
2. Verify smooth scrolling
3. Check if more events load (if pagination implemented)

**Test 6: No Events State**
1. Search for something that doesn't exist: `zzzzz`
2. Verify "No events found" message

### Console Verification:
1. Open Console (F12)
2. Check for API call: `GET http://localhost:8080/api/event`
3. Verify events data received
4. No error messages

### Network Tab:
1. Open DevTools → Network tab
2. Reload page
3. Verify:
   - API call to `/api/event` succeeds (200 OK)
   - Events data returned

### Responsive Test:
- Desktop (1920px): 3 columns
- Tablet (768px): 2 columns
- Mobile (390px): 1 column

### Screenshot:
📸 **Take screenshots:**
- `dashboard_with_events.png` (showing events)
- `dashboard_search.png` (search in action)
- `dashboard_empty.png` (no events found)

---

## Test 6: Create Event Page (Add Event)

### Steps:
1. Login first
2. Click "Create New Event" from dashboard
3. Navigate to `http://localhost:3000/addevent`

### What to Check:
- ✅ **Page Header**
  - Title: "Create New Event" with gradient
  - Subtitle: "Fill in the details to create your event"

- ✅ **Tab Navigation**
  - "Basic Details" tab
  - "About Event" tab
  - Active tab has purple gradient background
  - Inactive tabs have gray text

- ✅ **Basic Details Tab**
  Fields should include:
  - Event Name
  - Date (date picker)
  - Venue
  - Max Participants
  - Other basic fields

- ✅ **About Event Tab**
  Fields should include:
  - Description (textarea)
  - Speakers (list/array input)
  - Prize/Awards
  - Additional details

- ✅ **Form Styling**
  - All inputs have borders
  - Labels visible
  - Placeholder text
  - Purple accents

- ✅ **Submit Button**
  - "Create Event" or "Submit" button
  - Purple gradient
  - At bottom of form

### Interactions to Test:

**Test 1: Tab Navigation**
1. Click "Basic Details" tab
2. Verify Basic Details form shows
3. Click "About Event" tab
4. Verify About Event form shows
5. Active tab should have purple background

**Test 2: Empty Form Submission**
1. Click "Create Event" without filling
2. Expected: Validation errors
3. Required fields highlighted

**Test 3: Fill Basic Details**
1. Click "Basic Details" tab
2. Event Name: `Tech Meetup 2026`
3. Date: Select future date (e.g., `2026-03-15`)
4. Venue: `BRAC University`
5. Max Participants: `100`
6. Verify fields accept input

**Test 4: Fill About Event**
1. Click "About Event" tab
2. Description: `A meetup for tech enthusiasts to network and learn`
3. Speakers: Add `Dr. Smith, Prof. Johnson`
4. Verify textarea and input work

**Test 5: Create Event**
1. Fill all required fields
2. Click "Create Event" button
3. Expected:
   - Success message
   - Redirect to dashboard
   - New event appears in dashboard

**Test 6: Form Validation**
1. Enter invalid date (past date)
2. Enter negative max participants
3. Expected: Validation errors

### Console Verification:
1. After submitting form
2. Check Console for:
   - `POST http://localhost:8080/api/event/create`
   - Success response (201 Created)
   - Event data returned

### Network Tab:
1. Monitor Network tab during submission
2. Verify:
   - POST request to `/api/event/create`
   - Status 201
   - Response contains event ID

### Screenshot:
📸 **Take screenshots:**
- `create_event_basic.png` (Basic Details tab)
- `create_event_about.png` (About Event tab)
- `create_event_filled.png` (filled form)
- `create_event_success.png` (success message)

---

## Test 7: Event Registration Flow

### Steps:
1. Login as a user
2. Go to dashboard
3. Click on an event card

### What to Check:
- ✅ **Event Details Display**
  - Event name
  - Description
  - Date and time
  - Venue
  - Speakers
  - Available spots

- ✅ **Register Button**
  - Visible and clickable
  - Purple gradient
  - Text: "Register" or "Register for Event"

### Interactions to Test:

**Test 1: View Event Details**
1. Click on event card
2. Verify all event details shown
3. Check if modal or new page opens

**Test 2: Register for Event**
1. Click "Register" button
2. Expected:
   - Success message "Registration successful!"
   - Ticket generated
   - Button changes to "Registered" or "View Ticket"

**Test 3: View Ticket**
1. After registering
2. Navigate to "My Events" (if available)
3. Verify ticket details shown:
   - Ticket ID
   - Event name
   - Event date
   - QR code (if implemented)

**Test 4: Already Registered**
1. Try to register for same event again
2. Expected: 
   - "Already registered" message
   - Button disabled or shows "Registered"

**Test 5: Event Capacity**
1. Register multiple users (if max participants set)
2. When capacity reached
3. Expected: "Event is full" message

### Console Verification:
Check for:
- `POST http://localhost:8080/api/event/:id/register`
- Success response
- Ticket data returned

### Screenshot:
📸 **Take screenshots:**
- `event_details.png` (event details view)
- `event_register.png` (register button)
- `registration_success.png` (success message)
- `my_ticket.png` (ticket view)

---

## Test 8: My Events / User Profile

### Steps:
1. Login
2. Navigate to "My Events" or profile section

### What to Check:
- ✅ **Registered Events List**
  - All events user registered for
  - Event details (name, date)
  - Registration date
  - Attendance status

- ✅ **Ticket Information**
  - Ticket ID
  - Encrypted ticket data indicator
  - Download/view ticket option

- ✅ **User Profile Info**
  - Name
  - Email
  - Role
  - Registration date

### Interactions to Test:

**Test 1: View My Events**
1. Click "My Events" or profile
2. Verify list of registered events
3. Each event shows:
   - Event name
   - Date
   - "Attended" status

**Test 2: View Ticket**
1. Click on registered event
2. Verify ticket details shown
3. Check if ticket can be downloaded

**Test 3: Profile Edit** (if implemented)
1. Click "Edit Profile"
2. Update first name or last name
3. Save changes
4. Verify changes reflected

### Screenshot:
📸 **Take screenshots:**
- `my_events.png` (list of registered events)
- `user_profile.png` (profile page)

---

## Test 9: Organizer Features (If Implemented)

### Steps:
1. Login as organizer/admin
2. Access organizer dashboard

### What to Check:
- ✅ **My Created Events**
  - List of events created by user
  - Edit/delete options

- ✅ **Participant Management**
  - View participant list
  - Participant count
  - Mark attendance button

- ✅ **Attendance Tracking**
  - Check-in interface
  - Attendance records
  - Statistics

### Interactions to Test:

**Test 1: View My Created Events**
1. Navigate to organizer section
2. Verify created events listed
3. Click on event

**Test 2: View Participants**
1. Click "View Participants"
2. Verify participant list shown:
   - Name
   - Email
   - Registration date
   - Attendance status

**Test 3: Mark Attendance**
1. Select a participant
2. Click "Mark Attended"
3. Verify status changes
4. Check console for API call

### Console Verification:
- `GET /api/event/:id/participants`
- `POST /api/event/:id/attendance`

### Screenshot:
📸 **Take screenshots:**
- `organizer_dashboard.png`
- `participant_list.png`
- `mark_attendance.png`

---

## Test 10: Responsive Design Testing

### Device Testing:

**1. Desktop (1920x1080)**
- Press F12 → Responsive Mode
- Set to 1920 x 1080
- Test all pages
- Verify 3-column layouts

**2. Laptop (1366x768)**
- Set to 1366 x 768
- Verify content fits
- No horizontal scroll

**3. Tablet (iPad Air - 820x1180)**
- Set to iPad Air
- Verify 2-column layouts
- Touch-friendly buttons
- Readable text

**4. Mobile (iPhone 12 Pro - 390x844)**
- Set to iPhone 12 Pro
- Verify single column
- Buttons min 44px height
- No horizontal scroll
- Text readable without zoom

### What to Check on Mobile:
- ✅ Navigation becomes hamburger menu (if implemented)
- ✅ Forms are full width
- ✅ Buttons are large and touch-friendly
- ✅ Images scale properly
- ✅ Text is readable
- ✅ No content cut off

### Screenshot:
📸 **Take screenshots:**
- `desktop_view.png`
- `tablet_view.png`
- `mobile_view.png`

---

## Test 11: Performance Testing (Lighthouse)

### Steps:
1. Open Chrome browser
2. Navigate to `http://localhost:3000`
3. Press `F12` to open DevTools
4. Click "Lighthouse" tab (or ">>" if hidden)
5. Configuration:
   - Mode: Navigation
   - Device: Desktop or Mobile
   - Categories: Check all
     - ✅ Performance
     - ✅ Accessibility
     - ✅ Best Practices
     - ✅ SEO
6. Click "Analyze page load"
7. Wait for report (30-60 seconds)

### Expected Scores:
- **Performance:** 75+ (85+ ideal)
- **Accessibility:** 85+ (95+ ideal)
- **Best Practices:** 85+ (95+ ideal)
- **SEO:** 85+ (95+ ideal)

### Performance Metrics:
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Total Blocking Time (TBT): < 200ms
- Cumulative Layout Shift (CLS): < 0.1
- Speed Index: < 3.4s

### Screenshot:
📸 **Take screenshot:** `lighthouse_report.png`

---

## Test 12: Network Analysis

### Steps:
1. Open DevTools (F12)
2. Click "Network" tab
3. Reload page (Ctrl+R)
4. Observe network activity

### What to Check:
- ✅ **Total Resources**
  - Count: < 50 files
  
- ✅ **Total Size**
  - Transferred: < 3 MB
  - Resources: < 5 MB

- ✅ **Load Time**
  - DOMContentLoaded: < 1.5s
  - Load: < 3s

- ✅ **API Calls**
  - All status 200 OK
  - No 404 errors
  - No 500 errors

- ✅ **Largest Resources**
  - Identify large files
  - JavaScript bundles
  - Images

### Filter by Type:
- JS: Check bundle sizes
- CSS: Check stylesheet sizes
- Img: Check image optimization
- XHR: Check API responses

### Screenshot:
📸 **Take screenshots:**
- `network_overview.png`
- `network_api_calls.png`

---

## Test 13: Browser Console Testing

### What to Check in Console:

**✅ No Errors:**
```
✓ No red error messages
✓ No JavaScript errors
✓ No 404 (Not Found) errors
✓ No CORS errors
```

**✅ Expected Warnings Only:**
```
⚠ DevTools warnings (acceptable)
⚠ React development warnings (acceptable)
```

**✅ API Responses:**
```
✓ Successful login: "Login successful"
✓ Successful registration: "User registered"
✓ Event created: "Event created successfully"
```

### Test Each Page:
1. Home → Check console
2. Signup → Fill form → Check console
3. Login → Submit → Check console
4. Dashboard → Load events → Check console
5. Create Event → Submit → Check console

### Screenshot:
📸 **Take screenshot:** `console_no_errors.png`

---

## Test 14: Browser Compatibility

### Test on Multiple Browsers:

**1. Google Chrome (Latest)**
- Test all features
- Check DevTools

**2. Microsoft Edge (Latest)**
- Open http://localhost:3000
- Test login and signup
- Verify UI looks correct

**3. Mozilla Firefox (Latest)**
- Test all pages
- Check for differences

**4. Safari (If on Mac)**
- Test responsiveness
- Check gradient rendering

### What to Check:
- ✅ All pages load correctly
- ✅ CSS styling consistent
- ✅ JavaScript works
- ✅ Forms submit properly
- ✅ No browser-specific errors

---

## Test 15: Accessibility Testing

### Keyboard Navigation:

**Test Tab Navigation:**
1. Click in address bar
2. Press `Tab` key repeatedly
3. Verify:
   - Focus moves through all interactive elements
   - Focus indicator visible (outline/border)
   - Logical tab order
   - Can reach all buttons and links

**Test Form Submission:**
1. Tab to email input
2. Type email
3. Tab to password
4. Type password
5. Press `Enter`
6. Form should submit

### Screen Reader Testing (Optional):

**Windows Narrator:**
1. Press `Win + Ctrl + Enter`
2. Navigate through page
3. Verify text is read aloud

### Color Contrast:
- Use Lighthouse accessibility audit
- Check contrast ratios
- Minimum 4.5:1 for normal text

### Screenshot:
📸 **Take screenshot:** `accessibility_test.png`

---

## Common Issues & Troubleshooting

### Issue 1: Page Not Loading
**Solution:**
```powershell
# Check if frontend server is running
cd frontend
npm start
```

### Issue 2: Events Not Showing
**Solution:**
```powershell
# Check backend is running
cd server
npm start

# Check MongoDB is running
mongod
```

### Issue 3: Cannot Login
**Solution:**
- Clear browser cache
- Check console for errors
- Verify backend API is accessible
- Check credentials are correct

### Issue 4: Styles Not Appearing
**Solution:**
```powershell
# Rebuild Tailwind CSS
cd frontend
npm run build:css
```

### Issue 5: CORS Errors
**Solution:**
- Check `server/app.js` has CORS enabled
- Verify `cors()` middleware is used

---

## Testing Checklist

### Page Tests:
- [ ] Home page loads correctly
- [ ] Navbar navigation works
- [ ] Signup page and form validation
- [ ] Login page and authentication
- [ ] Dashboard displays events
- [ ] Search functionality works
- [ ] Create event form works
- [ ] Event registration works
- [ ] My events page works
- [ ] Profile page works

### UI/UX Tests:
- [ ] Purple/indigo theme consistent
- [ ] Buttons have hover effects
- [ ] Forms have proper validation
- [ ] Error messages display
- [ ] Success messages display
- [ ] Loading states visible
- [ ] Smooth transitions

### Responsive Tests:
- [ ] Desktop view (1920px)
- [ ] Laptop view (1366px)
- [ ] Tablet view (820px)
- [ ] Mobile view (390px)
- [ ] No horizontal scroll
- [ ] Touch-friendly buttons

### Performance Tests:
- [ ] Lighthouse score > 85
- [ ] Page load < 3s
- [ ] No console errors
- [ ] Network calls successful

### Browser Tests:
- [ ] Chrome works
- [ ] Edge works
- [ ] Firefox works
- [ ] Safari works (if available)

---

## Screenshot Organization

Create a folder: `c:\Users\AABATT\Event-Management-Application\screenshots\`

**Frontend Screenshots (15+):**
1. `home_page.png`
2. `navbar.png`
3. `signup_page.png`
4. `signup_filled.png`
5. `login_page.png`
6. `login_filled.png`
7. `dashboard_with_events.png`
8. `dashboard_search.png`
9. `create_event_basic.png`
10. `create_event_about.png`
11. `event_details.png`
12. `registration_success.png`
13. `my_events.png`
14. `desktop_view.png`
15. `mobile_view.png`
16. `lighthouse_report.png`
17. `network_overview.png`

---

## Final Report Integration

After testing, add these sections to `PROJECT_REPORT.md`:

### User Manual (Section 8):
- Use screenshots from testing
- Add step-by-step navigation guide

### Performance Analysis (Section 9):
- Add Lighthouse screenshot
- Add Network analysis screenshot
- Add mobile responsive screenshot

---

## Estimated Testing Time

- **Basic UI Testing:** 1-2 hours
- **Functionality Testing:** 2-3 hours
- **Responsive Testing:** 1 hour
- **Performance Testing:** 30 minutes
- **Screenshot Collection:** 1 hour

**Total:** 5-7 hours

---

## Quick Test Script

To quickly verify everything works:

```
1. Start backend and frontend servers
2. Open http://localhost:3000
3. Click "Sign Up" → Register new user
4. Login with new credentials
5. View dashboard → Verify events load
6. Click "Create New Event" → Fill form → Submit
7. Register for an event → Verify ticket received
8. Open DevTools → Check Lighthouse score
9. Toggle mobile view → Verify responsive
10. Check console → No errors
```

If all 10 steps pass, your frontend is working! ✅

---

**Happy Testing! 🚀**
