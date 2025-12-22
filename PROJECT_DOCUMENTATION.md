# 🏥 Clinic Management System - Frontend Documentation

## 📋 Project Overview

A professional, **offline-first** clinic management system built with React and Vite. This system is designed for medical internal medicine clinics to manage patients, queues, visits, and prescriptions efficiently.

### Key Features
- ✅ **Offline-First Architecture** - Works without internet connection
- ✅ **Mock API Layer** - Fully functional without backend
- ✅ **Easy Backend Integration** - Switch from mock to real APIs with one config change
- ✅ **Role-Based Access** - Support for Admin, Doctor, Reception, and Nurse roles
- ✅ **Professional Medical UX** - Clean, calm, and fast interface
- ✅ **Feature-Based Architecture** - Scalable and maintainable code structure

## 🧰 Tech Stack

- **Framework**: React 19.2.0
- **Bundler**: Vite (Rolldown variant)
- **Language**: JavaScript (ES6+)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📁 Project Structure

```
src/
├── app/                    # Application core
│   ├── router.jsx         # Route configuration
│   ├── providers.jsx      # App providers wrapper
│   ├── store.js           # Global Zustand stores
│   └── ProtectedRoute.jsx # Auth guard component
│
├── features/              # Feature modules
│   ├── auth/             # Authentication
│   ├── dashboard/        # Dashboard & stats
│   ├── patients/         # Patient management
│   ├── queue/            # Queue system
│   ├── visits/           # Visit records
│   └── prescriptions/    # Prescription management
│
├── services/             # API & Data layer
│   ├── api/             # API adapters
│   ├── mock/            # Mock services & data
│   └── http.js          # HTTP client
│
├── shared/              # Shared resources
│   ├── ui/             # Reusable UI components
│   ├── layout/         # Layout components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   └── constants/      # App constants
│
└── assets/             # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd frontend/ClinicSystem
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔐 Demo Credentials

The system comes with pre-configured demo users:

| Role | Username | Password |
|------|----------|----------|
| Doctor | `doctor` | `doctor123` |
| Reception | `reception` | `reception123` |
| Admin | `admin` | `admin123` |

## 🔌 API Architecture

### Mock vs Real API

The system uses an **adapter pattern** to seamlessly switch between mock and real APIs:

```javascript
// In src/services/api/config.js
export const API_CONFIG = {
  USE_MOCK: true,  // Set to false when backend is ready
  BASE_URL: 'http://localhost:3000/api',
};
```

### How It Works

1. **Mock Services** (`src/services/mock/`) - Simulate backend with delays
2. **API Adapters** (`src/services/api/`) - Proxy that switches between mock/real
3. **Components** - Always use API adapters, never directly call mock or real APIs

Example:
```javascript
import { patientApi } from '../../services/api';

// This works with both mock and real backend
const patients = await patientApi.getAllPatients();
```

## 📦 Core Features

### 1. Authentication
- Simple login with role-based access
- Persistent sessions using localStorage
- Protected routes

### 2. Dashboard
- Patient statistics
- Today's queue overview
- Quick actions
- System status indicator (Online/Offline/Syncing)

### 3. Patient Management
- Add new patients with National ID
- Search patients by name, ID, or phone
- View patient details and medical history
- Track allergies and chronic diseases

### 4. Queue System
- Add patients to daily queue
- Real-time queue status
- Priority management
- Queue number assignment

### 5. Visit Management
- Record patient visits
- Track vital signs
- Diagnosis and notes
- Visit history

### 6. Prescriptions
- Create structured prescriptions
- Medication details (dosage, frequency, duration)
- Printable prescription format
- Prescription history

## 🎨 UI Components

### Available Components

Located in `src/shared/ui/`:

- **Button** - Multiple variants (primary, secondary, success, danger, outline)
- **Input** - Form input with validation
- **Card** - Container with optional title and actions
- **Badge** - Status indicators
- **Table** - Data table with sorting
- **Modal** - Animated modal dialogs
- **StatusIndicator** - Online/Offline/Syncing indicator

### Usage Example

```javascript
import { Button, Card, Input } from '../../shared/ui';

<Card title="Patient Info">
  <Input label="Name" required />
  <Button variant="primary">Save</Button>
</Card>
```

## 🔄 State Management

### Zustand Stores

Located in `src/app/store.js`:

1. **useAuthStore** - Authentication state
2. **useSystemStore** - System status & notifications
3. **useUIStore** - UI preferences (sidebar, theme)

### Usage

```javascript
import { useAuthStore } from '../../app/store';

const { user, login, logout } = useAuthStore();
```

## 🛠️ Utilities

### Date Utilities
```javascript
import { formatDate, formatDateTime, formatRelativeTime } from '../../shared/utils';

formatDate(date, 'PPP');           // Dec 15, 2024
formatDateTime(date);               // Dec 15, 2024 at 2:30 PM
formatRelativeTime(date);           // 2 hours ago
```

### Validation
```javascript
import { validateNationalId, validatePhone, validateEmail } from '../../shared/utils';
```

### Storage
```javascript
import { storage } from '../../shared/utils';

storage.set('key', value);
storage.get('key');
storage.remove('key');
```

## 🎯 Next Steps for Backend Integration

When your backend is ready:

1. Update `src/services/api/config.js`:
   ```javascript
   USE_MOCK: false
   BASE_URL: 'https://your-api.com/api'
   ```

2. Implement real API endpoints matching the mock service contracts

3. Test each feature module independently

4. The frontend will work seamlessly!

## 📝 Development Guidelines

### Adding a New Feature

1. Create feature folder in `src/features/`
2. Add mock service in `src/services/mock/`
3. Create API adapter in `src/services/api/`
4. Add route in `src/app/router.jsx`
5. Build UI components

### Code Style

- Use functional components with hooks
- Keep components small and focused
- Use Tailwind for styling
- Follow the existing folder structure

## 🐛 Troubleshooting

### Common Issues

**Issue**: Components not rendering
- Check browser console for errors
- Verify all imports are correct

**Issue**: API calls failing
- Check `API_CONFIG.USE_MOCK` is set to `true`
- Verify mock data exists

**Issue**: Routing not working
- Check route definitions in `router.jsx`
- Verify component imports

## 📄 License

This project is part of a clinic management system. All rights reserved.

## 👥 Support

For questions or issues, please contact the development team.

---

**Built with ❤️ for medical professionals**

