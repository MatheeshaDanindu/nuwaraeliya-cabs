
# Nuwaraeliya Cabs

>This repository contains the full-stack codebase for the Nuwaraeliya Cabs booking platform, including both the React frontend and Node.js/Express backend.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later recommended)
- npm (v8 or later)
- PostgreSQL database (for backend)

### Installation
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd nuwaraeliya-cabs
   ```
2. Install dependencies for both backend and frontend:
   ```sh
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

---

## 🖥️ Running the App

### Backend
- Configure your environment variables in `backend/.env` (see code comments for required variables).
- Start the backend server:
  ```sh
  cd backend
  npm start
  ```
- The backend runs on [http://localhost:5000](http://localhost:5000) by default.

### Frontend
- Start the React development server:
  ```sh
  cd frontend
  npm start
  ```
- The frontend runs on [http://localhost:3000](http://localhost:3000) by default.

---

## 📁 Project Structure

- `backend/` — Node.js/Express API, PostgreSQL integration, business logic
- `frontend/` — React app (components, pages, contexts, styles)
- `uploads/` — User-uploaded files (created at runtime)
- `package.json` — Root project metadata

---

## 📝 Features
- User registration and login (with file upload and admin approval)
- Browse and filter available vehicles
- Book rides with package and driver selection
- Profile management and booking history
- Admin dashboard for managing vehicles, drivers, packages, and bookings
- Stripe integration for advance payments
- Email notifications for booking and payment events

---

## 🔗 Useful Links
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Documentation](https://reactjs.org/)
- [Express Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## ⚙️ Advanced
- For advanced configuration, deployment, and troubleshooting, see the documentation in each subfolder and code comments.

---

## 📣 Notes
- This project is for demonstration and educational purposes. For production use, review security, environment variable management, and deployment best practices.
