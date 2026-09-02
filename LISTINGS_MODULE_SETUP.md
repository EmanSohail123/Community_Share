# Module 2: Listings Module (Core CRUD) - Setup Guide

## ✅ What's Been Created

### Backend (Express + Mongoose)

#### 1. **Listing Model** ([server/src/models/Listing.js](server/src/models/Listing.js))
- Fields: `title`, `description`, `category` (Tool/Skill/Service), `type` (Offer/Request), `image`, `location`, `createdBy` (User reference), `timestamps`
- Validation and constraints enforced

#### 2. **Listings Routes** ([server/src/routes/listings.js](server/src/routes/listings.js))
All protected routes require authentication:
- **POST `/api/listings`** — Create a listing with image upload (multipart/form-data)
- **GET `/api/listings`** — Get all listings with filters: `category`, `keyword` (searches title/description/location), `type`, `sortBy`
- **GET `/api/listings/:id`** — Get a single listing
- **PUT `/api/listings/:id`** — Update a listing (owner only)
- **DELETE `/api/listings/:id`** — Delete a listing (owner only)
- **GET `/api/listings/user/mylistings`** — Get all listings by logged-in user

#### 3. **Cloudinary Configuration** ([server/src/config/cloudinary.js](server/src/config/cloudinary.js))
- `uploadToCloudinary()` — Upload image to Cloudinary
- `deleteFromCloudinary()` — Delete image from Cloudinary

#### 4. **Multer Middleware** ([server/src/middleware/multer.js](server/src/middleware/multer.js))
- Handles file uploads to temp directory
- File filter: Only image files (JPEG, PNG, WebP, GIF)
- Size limit: 5MB
- Auto-cleanup of temp files after upload

### Frontend (React)

#### Components
- **[ListingForm.jsx](client/src/components/ListingForm.jsx)** — Form to create/edit listings with image preview
- **[ListingCard.jsx](client/src/components/ListingCard.jsx)** — Reusable card component for listing display
- **[ListingDetails.jsx](client/src/components/ListingDetails.jsx)** — Full listing view with owner options

#### Pages
- **[CreateListingPage.jsx](client/src/pages/CreateListingPage.jsx)** — Page to create new listing
- **[BrowseListingsPage.jsx](client/src/pages/BrowseListingsPage.jsx)** — Browse all listings with search/filter
- **[ListingDetailsPage.jsx](client/src/pages/ListingDetailsPage.jsx)** — View single listing details
- **[MyListingsPage.jsx](client/src/pages/MyListingsPage.jsx)** — View and manage own listings

#### API Helper
- **[client/src/api/listings.js](client/src/api/listings.js)** — Axios-based API calls with automatic token injection

---

## 🚀 Installation Steps

### 1. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### 2. Setup Environment Variables

**Server (.env file):**
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/communityshare
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

To get Cloudinary credentials:
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard → Settings
3. Copy Cloud Name, API Key, and API Secret

### 3. Update App Router (Main App Component)

You'll need to add routes to your main App.jsx or router configuration:

```jsx
import { Routes, Route } from 'react-router-dom';
import CreateListingPage from './pages/CreateListingPage';
import BrowseListingsPage from './pages/BrowseListingsPage';
import ListingDetailsPage from './pages/ListingDetailsPage';
import MyListingsPage from './pages/MyListingsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Existing routes */}
      
      {/* Listings routes */}
      <Route path="/listings" element={<BrowseListingsPage />} />
      <Route path="/listings/:id" element={<ListingDetailsPage />} />
      <Route path="/create-listing" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
      <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
    </Routes>
  );
}
```

### 4. Update Navigation

Add navigation links to browse and create listings. Example for your navbar:

```jsx
<Link to="/listings">Browse Listings</Link>
<Link to="/create-listing">Create Listing</Link>
<Link to="/my-listings">My Listings</Link>
```

---

## 📋 API Usage Examples

### Create Listing
```javascript
const formData = new FormData();
formData.append('title', 'Electric Drill');
formData.append('description', 'Great condition, barely used');
formData.append('category', 'Tool');
formData.append('type', 'Offer');
formData.append('location', 'Brooklyn, NY');
formData.append('image', fileInput.files[0]);

const listing = await listingsAPI.create(formData);
```

### Get All Listings with Filters
```javascript
const listings = await listingsAPI.getAll({
  category: 'Tool',
  keyword: 'drill',
  type: 'Offer',
});
```

### Get User's Listings
```javascript
const myListings = await listingsAPI.getMyListings();
```

### Update Listing
```javascript
const updatedFormData = new FormData();
updatedFormData.append('title', 'Updated Title');
// ... other fields
updatedFormData.append('image', newFileIfChanged);

const updated = await listingsAPI.update(listingId, updatedFormData);
```

### Delete Listing
```javascript
await listingsAPI.delete(listingId);
```

---

## 🔑 Key Features

✅ **Full CRUD Operations** — Create, read, update, delete listings
✅ **Authentication** — All modifications require login
✅ **Image Uploads** — Integrated with Cloudinary via Multer
✅ **Search & Filter** — By keyword, category, type
✅ **Owner Authorization** — Only listing owners can edit/delete
✅ **Responsive Design** — Grid layouts that adapt to screen size
✅ **Error Handling** — User-friendly error messages
✅ **Auto Cleanup** — Temporary files cleaned up after upload

---

## 🧪 Testing the Module

1. Start the server: `npm run dev` (from server folder)
2. Start the client: `npm run dev` (from client folder)
3. Register/login
4. Navigate to "Create Listing"
5. Fill form and upload image
6. Browse listings with filters
7. Click a listing to view details
8. Edit/delete your own listings from "My Listings"

---

## ⚠️ Common Issues & Solutions

**Issue: Images not uploading**
- Check Cloudinary credentials in .env
- Ensure multer temp directory exists
- Verify file size < 5MB

**Issue: Token not sent with requests**
- Make sure you're using the listingsAPI from `/api/listings.js`
- Check that token is stored in localStorage with key `communityshare_token`

**Issue: "Only the owner can update this listing"**
- Make sure you're logged in as the user who created the listing
- Check that user.id matches the listing creator's ID in database

---

## 📁 File Structure Summary

```
server/
├── src/
│   ├── models/
│   │   └── Listing.js (NEW)
│   ├── routes/
│   │   └── listings.js (NEW)
│   ├── config/
│   │   └── cloudinary.js (NEW)
│   ├── middleware/
│   │   └── multer.js (NEW)
│   └── index.js (UPDATED)
└── .env.example (UPDATED)

client/
├── src/
│   ├── api/
│   │   └── listings.js (NEW)
│   ├── components/
│   │   ├── ListingForm.jsx (NEW)
│   │   ├── ListingCard.jsx (NEW)
│   │   └── ListingDetails.jsx (NEW)
│   └── pages/
│       ├── CreateListingPage.jsx (NEW)
│       ├── BrowseListingsPage.jsx (NEW)
│       ├── ListingDetailsPage.jsx (NEW)
│       └── MyListingsPage.jsx (NEW)
└── package.json (UPDATED)
```

Enjoy your expanded CommunityShare platform! 🎉
