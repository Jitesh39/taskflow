# 🚀 TaskFlow – Team Task Manager

A full-stack web application that allows teams to manage projects, assign tasks, and track progress with role-based access control (Admin & Member).

---

## 🌐 Live Demo

* 🔗 Frontend: https://your-frontend.vercel.app
* 🔗 Backend API: https://your-backend.railway.app

---

## 📌 Features

### 🔐 Authentication

* User Signup & Login
* JWT-based authentication
* Role-based access (Admin / Member)

---

### 📁 Project Management

* Create and manage projects
* Assign multiple members to projects
* View project details and team members

---

### ✅ Task Management

* Admin can create and assign tasks
* Members can view assigned tasks
* Task status update:

  * Pending
  * In Progress
  * Completed

---

### 📊 Dashboard

* Total Tasks
* Completed Tasks
* Pending Tasks (Pending + In Progress)
* Overdue Tasks

---

### 🔔 Notifications (Real-Time)

* Admin assigns task → Member gets notification
* Member updates status → Admin gets notification
* Socket.io based real-time updates
* Notification bell with unread count

---

### 📸 Proof Upload (Cloudinary)

* Members upload screenshots when marking task as "Completed"
* Images stored in Cloudinary
* Admin can view proof

---

### 👤 User Management (Admin)

* Change user roles (Admin / Member)
* Suspend / Activate users
* Suspended users cannot login

---

## 🛠️ Tech Stack

### Frontend

* React.js / Next.js
* Tailwind CSS / Bootstrap

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Other Tools

* Socket.io (Real-time)
* Cloudinary (Image Upload)
* JWT (Authentication)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Deployment

* Frontend deployed on **Vercel**
* Backend deployed on **Railway**

---

## 📂 Folder Structure

```
/frontend
/backend
  /models
  /routes
  /controllers
```

---

## 🎥 Demo Video

📽️ https://your-demo-video-link.com

---

## 👨‍💻 Author

Jitesh Kumar
B.Tech CSE Student

---

## 📌 Note

This project was built as part of a full-stack assignment to demonstrate:

* REST API development
* Role-based access control
* Real-time features
* Deployment skills

---

⭐ If you like this project, consider giving it a star!
