# 💊 E-Inject

## 📝 Overview
**E-Inject** is a modern medicine-based e-commerce platform that aims to provide a seamless digital pharmacy experience. It enables users to browse, order, and track medicines from anywhere, anytime. The platform is being developed using the MERN stack (MongoDB, Express.js, React.js, Node.js) and ensures secure authentication & ordering through JWT-based access control.

**Tagline:** _"Your Trusted Digital Medicine Store"_

---

## 🚀 Key Features

| Feature | Description |
|--------|-------------|
| **🔐 JWT Authentication** | Secure user authentication & authorization using JWT based auth in Node backend |
| **💊 Browse Medicines** | Users can explore medicine categories, brands, and product types |
| **🛒 Add to Cart & Ordering** | Users can add medicines to the cart and place secure orders |
| **📦 Order Tracking** | Track real-time order status |
| **🛠 Admin Panel** | Admin See user details and manage orders |
| **📂 Data Storage**          | Store user data and medicines information in [MongoDB](https://www.mongodb.com/). 

---

## 🧰 Tech Stack (Planned)

| Technology | Purpose |
|------------|----------|
| **MongoDB** | NoSQL database for storing products & orders |
| **Express.js** | Backend REST API development |
| **React.js** | Frontend UI development |
| **Node.js** | Backend runtime environment |
| **JWT** | Authentication mechanism |
| **GitHub** | Version control & team collaboration |

---

## Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack-planned)
- [Screens / Pages](#screens--pages)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running The Application](#running-the-application)
- [Future Enhancements / Roadmap](#future-enhancements--roadmap)
- [Contact](#contact)

---

## Screens / Pages
> **Screenshots Coming Soon**  
Below sections will show UI preview once designs completed.

- Homepage
- Category / Browse Medicines Page
- Prescription Upload Page
- Cart Page
- Checkout Page
- User Orders Page
- Admin Dashboard Page
- Medicine Details Page

---

## Installation

```sh
git clone https://github.com/yourusername/e-inject.git
cd e-inject
cd backend
npm install
cd ../frontend
npm install
```
## Environment Variables
Create a .env file in the backend directory and add the following environment variables:
```sh
DB_URL="your_mongodb_connection_string"
PORT=5000
JWT_SECRET_KEY="your_jwt_secret_key"
```
Running the Application
Start the backend server:
```sh
cd backend
npm run dev
```
Start the frontend development server:
```sh
cd frontend
npm run dev
```
