# BDC Admin Dashboard

React-based admin dashboard for managing the Vihara (Buddhist temple) management system. This is the administrative interface where temple administrators can manage all aspects of the temple operations.

## Features

- **Dashboard Overview**: View statistics and recent activities
- **Announcement Management**: Create, edit, and delete temple announcements
- **Event Management**: Manage temple events and activities
- **Registration Management**: View and manage event registrations
- **Attendance Tracking**: QR code scanning for event attendance
- **Member Management**: Manage congregation members (Umat)
- **Gallery Management**: Upload and organize temple photos with categories
- **Donation Management**: 
  - Create donation events
  - Generate QRIS codes for payments
  - View and manage donation transactions
  - Sync transactions with Midtrans
- **Merchandise Management**: Manage temple merchandise inventory
- **Feedback Management**: View and respond to member feedback
- **Organizational Structure**: Manage temple leadership structure
- **Broadcast System**: Send emails to congregation members
- **Schedule Management**: Manage temple schedules and categories
- **Activity Logs**: View all admin activities with IP address tracking

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API server running (see backend README)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd frontend-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

   For production:
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   ```

4. Start the development server:
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

### `npm start`
Runs the app in development mode. The page will reload when you make changes.

### `npm run build`
Builds the app for production to the `build` folder. The build is optimized for production.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run eject`
**Note: This is a one-way operation.** Ejects from Create React App configuration.

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:5000
```

**Important**: Never commit the `.env` file to version control. It is already included in `.gitignore`.

## Project Structure

```
frontend-admin/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── Dashboard.js
│   │   ├── Login.js
│   │   ├── Sidebar.js
│   │   ├── PengumumanManagement.js
│   │   ├── KegiatanManagement.js
│   │   ├── PendaftaranManagement.js
│   │   ├── AbsensiManagement.js
│   │   ├── UmatManagement.js
│   │   ├── GaleriManagement.js
│   │   ├── SumbanganManagement.js
│   │   ├── MerchandiseManagement.js
│   │   ├── SaranManagement.js
│   │   ├── StrukturManagement.js
│   │   ├── AdminManagement.js
│   │   ├── InfoUmumManagement.js
│   │   ├── JadwalManagement.js
│   │   ├── BroadcastEmail.js
│   │   ├── ActivityLog.js
│   │   └── QRScan.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── RefreshContext.js
│   ├── hooks/
│   │   ├── useEscapeKey.js
│   │   └── useOutsideClick.js
│   ├── utils/
│   │   └── imageCompression.js
│   ├── App.js
│   └── index.js
└── package.json
```

## Key Features

### Authentication
- Secure login with JWT tokens
- Automatic token refresh
- Protected routes
- Logout activity tracking

### QR Code Features
- QR code generation for event registrations
- QR code scanning for attendance tracking
- QRIS generation for donation payments

### Payment Integration
- Midtrans payment integration
- QRIS code generation and display
- Transaction status management
- Manual transaction sync with Midtrans

### File Upload
- Image compression before upload
- Support for gallery and merchandise images
- Base64 encoding for QRIS images

### Activity Logging
- Comprehensive activity tracking
- IP address logging
- Monthly automatic log cleanup
- View all admin actions

## Technologies Used

- React 18.2.0
- React Router DOM 6.8.1
- Axios for API calls
- React Icons for icons
- React Toastify for notifications
- QRCode library for QR code generation
- QR Scanner for QR code scanning

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `REACT_APP_API_URL`: Your backend API URL

## Notes

- The admin dashboard requires authentication to access
- All API calls are made to the backend server configured in `REACT_APP_API_URL`
- QRIS codes are automatically generated when creating donation events
- Transaction statuses are updated via Midtrans webhooks
- Image uploads are compressed before sending to reduce file size
- Activity logs are automatically cleared monthly
- All admin actions are logged with IP addresses
