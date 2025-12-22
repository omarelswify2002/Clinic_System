# 🏥 Clinic Management System

> A professional, offline-first clinic management system built with React, Vite, and modern web technologies.

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.5-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

**Login Credentials:**
- Doctor: `doctor` / `doctor123`
- Reception: `reception` / `reception123`
- Admin: `admin` / `admin123`

## ✨ Features

- ✅ **Offline-First** - Works without internet connection
- ✅ **Patient Management** - Complete patient records with medical history
- ✅ **Queue System** - Real-time queue management for daily operations
- ✅ **Visit Tracking** - Record visits with vital signs and diagnosis
- ✅ **Prescriptions** - Create and print professional prescriptions
- ✅ **Role-Based Access** - Different views for doctors, reception, and admin
- ✅ **Mock API** - Fully functional without backend
- ✅ **Easy Integration** - Switch to real backend with one config change

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get up and running in 5 minutes
- **[Project Documentation](PROJECT_DOCUMENTATION.md)** - Complete technical documentation
- **[Backend Integration](BACKEND_INTEGRATION.md)** - API contracts and integration guide
- **[Project Summary](PROJECT_SUMMARY.md)** - Overview of what's been built

## 🏗️ Architecture

```
src/
├── app/           # Application core (router, store, providers)
├── features/      # Feature modules (auth, patients, queue, etc.)
├── services/      # API layer (mock + real API adapters)
├── shared/        # Shared components, utilities, constants
└── assets/        # Static assets
```

## 🛠️ Tech Stack

- **React 19.2** - UI framework
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **date-fns** - Date utilities

## 🎯 Core Modules

### 1. Authentication
Simple login with role-based access control

### 2. Dashboard
Overview of daily statistics and quick actions

### 3. Patient Management
- Add/edit patients
- Search by name, ID, or phone
- View medical history
- Track allergies and chronic diseases

### 4. Queue System
- Add patients to daily queue
- Track status (Waiting → In Progress → Completed)
- Priority management
- Auto-refresh

### 5. Visit Management
- Record patient visits
- Track vital signs
- Add diagnosis and notes
- View visit history

### 6. Prescriptions
- Create structured prescriptions
- Print-ready format
- Medication tracking
- Prescription history

## 🔌 Backend Integration

The system uses an **adapter pattern** for easy backend integration:

```javascript
// src/services/api/config.js
export const API_CONFIG = {
  USE_MOCK: true,  // Set to false when backend is ready
  BASE_URL: 'https://your-api.com/api',
};
```

All API contracts are documented in [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md).

## 🎨 UI Components

Reusable components available in `src/shared/ui/`:
- Button, Input, Card, Badge, Table, Modal, StatusIndicator

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## 🧪 Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📄 License

Proprietary - All rights reserved

## 🤝 Contributing

This is a proprietary project. Contact the development team for contribution guidelines.

---

**Built with ❤️ for medical professionals**

