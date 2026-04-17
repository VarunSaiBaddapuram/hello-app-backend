# 🌐 HELLO Messaging - Backend API

This is the production-grade Node.js backend for the **HELLO** Cyberpunk Messaging Application. It is built with a focus on high-performance real-time communication, modular MVC architecture, and enterprise-level security.

---

## 🚀 Key Features

- **Real-Time Communication**: Native WebSocket integration for instant message delivery.
- **Enterprise Security**: 
  - `Helmet.js` configuration for secure HTTP headers.
  - `Express-Mongo-Sanitize` to prevent NoSQL injection attacks.
  - `Express-Rate-Limit` to neutralize DDoS and AI-driven brute-force bot attacks.
- **Advanced Logging**: 
  - Request logging via `Morgan`.
  - Forensic error tracking and daily rotation via `Winston` (see `/logs`).
- **Health Monitoring**: Dedicated `/health` endpoint for monitoring system vitals (RAM, Uptime, DB status).

---

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-Time**: WS (WebSockets)
- **Authentication**: JWT (JSON Web Tokens) with HttpOnly Cookies
- **Logging**: Winston & Morgan

---

## 📦 Setup & Installation

1. **Clone the repository** and navigate to this directory:
   ```bash
   cd api
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in this directory and populate the following:
   ```env
   MONGO_URL=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_key
   CLIENT_URL=http://localhost:5173
   PORT=4040
   ```

4. **Start the Server**:
   ```bash
   # Production mode
   npm start
   
   # Development mode (auto-reload)
   npm run dev
   ```

---

## 🛣️ API Documentation (Endpoints)

- `GET /health` - System health and vitals status.
- `POST /register` - Register a new user signature.
- `POST /login` - Authenticate and establish a session.
- `POST /logout` - Terminate session and clear tokens.
- `GET /profile` - Retrieve current user identity.
- `GET /people` - List all established entities.
- `GET /messages/:userId` - Retrieve chat history for a specific link.

---

## 🏛️ Architecture

The backend follows a strict **MVC (Model-View-Controller)** pattern:
- `/controllers`: Business logic and data orchestration.
- `/models`: Database schemas and validation.
- `/routes`: Network endpoint definitions.
- `/middlewares`: Security, Authentication, and Rate Limiting filters.
- `/ws`: WebSocket logic and payload sanitization.
- `/config`: Database and Logger initialization.
