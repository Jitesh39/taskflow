# TaskFlow – Team Task Manager

TaskFlow is a full-stack web application designed to help teams manage projects, assign tasks, and track progress efficiently. It includes role-based access control where Admins manage workflows and Members execute assigned tasks.

---

## Live Demo

Frontend: https://taskflow-seven-henna.vercel.app/login
Backend API: https://taskflow-backend-production-f71b.up.railway.app

---

## Features

1. Authentication

* User signup and login
* JWT-based authentication
* Role-based access (Admin and Member)

2. Project Management

* Create and manage projects
* Assign multiple members to a project
* View project details and assigned team

3. Task Management

* Admin can create and assign tasks
* Members can view their assigned tasks
* Task status updates:

  * Pending
  * In Progress
  * Completed

4. Dashboard

* Displays total tasks
* Completed tasks
* Pending tasks (includes In Progress)
* Overdue tasks

5. Notifications (Real-Time)

* When Admin assigns a task, the member receives a notification
* When a member updates task status, Admin receives a notification
* Built using Socket.io for real-time updates
* Notification count shown on bell icon

6. Proof Upload

* Members upload screenshots when marking tasks as completed
* Images are stored on Cloudinary
* Admin can view submitted proof

7. User Management (Admin)

* Admin can change user roles
* Admin can suspend or activate users
* Suspended users cannot log in

---

## Tech Stack

Frontend

* React.js / Next.js
* Bootstrap / Tailwind CSS

Backend

* Node.js
* Express.js

Database

* MongoDB Atlas

Other Tools

* Socket.io (real-time communication)
* Cloudinary (image storage)
* JWT (authentication)

---

## Installation and Setup

1. Clone the repository

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

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

3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

---

## Deployment

* Frontend is deployed on Vercel
* Backend is deployed on Railway

---

## Folder Structure

```
/frontend
/backend
  /models
  /routes
  /controllers
```

---

## Demo Video

https://your-demo-video-link.com

---

## Author

Jitesh Kumar
B.Tech Computer Science and Engineering

---

## Note

This project was developed as part of a full-stack assignment to demonstrate practical implementation of REST APIs, role-based access control, real-time features, and deployment.

---

