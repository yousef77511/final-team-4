# MedBridge — Medical Supply Redistribution Platform
**Developed by Protons Engineering Team (Team 4) · 2026**

MedBridge is a full-stack healthcare platform engineered to bridge the gap between surplus medical resources (medications, PPE, and equipment) and underserved healthcare facilities (hospitals, clinics, and NGOs) through an audited, verified workflow.

---

## 🌟 Key Features

1. **Dashboard & Dynamic Analytics:**
   - Real-time aggregated metrics on redistributed items, verified partner institutions, and lives impacted.
   - Dynamic synchronization with MySQL database and seamless resilient fallback.

2. **Supply Catalog & Search:**
   - Live inventory with full-text search across item names, lot numbers, and categories.
   - Category filtering: PPE & Protection, Medical Equipment, Pharmaceuticals, and Consumable Supplies.

3. **Donor Posting Wizard:**
   - Guided 3-step listing workflow with real-time summary confirmation and batch code tracking.
   - Direct integration with backend safety review pipeline.

4. **Safety Review Queue (Inspector Portal):**
   - Quality control mechanism for doctors and compliance officers.
   - Approvals immediately publish items to the live catalog; rejected lots are flagged and logged.

5. **Hospital Wishlist & Needs Fulfillment:**
   - Healthcare facilities post critical resource deficits with urgency indicators (High, Medium, Low).
   - Donors can claim and fulfill needs with one click.

6. **Logistics Handover Verification:**
   - 6-digit secure dispatch PIN and dynamic QR code generation for handover verification.

7. **Account Portal & Organization Accreditation:**
   - Role-based account flows (Donor, Healthcare Organization, Reviewer, Admin).
   - Document upload verification portal for healthcare operating licenses and tax certificates.

8. **Audit Trail & Team Messaging:**
   - Immutable activity audit log recording all administrative and user operations.
   - Interactive coordination messenger with logistics dispatch and healthcare providers.

---

## 🏗️ Architecture & Project Structure

```
d:\Final team 4\
├── BACKEND/
│   └── main.py              # Flask RESTful API server with static serving & MySQL connector
├── DATABASE/
│   └── main.sql             # Relational MySQL schema (Tables, Foreign Keys, & Initial Seeds)
├── fronted/
│   ├── index.html           # Single-Page Application (SPA) structure
│   ├── index.js             # Client state manager & async REST client
│   └── style.css            # Complete design system with light/dark theme support
└── README.md                # Project documentation & deployment manual
```

---


## 📡 RESTful API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the web application frontend |
| `GET` | `/api/health` | Service health status and MySQL connectivity check |
| `GET` | `/api/stats` | Aggregated platform statistics |
| `GET` | `/api/donations` | List donations (supports `status` and `type` filters) |
| `POST` | `/api/donations` | Create a new donation listing |
| `PUT / PATCH` | `/api/donations/<id>` | Update donation listing details |
| `DELETE` | `/api/donations/<id>` | Remove a donation listing |
| `GET` | `/api/requests` | List active hospital wishlist requests |
| `POST` | `/api/requests` | Submit an urgent facility supply request |
| `PATCH` | `/api/requests/<id>` | Update request status (`open`, `fulfilled`, `cancelled`) |
| `POST` | `/api/inspections` | Record safety inspection and update donation status |
| `GET` | `/api/inspections/donation/<id>` | Retrieve inspection logs for a donation |
| `GET` | `/api/deliveries` | Retrieve delivery records |
| `POST` | `/api/deliveries` | Create delivery verification and mark item delivered |
| `GET` | `/api/organizations` | List verified and pending healthcare organizations |
| `POST` | `/api/organizations` | Register a new healthcare organization |
| `PATCH` | `/api/organizations/<id>` | Update organization accreditation verification |
| `POST` | `/api/auth/login` | Authenticate user/donor/organization |
| `POST` | `/api/auth/register` | Register new user profile |
| `GET` | `/api/audit-logs` | Retrieve platform audit history |
| `POST` | `/api/audit-logs` | Record a new audit activity entry |

---

## 🛡️ Database Schema (MySQL)

- **`Users`**: Donors, reviewers, admins, and healthcare staff.
- **`Organizations`**: Licensed hospitals, pharmacies, elderly homes, and NGOs.
- **`Categories`**: Medicine, Equipment, PPE, and Consumables.
- **`Donations`**: Surplus supplies with batch, expiry, status, and donor linkage.
- **`Requests`**: Facility needs with quantity, urgency level, and fulfillment status.
- **`Inspections`**: Clinical safety audits and approvals.
- **`Matches` & `Deliveries`**: Real-time logistics tracking and handover records.
- **`MedicineDetails` & `EquipmentDetails`**: Clinical lot records and maintenance flags.

---

## 👥 Protons Engineering Team (Team 4)
- **Yousef** — Team lead
- **Marwa** — Team member
- **Moaz** — Team member
- **Yomna** — Team member
