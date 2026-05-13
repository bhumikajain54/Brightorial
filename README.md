# Brightorial - JobSahi Platform

Brightorial is a comprehensive job portal and education management platform. It consists of a robust Laravel-based backend API and a modern React-based management dashboard.

## 🏗️ Project Architecture

The project is split into two main components:

- **[jobsahi-API](./jobsahi-API)**: The backend service built with Laravel 12, handling business logic, database management, and authentication.
- **[jobsahi-dashboard](./jobsahi-dashboard)**: The frontend administration portal built with React 18, Vite, and TailwindCSS.

---

## 🚀 Key Features

- **User Management**: Comprehensive roles for Students, Recruiters, Faculty, and Admin.
- **Job Portal**: Post, manage, and track job applications.
- **Student Management**: track student profiles, courses, and batch assignments.
- **Course & Batch Management**: Manage educational content and student groupings.
- **Staff Management**: Faculty and instructor oversight.
- **Analytics Dashboard**: Visual data representation using Chart.js.
- **Notifications & Referrals**: Integrated communication and referral systems.
- **Export Capabilities**: Export data to Excel (XLSX) and PDF (jsPDF).

---

## 🛠️ Tech Stack

### Backend (`jobsahi-API`)
![Laravel](https://img.shields.io/badge/laravel-%23FF2D20.svg?style=for-the-badge&logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/php-%23777BB4.svg?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

- **Framework**: Laravel 12.x
- **Language**: PHP 8.2+
- **Database**: MySQL / SQLite
- **Tools**: Artisan, Composer, Tinker

### Frontend (`jobsahi-dashboard`)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PrimeReact](https://img.shields.io/badge/primereact-%2320232a.svg?style=for-the-badge&logo=primereact&logoColor=white)

- **Framework**: React 18 (Vite)
- **UI Library**: PrimeReact & TailwindCSS
- **State/Routing**: Axios, React Router DOM
- **Charts**: Chart.js & React-Chartjs-2
- **Utilities**: SweetAlert2, React Toastify, Quill (Rich Text Editor)

---

## ⚙️ Getting Started

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js (v18+) & npm
- MySQL Server

### 1. Backend Setup (`jobsahi-API`)
```bash
cd jobsahi-API
composer install
cp .env.example .env
php artisan key:generate
# Configure your database in .env
php artisan migrate
php artisan serve
```

### 2. Frontend Setup (`jobsahi-dashboard`)
```bash
cd jobsahi-dashboard
npm install
npm run dev
```

---

## 📡 API Integration
The frontend communicates with the backend via the `apiService` utility. Major modules include:
- `faculty/`: Staff management endpoints.
- `institute/`: Student and institute-level data.
- `courses/`: Curriculum management.
- `batches/`: Class/Batch scheduling.

Refer to [API Integration Summary](./jobsahi-dashboard/API_INTEGRATION_SUMMARY.md) for detailed endpoint mapping.

---

## 📄 License
This project is licensed under the MIT License.