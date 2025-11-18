# Vihara Management System - Frontend

This repository contains two React applications for the Vihara (Buddhist temple) management system:
- **Admin Dashboard** (`admin/`) - Administrative interface for temple management
- **Public Website** (`public/`) - Public-facing website for temple visitors and members

## Project Structure

```
frontend/
├── admin/          # Admin Dashboard React application
├── public/        # Public Website React application
└── README.md       # This file
```

---

## Admin Dashboard

React-based admin dashboard for managing the Vihara (Buddhist temple) management system. This is the administrative interface where temple administrators can manage all aspects of the temple operations.

### Features

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
- **Activity Logs**: View all admin activities

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API server running (see backend README)

### Installation

1. Navigate to the admin directory:
   ```bash
   cd frontend/admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend/admin` directory:
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

### Available Scripts

#### `npm start`
Runs the app in development mode. The page will reload when you make changes.

#### `npm run build`
Builds the app for production to the `build` folder. The build is optimized for production.

#### `npm test`
Launches the test runner in interactive watch mode.

#### `npm run eject`
**Note: This is a one-way operation.** Ejects from Create React App configuration.

### Environment Variables

Create a `.env` file in the `frontend/admin` directory:

```
REACT_APP_API_URL=http://localhost:5000
```

**Important**: Never commit the `.env` file to version control. It is already included in `.gitignore`.

### Project Structure

```
frontend/admin/
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

### Key Features

#### Authentication
- Secure login with JWT tokens
- Automatic token refresh
- Protected routes

#### QR Code Features
- QR code generation for event registrations
- QR code scanning for attendance tracking
- QRIS generation for donation payments

#### Payment Integration
- Midtrans payment integration
- QRIS code generation and display
- Transaction status management
- Manual transaction sync with Midtrans

#### File Upload
- Image compression before upload
- Support for gallery and merchandise images
- Base64 encoding for QRIS images

### Technologies Used

- React 18.2.0
- React Router DOM 6.8.1
- Axios for API calls
- React Icons for icons
- React Toastify for notifications
- QRCode library for QR code generation
- QR Scanner for QR code scanning

### Deployment

#### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

#### Deploy to Vercel

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

### Notes

- The admin dashboard requires authentication to access
- All API calls are made to the backend server configured in `REACT_APP_API_URL`
- QRIS codes are automatically generated when creating donation events
- Transaction statuses are updated via Midtrans webhooks
- Image uploads are compressed before sending to reduce file size

---

## Public Website

React-based public-facing website for the Vihara (Buddhist temple). This is the website that temple visitors and members can access to view temple information, events, announcements, and make donations.

### Features

- **Home Page**: Welcome page with temple information
- **Announcements**: View temple announcements and updates
- **Events**: Browse upcoming temple events and activities
- **Gallery**: View temple photos organized by categories
- **Donations**: Make donations through Midtrans payment integration
- **Merchandise**: Browse and view temple merchandise
- **Organizational Structure**: View temple leadership and organizational structure
- **About Us**: Learn about the temple

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API server running (see backend README)

### Installation

1. Navigate to the public directory:
   ```bash
   cd frontend/public
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend/public` directory:
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

### Available Scripts

#### `npm start`
Runs the app in development mode. The page will reload when you make changes.

#### `npm run build`
Builds the app for production to the `build` folder. The build is optimized for production.

#### `npm test`
Launches the test runner in interactive watch mode.

#### `npm run eject`
**Note: This is a one-way operation.** Ejects from Create React App configuration.

### Environment Variables

Create a `.env` file in the `frontend/public` directory:

```
REACT_APP_API_URL=http://localhost:5000
```

**Important**: Never commit the `.env` file to version control. It is already included in `.gitignore`.

### Project Structure

```
frontend/public/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── Home.js
│   │   ├── Pengumuman.js
│   │   ├── Kegiatan.js
│   │   ├── Galeri.js
│   │   ├── Donasi.js
│   │   ├── Merchandise.js
│   │   ├── StrukturOrganisasi.js
│   │   ├── AboutUs.js
│   │   └── Layout.js
│   ├── App.js
│   └── index.js
└── package.json
```

### Key Features

#### Responsive Design
- Built with Tailwind CSS for responsive layouts
- Mobile-friendly interface
- Modern and clean design

#### Donation System
- View active donation events
- Make donations through Midtrans payment gateway
- Support for QRIS payment method
- Real-time transaction status updates

#### Content Display
- Dynamic content loading from backend API
- Image galleries with category filtering
- Event listings with details
- Announcement feed

### Technologies Used

- React 19.2.0
- React Router DOM 7.9.4
- React Icons 5.2.1
- Tailwind CSS 3.4.0
- Axios (via backend API)

### Styling

This project uses Tailwind CSS for styling. The configuration is in `tailwind.config.js`.

### Deployment

#### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

#### Deploy to Vercel

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

### Notes

- The public website does not require authentication
- All content is fetched from the backend API
- Payment integration uses Midtrans for secure transactions
- Images are served from the backend uploads directory
- The website is optimized for SEO and performance

---

## Development Workflow

### Running Both Applications Locally

1. **Start the backend server** (from the `backend/` directory):
   ```bash
   cd backend
   npm start
   ```

2. **Start the admin dashboard** (from the `frontend/admin/` directory):
   ```bash
   cd frontend/admin
   npm start
   ```
   Runs on http://localhost:3000

3. **Start the public website** (from the `frontend/public/` directory):
   ```bash
   cd frontend/public
   npm start
   ```
   Runs on http://localhost:3001 (or next available port)

### Environment Variables

Both applications require the `REACT_APP_API_URL` environment variable to be set in their respective `.env` files pointing to your backend API URL.

## Common Issues

### CORS Errors
If you encounter CORS errors, ensure:
- The backend CORS configuration includes your frontend URLs
- Environment variables are correctly set
- The backend server is running and accessible

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Check Node.js version compatibility (v14 or higher)
- Clear `node_modules` and reinstall if needed

### API Connection Issues
- Verify `REACT_APP_API_URL` is set correctly
- Check that the backend server is running
- Verify network connectivity and firewall settings

