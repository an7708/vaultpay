# VaultPay Financial Core

A production-grade B2B invoicing and payment platform engineered for
Nexus Corporate Services. Built with a zero-trust security architecture,
Stripe Webhook verification, automated PDF generation, and role-based
access control enforced at every API layer.

---

## Intern Information

| Field | Details |
|---|---|
| Project Name | VaultPay Financial Core |
| Track | Fullstack |
| Intern | Anisha Madhukar |
| Cohort | Prodesk IT Internship — 2025 |
| Client Code Name | VaultPay |
| Sprint | Week 20 — Final Deliverable |

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [The Business Problem](#the-business-problem)
3. [Tech Stack](#tech-stack)
4. [Security Architecture](#security-architecture)
5. [Core Features](#core-features)
6. [API Endpoints](#api-endpoints)
7. [Folder Structure](#folder-structure)
8. [Environment Variables](#environment-variables)
9. [Getting Started](#getting-started)
10. [Deployment](#deployment)
11. [Payment Testing](#payment-testing)
12. [AI Transparency](#ai-transparency)

---

## Project Overview

VaultPay is a secure, role-based financial portal that replaces a
manual PDF invoicing workflow with a fully automated billing system.
Administrators generate invoices through a protected dashboard.
Clients log in to view only their own invoices, pay instantly via
Stripe Checkout, and automatically receive a PDF receipt by email
the moment the payment is confirmed.

The platform is built around three non-negotiable engineering
principles. Every API route is protected by JWT verification. Every
ownership check is enforced server-side to prevent IDOR attacks.
Every payment confirmation comes from Stripe's cryptographically
signed webhook — not from a client-side API call that could be
spoofed.

---

## The Business Problem

Nexus Corporate Services is a B2B consultancy firm billing clients
for contracts ranging from five thousand to fifty thousand dollars.
Their billing department generated invoices manually in Microsoft
Word, emailed them as PDFs, and waited for manual wire transfers.

The result was a 45-day average delay in accounts receivable,
frequent human error in invoice generation, and no centralized
portal for clients to view billing history or pay instantly.

VaultPay eliminates all three problems.

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | Primary database |
| Mongoose | ODM and schema validation |
| Stripe | Payment processing and webhooks |
| PDFKit | Server-side PDF receipt generation |
| Nodemailer | Automated email delivery |
| Cloudinary | Cloud storage for generated PDFs |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| express-rate-limit | API rate limiting |

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | Component-based UI framework |
| React Router v6 | Client-side routing with RBAC guards |
| Axios | HTTP client with JWT interceptor |
| Zustand | Lightweight auth state management |
| Inter (Google Fonts) | Typography |
| CSS Variables | Design system and theming |

### Infrastructure

| Technology | Purpose |
|---|---|
| Vercel | Frontend deployment |
| Render | Backend API deployment |
| MongoDB Atlas | Cloud database |
| Cloudinary | PDF storage and CDN delivery |
| Stripe | Payment and webhook infrastructure |

---

## Security Architecture

### JWT Authentication

Every protected route verifies the JWT on the server before
processing the request. The token is never trusted without
verification. Expired or tampered tokens return 401 Unauthorized
immediately.

### Role-Based Access Control

Two roles are enforced at every layer — Admin and Client. The
`adminOnly` middleware rejects any non-admin request with a 403
Forbidden response before the controller logic runs. A client
navigating to `/admin` in the browser is redirected to a 403
page by the React route guard.

### IDOR Prevention

Insecure Direct Object Reference attacks are prevented at the
controller level. When a client requests an invoice by ID, the
server checks that the invoice's `client` field matches the
authenticated user's ID. If Client A requests an invoice
belonging to Client B, the server returns 403 Forbidden
regardless of what the frontend shows.

### Stripe Webhook Signature Verification

Payment status is never updated based on a frontend API call.
The server exposes a dedicated webhook endpoint that Stripe
calls directly after a successful payment. The
`stripe.webhooks.constructEvent` method mathematically verifies
the cryptographic signature of every incoming webhook request
using the `STRIPE_WEBHOOK_SECRET`. A request that fails
signature verification is rejected with 400 Bad Request. Only
a verified webhook triggers the invoice status update, PDF
generation, and email dispatch.

---

## Core Features

### Admin Dashboard
- View total revenue, outstanding receivables, invoice counts,
  and client roster
- Create invoices with multiple line items, tax rate, due date,
  and client notes
- View all invoices across all clients

### Client Portal
- View only invoices assigned to the authenticated client
- Pay outstanding invoices via Stripe Checkout
- Download PDF receipt after payment
- Receive automated payment confirmation email with PDF attached

### Automated Post-Payment Pipeline
When Stripe confirms a payment via webhook:
1. Invoice status updated to Paid in MongoDB
2. PDF receipt generated server-side using PDFKit
3. PDF uploaded to Cloudinary
4. PDF URL saved to the invoice document
5. Payment confirmation email sent to client via Nodemailer

---

## API Endpoints
POST   /api/auth/register     Register a new user

POST   /api/auth/login        Login and receive JWT

GET    /api/auth/me           Get authenticated user (protected)

### Invoices
GET    /api/invoices/admin/all      All invoices — Admin only

GET    /api/invoices/admin/stats    Revenue stats — Admin only

POST   /api/invoices/admin/create   Create invoice — Admin only

GET    /api/invoices/my             Client's own invoices only

GET    /api/invoices/:id            Single invoice with IDOR check

### Payments
POST   /api/payments/create-checkout-session   Create Stripe session

### Webhooks
POST   /api/webhooks/stripe   Stripe webhook receiver (raw body)

---

## Folder Structure

```
vaultpay/
│
├── server/
│   ├── controllers/
│   │   ├── auth.controller.js        Register, login, getMe
│   │   ├── invoice.controller.js     CRUD with IDOR protection
│   │   ├── payment.controller.js     Stripe checkout session
│   │   └── webhook.controller.js     Webhook handler and pipeline
│   ├── middleware/
│   │   ├── auth.middleware.js         JWT protect
│   │   └── role.middleware.js         Admin-only guard
│   ├── models/
│   │   ├── User.model.js              Admin and Client schema
│   │   └── Invoice.model.js           Invoice with ownership ref
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── invoice.routes.js
│   │   ├── payment.routes.js
│   │   └── webhook.routes.js
│   ├── utils/
│   │   ├── generatePDF.js             PDFKit receipt generator
│   │   ├── sendEmail.js               Nodemailer email sender
│   │   └── uploadToCloud.js           Cloudinary PDF upload
│   ├── .env.example
│   └── index.js
│
└── client/
    └── src/
        ├── api/
        │   └── axios.js               Axios with JWT interceptor
        ├── components/
        │   └── ProtectedRoute.jsx     RBAC route guard
        ├── pages/
        │   ├── auth/
        │   │   ├── Login.jsx
        │   │   └── Register.jsx
        │   ├── admin/
        │   │   ├── AdminDashboard.jsx
        │   │   └── CreateInvoice.jsx
        │   ├── client/
        │   │   ├── ClientDashboard.jsx
        │   │   └── InvoiceDetail.jsx
        │   └── Unauthorized.jsx
        ├── store/
        │   └── useAuthStore.js        Zustand auth state
        ├── App.js
        └── App.css
```

---

## Environment Variables

### server/.env

```
PORT=5003
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vaultpay
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### client/.env

```
REACT_APP_API_URL=http://localhost:5003/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
CI=false
```

Never commit `.env` files. A `.env.example` with placeholder
values is committed instead.

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- MongoDB Atlas account
- Stripe account (test mode)
- Gmail account with App Password enabled
- Cloudinary account (free tier)

### Installation

Clone the repository.

```bash
git clone https://github.com/an7708/vaultpay.git
cd vaultpay
```

Install server dependencies.

```bash
cd server
npm install
```

Install client dependencies.

```bash
cd ../client
npm install
```

Configure environment variables.

```bash
cp server/.env.example server/.env
```

Fill in all values in `server/.env` and `client/.env`.

### Run Locally

Start the backend server.

```bash
cd server
npm run dev
```

Start the React frontend.

```bash
cd client
npm start
```

Open `http://localhost:3000` in your browser.

Register one account as Admin and one as Client to test the
full billing flow.

---

## Deployment

### Backend — Render

| Setting | Value |
|---|---|
| Root Directory | server |
| Build Command | npm install |
| Start Command | node index.js |
| Instance Type | Free |

Set all environment variables in the Render dashboard under
the Environment tab. Update `CLIENT_URL` to your Vercel URL
after frontend deployment.

### Frontend — Vercel

| Setting | Value |
|---|---|
| Root Directory | client |
| Build Command | npm run build |
| Output Directory | build |
| Framework | Create React App |

Set `REACT_APP_API_URL` to your Render backend URL and
`REACT_APP_STRIPE_PUBLISHABLE_KEY` to your Stripe publishable
key in the Vercel Environment Variables dashboard.

### Stripe Webhook — Production

After deploying to Render, go to your Stripe Dashboard,
update the webhook endpoint URL to:

```
https://your-render-url.onrender.com/api/webhooks/stripe
```

Copy the new signing secret and update `STRIPE_WEBHOOK_SECRET`
in your Render environment variables.

---

## Payment Testing

Use Stripe's test card numbers in the Stripe Checkout form.

| Scenario | Card Number |
|---|---|
| Successful payment | 4242 4242 4242 4242 |
| Payment declined | 4000 0000 0000 0002 |
| Requires authentication | 4000 0025 0000 3155 |

Use any future expiry date and any three-digit CVV.

---

## AI Transparency

AI tools were used during the development of this project as
engineering references for specific implementation challenges.
All interactions are documented in `Prompts.md` at the root
of this repository.

The key areas where AI was referenced include Stripe webhook
signature verification using `constructEvent`, PDFKit buffer
generation and streaming, Cloudinary upload stream
configuration, and IDOR prevention middleware pattern.

All architectural decisions, security logic, and code
implementation were written and reviewed by the engineer.

---

*Anisha Madhukar — Prodesk IT Internship 2026 — Final Deliverable*
