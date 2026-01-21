# 🧠 NestPay Backend – Rental & Property Management API

NestPay Backend is a **scalable REST API** built using **Node.js, Express, and MongoDB** that powers the NestPay rental and property management platform.

It handles **authentication, property management, tenant allocation, rent generation, and payment tracking**, following clean architecture and real-world rental workflows.

---

## 🚀 Core Features

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control
- Secure protected APIs
- Centralized error handling

### 🏢 Property & Unit APIs
- Create and manage properties
- Add units under properties
- Track unit availability
- Clean property–unit relations

### 👥 Tenant Management
- Add, update, and deactivate tenants
- Tenant status handling (Active / Inactive)
- Contact and address storage
- Tenant history support

### 🔗 Allocation Engine
- Allocate tenants to units
- Prevent double allocation
- Store billing day per allocation
- Maintain allocation lifecycle

### 💰 Rent Due System
- Automatic monthly rent generation
- Anniversary-based billing logic
- Separate RentDue schema
- Paid / Unpaid / Overdue tracking

### 💳 Payment Module
- Razorpay-ready payment integration
- One-time rent payments
- Payment verification & storage
- Transaction history per tenant

---

## 🧠 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB & Mongoose**
- **JWT Authentication**
- **Razorpay Integration**
- RESTful API architecture

---



