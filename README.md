# 🩸 Blood Donation Management System 

A full-stack MERN application with **Multi-Role Authentication** and **Role-Based Access Control (RBAC)**.

## Roles
- **Donor** — Register, manage profile, track donations, join camps
- **Hospital** — Search blood, create emergency requests, track status
- **Admin** — Manage donors, requests, inventory, camps, reports

## Tech Stack
- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas
- **Auth:** JWT + bcrypt

## Setup

### Backend
```bash
cd backend
npm install
# Create .env file with your MongoDB URI and JWT secrets
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Default Admin
- Email: `admin@bdms.com`
- Password: `Admin@123`
