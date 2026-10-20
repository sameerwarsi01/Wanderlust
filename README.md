# 🌍 Wanderlust — Full-Stack Vacation Rental Platform

Wanderlust ek production-ready full-stack web application hai jo Airbnb ke model par based hai. Yeh platform travelers ko unique stays, luxury villas, resorts aur apartments discover karne ki suvidha deta hai, sath hi hosts ko apni properties list karne, coordinate geocoding ke sath map par showcase karne aur authentic community reviews collect karne ka complete workflow provide karta hai.

---

## ⚡ Core Features

- **User Authentication & Authorization:** Passport.js session-based authentication (Sign Up, Log In, Log Out) aur route/action protection (sirf property owner hi listing edit ya delete kar sakta hai).
- **Listings Management (CRUD):** Nayi listings add karna with image upload, existing listings update karna, aur listings delete karna.
- **Dynamic Category Filtering:** 11+ categories (Trending, Rooms, Iconic Cities, Mountain, Castles, Amazing Pools, Camping, Farms, Arctic, Domes, Boats) ke zariye single-click data filtering.
- **Case-Insensitive Search:** Destination, title, city ya country ke basis par MongoDB regex search index.
- **Reviews & Ratings:** Starability ke sath 5-star rating system aur comments, sath hi review author ke liye delete permission.
- **Interactive Geolocation & Maps:** Nominatim OpenStreetMap geocoding integration jo location ke accurate coordinates map par render karta hai.
- **Taxes Calculator:** GST (18%) pricing display toggle switch.
- **Cloud Media Storage:** Multer aur Cloudinary CDN ke zariye safe aur optimized image storage.
- **Responsive Layout:** Bootstrap 5 aur custom CSS ke through mobile, tablet aur desktop sabhi devices par clean view.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | EJS (Embedded JavaScript), Bootstrap 5, FontAwesome, CSS3 (Flexbox & Grid), Vanilla JS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | Passport.js, Passport-Local, Express-Session, Connect-Flash |
| **File Storage** | Cloudinary, Multer, Multer-Storage-Cloudinary |
| **External APIs** | OpenStreetMap Nominatim Geocoding API |
| **Architecture** | Model-View-Controller (MVC) Pattern |

---

## 📂 Project Architecture

```text
MAJORPROJECT/
├── controllers/          # Business logic handlers (listings, reviews, users)
├── init/                 # Sample data & DB seeding scripts (data.js, index.js)
├── models/               # Mongoose database models (listing.js, review.js, user.js)
├── public/               # Client-side static assets (CSS, client JS, images)
├── routes/               # Express routing modularization (listing.js, review.js, user.js)
├── utils/                # Error utilities (ExpressError.js, wrapAsync.js)
├── views/                # EJS server-rendered templates (layouts, includes, listings)
├── .env                  # Environment configuration secrets
├── app.js                # Express app entrypoint & configuration
├── cloudConfig.js        # Cloudinary SDK & storage configuration
├── middleware.js         # Route guards, ownership check & schema validations
└── package.json          # Node dependencies & project metadata
```

---

## ⚙️ Local Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local server or MongoDB Atlas URI)
- Cloudinary Account (Free tier credentials)

### Step-by-Step Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/SameerWarsi/wanderlust.git](https://github.com/SameerWarsi/wanderlust.git)
   cd wanderlust
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Project ke root directory me `.env` file banayein aur ye keys dalein:
   ```env
   PORT=8080
   ATLASDB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/wanderlust
   SECRET=your_super_secret_session_key
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   ```

4. **Seed Database with Sample Listings (Optional):**
   ```bash
   node init/index.js
   ```

5. **Start Application Server:**
   ```bash
   node app.js
   # Or using nodemon:
   npx nodemon app.js
   ```

6. **Access Application:**
   Browser open karke visit karein: `http://localhost:8080/listings`

---

## 🔒 Security Best Practices Implemented

- **Session Hardening:** HttpOnly session cookies aur dynamic secret sessions.
- **Access Control:** Server-level authentication check taaki koi unauthenticated user unauthorized POST/PUT/DELETE requests manipulate na kar sake.
- **Input Sanitization:** Client-side HTML5 validation ke sath backend Joi schema verification.
- **Centralized Error Handling:** Custom `ExpressError` class aur `wrapAsync` wrapper jo unhandled promise rejections aur runtime crashes ko cleanly handle karta hai.

---

## 👨‍💻 Developer & Author

**Md Sameer Warsi**  
Full-Stack Web Developer  
- **GitHub:** [@SameerWarsi](https://github.com/)  
- **LinkedIn:** [Md Sameer Warsi](https://linkedin.com/)