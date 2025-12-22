# 🔌 Backend Integration Guide

This guide explains how to integrate the frontend with your backend API.

## 📋 API Contracts

The frontend expects the following API endpoints. Your backend should implement these contracts.

### Authentication API

#### POST `/auth/login`
**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "name": "string",
    "role": "admin|doctor|reception|nurse"
  },
  "token": "string"
}
```

#### POST `/auth/logout`
**Response:**
```json
{
  "success": true
}
```

#### GET `/auth/me`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "user": { /* user object */ },
  "token": "string"
}
```

### Patient API

#### GET `/patients`
**Response:**
```json
[
  {
    "id": "string",
    "nationalId": "string",
    "firstName": "string",
    "lastName": "string",
    "dateOfBirth": "ISO date string",
    "gender": "male|female",
    "phone": "string",
    "email": "string",
    "address": "string",
    "bloodType": "string",
    "allergies": ["string"],
    "chronicDiseases": ["string"],
    "createdAt": "ISO date string"
  }
]
```

#### GET `/patients/national-id/:nationalId`
**Response:** Single patient object

#### GET `/patients/:id`
**Response:** Single patient object

#### GET `/patients/search?q={query}`
**Response:** Array of patient objects

#### POST `/patients`
**Request:** Patient object (without id and createdAt)

**Response:** Created patient object

#### PUT `/patients/:id`
**Request:** Partial patient object

**Response:** Updated patient object

#### GET `/patients/:id/visits`
**Response:** Array of visit objects for the patient

#### GET `/patients/stats`
**Response:**
```json
{
  "total": number,
  "newToday": number
}
```

### Queue API

#### GET `/queue`
**Response:**
```json
[
  {
    "id": "string",
    "patientId": "string",
    "patient": { /* patient object */ },
    "queueNumber": number,
    "status": "waiting|in_progress|completed|cancelled",
    "priority": "normal|urgent",
    "arrivalTime": "ISO date string",
    "notes": "string"
  }
]
```

#### GET `/queue/today`
**Response:** Array of today's queue items

#### POST `/queue`
**Request:**
```json
{
  "patientId": "string",
  "patient": { /* patient object */ },
  "notes": "string",
  "priority": "normal|urgent"
}
```

**Response:** Created queue item

#### PATCH `/queue/:id`
**Request:**
```json
{
  "status": "waiting|in_progress|completed|cancelled"
}
```

**Response:** Updated queue item

#### DELETE `/queue/:id`
**Response:**
```json
{
  "success": true
}
```

#### GET `/queue/stats`
**Response:**
```json
{
  "total": number,
  "waiting": number,
  "inProgress": number,
  "completed": number
}
```

### Visit API

#### GET `/visits`
**Response:** Array of visit objects

#### GET `/visits/:id`
**Response:** Single visit object

#### GET `/visits/patient/:patientId`
**Response:** Array of visits for the patient

#### POST `/visits`
**Request:**
```json
{
  "patientId": "string",
  "patient": { /* patient object */ },
  "doctorId": "string",
  "doctorName": "string",
  "chiefComplaint": "string",
  "diagnosis": "string",
  "notes": "string",
  "vitalSigns": {
    "temperature": number,
    "bloodPressure": "string",
    "heartRate": number,
    "respiratoryRate": number,
    "weight": number,
    "height": number
  }
}
```

**Response:** Created visit object with `id`, `visitDate`, and `status`

#### PUT `/visits/:id`
**Request:** Partial visit object

**Response:** Updated visit object

#### PATCH `/visits/:id/complete`
**Response:** Visit object with status "completed" and `completedAt` timestamp

#### GET `/visits/today`
**Response:** Array of today's visits

### Prescription API

#### GET `/prescriptions`
**Response:** Array of prescription objects

#### GET `/prescriptions/:id`
**Response:** Single prescription object

#### GET `/prescriptions/patient/:patientId`
**Response:** Array of prescriptions for the patient

#### GET `/prescriptions/visit/:visitId`
**Response:** Prescription for the visit (or null)

#### POST `/prescriptions`
**Request:**
```json
{
  "visitId": "string",
  "patientId": "string",
  "patient": { /* patient object */ },
  "doctorId": "string",
  "doctorName": "string",
  "medications": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string",
      "instructions": "string"
    }
  ],
  "notes": "string"
}
```

**Response:** Created prescription with `id` and `prescriptionDate`

#### PUT `/prescriptions/:id`
**Request:** Partial prescription object

**Response:** Updated prescription object

## 🔧 Integration Steps

### Step 1: Configure API Base URL

Edit `src/services/api/config.js`:

```javascript
export const API_CONFIG = {
  USE_MOCK: false,  // Switch to real API
  BASE_URL: 'https://your-backend-url.com/api',
  TIMEOUT: 30000,
};
```

### Step 2: Test Authentication

1. Start with the login endpoint
2. Verify token is returned correctly
3. Test protected routes with the token

### Step 3: Test Each Module

Test endpoints in this order:
1. Authentication
2. Patients
3. Queue
4. Visits
5. Prescriptions

### Step 4: Handle Errors

The frontend expects errors in this format:

```json
{
  "error": "Error message here"
}
```

Or the backend can throw HTTP errors (400, 401, 404, 500) and the frontend will handle them.

## 🔐 Authentication Flow

1. User logs in → Frontend sends credentials to `/auth/login`
2. Backend validates → Returns user object and JWT token
3. Frontend stores token in localStorage
4. All subsequent requests include: `Authorization: Bearer {token}`
5. Backend validates token on each request

## 📡 CORS Configuration

Your backend must allow requests from the frontend origin:

```javascript
// Example for Express.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

For production, update to your production domain.

## 🧪 Testing

### Using the Mock API as Reference

The mock services in `src/services/mock/` show exactly how the frontend expects data to be structured. Use them as a reference when building your backend.

### Gradual Migration

You can migrate one module at a time:

1. Keep `USE_MOCK: true`
2. Implement one backend module (e.g., patients)
3. Create a custom adapter that uses real API for patients, mock for others
4. Test thoroughly
5. Repeat for other modules

## 🚨 Common Issues

**CORS Errors**
- Configure CORS on your backend
- Allow the frontend origin

**401 Unauthorized**
- Check token is being sent in headers
- Verify token format: `Bearer {token}`

**Data Format Mismatch**
- Compare your API response with mock data
- Ensure field names match exactly

**Date Format Issues**
- Always use ISO 8601 format: `2024-12-15T14:30:00Z`
- The frontend uses `date-fns` to parse dates

## 📞 Support

If you encounter issues during integration:

1. Check browser console for errors
2. Check network tab to see actual API requests/responses
3. Compare with mock service contracts
4. Verify backend is returning correct data format

---

**Ready to integrate?** Start with authentication and work your way through each module!

