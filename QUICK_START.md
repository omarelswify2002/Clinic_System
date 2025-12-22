# 🚀 Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Install Dependencies
```bash
cd frontend/ClinicSystem
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Navigate to `http://localhost:5173`

### Step 4: Login
Use any of these demo credentials:

**Doctor Account:**
- Username: `doctor`
- Password: `doctor123`

**Reception Account:**
- Username: `reception`
- Password: `reception123`

**Admin Account:**
- Username: `admin`
- Password: `admin123`

## 🎯 What You Can Do

### As Reception Staff
1. **Add New Patients** - Click "Patients" → "Add Patient"
2. **Manage Queue** - Click "Queue" → "Add to Queue"
3. **Search Patients** - Use the search bar in Patients page

### As Doctor
1. **View Queue** - See waiting patients in Queue page
2. **Start Visit** - Click "Start" on a queue item
3. **View Patient History** - Click on any patient to see their medical history
4. **Create Prescriptions** - After completing a visit

### As Admin
- Full access to all features
- View system statistics on Dashboard
- Manage all patients, visits, and prescriptions

## 📊 Explore the Features

### Dashboard
- View today's statistics
- See current queue status
- Quick access to common actions

### Patients
- Complete patient database
- Search by name, ID, or phone
- View detailed medical history
- Track allergies and chronic diseases

### Queue Management
- Real-time queue updates
- Priority management
- Status tracking (Waiting → In Progress → Completed)

### Visits
- Record patient visits
- Track vital signs
- Add diagnosis and notes
- View visit history

### Prescriptions
- Create structured prescriptions
- Print-ready format
- Medication tracking
- Prescription history

## 🔧 Configuration

### Switch to Real Backend

When your backend is ready, edit `src/services/api/config.js`:

```javascript
export const API_CONFIG = {
  USE_MOCK: false,  // Change this to false
  BASE_URL: 'https://your-backend-url.com/api',
};
```

That's it! The frontend will automatically use your real backend.

## 📱 System Status

Look at the top-right corner of the header to see the system status:

- 🟢 **Online** - Connected to backend
- 🔴 **Offline** - Working locally
- 🔵 **Syncing** - Synchronizing data

(Currently always shows "Online" since we're using mock data)

## 🎨 Customization

### Change Theme Colors

Edit `tailwind.config.js` to customize colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

### Add New Features

1. Create feature folder in `src/features/`
2. Add mock data in `src/services/mock/`
3. Create API adapter in `src/services/api/`
4. Add route in `src/app/router.jsx`

## 🐛 Troubleshooting

**Problem**: Port 5173 is already in use
- **Solution**: Vite will automatically use the next available port (5174, 5175, etc.)

**Problem**: Changes not reflecting
- **Solution**: The dev server has Hot Module Replacement (HMR). Just save your file!

**Problem**: Login not working
- **Solution**: Make sure you're using the exact credentials listed above

**Problem**: Blank page
- **Solution**: Check the browser console (F12) for errors

## 📚 Learn More

- Read `PROJECT_DOCUMENTATION.md` for detailed documentation
- Check `src/features/` for feature examples
- Look at `src/shared/ui/` for available components

## 🎉 You're Ready!

Start exploring the system and building amazing features for your clinic!

---

**Need Help?** Check the full documentation in `PROJECT_DOCUMENTATION.md`

