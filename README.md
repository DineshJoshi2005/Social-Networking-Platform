# Conexis - Modern Professional Networking Platform

**Conexis** is a full-stack, real-time professional networking platform built with the MERN stack (MongoDB, Express, React, Node.js), Socket.io, and Tailwind CSS. It enables professionals to connect, share updates, direct message in real time, manage network invitations, and customize their career profiles.

---

## 🌟 Key Features

- **🔐 Authentication & Security**
  - User signup and login with secure password hashing via `bcryptjs`.
  - Stateless authentication using JSON Web Tokens (JWT) stored in secure HTTP-only cookies.
  - Route protection on both client and server sides.

- **📰 Feed & Interactive Posts**
  - Create, publish, and view posts with rich text and images (uploaded via Cloudinary).
  - Instant optimistic liking and unliking (0ms perceived latency).
  - Real-time comment threads with instant Socket.io broadcasting.
  - Post creation directly updates feeds without requiring page reloads.

- **💬 Real-Time Direct Messaging (Chat)**
  - Real-time 1-on-1 messaging powered by Socket.io.
  - Zero-latency optimistic message delivery with server confirmation.
  - Real-time unread message counters and instant "seen" receipts.
  - Searchable connection list with last interaction details.

- **👥 Network & Connection Management**
  - Send, accept, decline, and withdraw connection requests.
  - Real-time connection status sync across active tabs (`Connect`, `Pending`, `Accept`, `Connected`).
  - Dedicated Network hub to view pending invitations and browse accepted connections.

- **🔔 Live Notifications & Real-Time Badges**
  - Instant notifications for post likes, comments, and accepted connection requests.
  - Real-time unread badge counts on navigation icons (Alerts, Messages, Network).
  - Notification management (dismiss individual notifications or clear all).

- **🔍 Global Responsive Search**
  - Real-time search by user full name and username.
  - Full-screen responsive dropdown on mobile and floating search on desktop.
  - Instant connection actions directly from search results.

- **👤 Comprehensive Profile Customization**
  - Dynamic user profile page with customizable avatar and banner/cover photos.
  - Edit basic info, headline, location, and bio.
  - Manage skills, education background, and work experience.

- **🎨 Themes & Modern UI/UX**
  - Full-screen dark mode (`#0f0b09`, `#17120e`, `#2d1c15`) and clean light mode.
  - Warm energetic color palette (`#E73F1E`, `#FB6C00`, `#F9B637`, `#FFDD9C`).
  - Skeleton loading states across all data views (feed, chat, network, and notifications).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (Heroicons 2, Feather Icons)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Real-Time Client**: [Socket.io-client](https://socket.io/)
- **Date Formatting**: [Moment.js](https://momentjs.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Real-Time Engine**: [Socket.io](https://socket.io/)
- **Media Storage**: [Cloudinary](https://cloudinary.com/) via [Multer](https://github.com/expressjs/multer)
- **Security**: [JSON Web Tokens (JWT)](https://jwt.io/), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), `cookie-parser`, `cors`

---

## 📁 Project Structure

```text
LinkedIn/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js          # Cloudinary configuration
│   │   └── db.js                  # MongoDB database connection
│   ├── controllers/
│   │   ├── auth.controller.js     # User registration, login, logout
│   │   ├── connection.controller.js # Send, accept, reject, remove connections
│   │   ├── message.controller.js  # Send, fetch messages, mark seen
│   │   ├── notification.controller.js # Fetch, clear notifications
│   │   ├── post.controller.js     # Create post, like/unlike, comments
│   │   └── user.controller.js     # Profiles, updates, search, badges
│   ├── middlewares/
│   │   ├── isAuth.js              # JWT authentication middleware
│   │   └── multer.js              # File upload middleware
│   ├── models/
│   │   ├── connection.model.js    # Connection schema
│   │   ├── message.model.js       # Direct message schema
│   │   ├── notification.model.js  # Notification schema
│   │   ├── post.model.js          # Post & comment schema
│   │   └── user.model.js          # User profile schema
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── connection.route.js
│   │   ├── message.route.js
│   │   ├── notification.route.js
│   │   ├── post.route.js
│   │   └── user.route.js
│   ├── index.js                   # Server entry point
│   ├── socket.js                  # Socket.io connection and event handlers
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/                # Static assets (default profile image, etc.)
│   │   ├── components/
│   │   │   ├── ConnectButton.jsx  # Context-aware connection action button
│   │   │   ├── EditProfile.jsx    # Modal editor for profile, skills, education
│   │   │   ├── Nav.jsx            # Top navbar with live search and badge counters
│   │   │   └── Post.jsx           # Feed post component (likes, comments)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Server URL and global auth state
│   │   │   ├── ThemeContext.jsx   # Light / Dark theme management
│   │   │   └── UserContext.jsx    # Current user, feed posts, badges, profiles
│   │   ├── pages/
│   │   │   ├── Chat.jsx           # Real-time messaging conversation view
│   │   │   ├── Home.jsx           # Main feed and suggested connections
│   │   │   ├── Login.jsx          # User login page
│   │   │   ├── Network.jsx        # Invitations and connections management
│   │   │   ├── Notification.jsx   # Live activity and alerts
│   │   │   ├── Profile.jsx        # User and member profile views
│   │   │   └── Signup.jsx         # User registration page
│   │   ├── App.jsx                # Application root router and auth gating
│   │   ├── index.css              # Tailwind and global stylesheet
│   │   ├── main.jsx               # React entry point
│   │   └── socket.js              # Socket.io client instance
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- [Cloudinary](https://cloudinary.com/) account for image uploads

---

### 1. Clone the Repository
```bash
git clone https://github.com/DineshJoshi2005/Social-Networking-Platform.git
cd Social-Networking-Platform
```

---

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
```

---

### 3. Install Dependencies & Start the Backend

```bash
cd backend
npm install
npm run dev
```
The backend server will run on `http://localhost:8000`.

---

### 4. Install Dependencies & Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```
The frontend application will run on `http://localhost:5173`.

---

## 🧪 Production Build

To test and compile the production bundle for the frontend:

```bash
cd frontend
npm run build
```

---

## 📄 License

This project is licensed under the ISC License.
