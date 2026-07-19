# EMS

A full-stack Employee Management System with a TypeScript/Express backend and a React (Vite) frontend.

## Tech Stack

**Backend**
- Node.js + Express 5 (TypeScript, ESM)
- MongoDB with Mongoose
- JWT authentication (`jsonwebtoken`) with `bcrypt` / `bcryptjs` for password hashing
- `cookie-parser` for cookie-based auth, `cors` for cross-origin requests
- `multer` + `cloudinary` for file/image uploads
- `tsx` for local dev, compiled with `typescript`

**Frontend**
- React 19 + Vite
- TypeScript
- Tailwind CSS 4
- MUI (Material UI) + Emotion for components/styling
- ESLint for linting

## Project Structure

```
ems/
├── backend/     # Express + TypeScript API server
└── frontend/    # React + Vite client
```

## Getting Started

### Prerequisites
- Node.js (LTS)
- npm
- A MongoDB instance (local or Atlas connection string)
- A Cloudinary account (for file/image uploads)

### 1. Clone the repository

```bash
git clone https://github.com/iMved2075/ems.git
cd ems
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the variables your setup requires, e.g.:

```env
MONGODB_URI = YOUR_MONGODB_URI
DB_NAME = YOUR_DB_NAME
PORT = YOUR_PORT
CORS_ORIGIN = YOUR_CORS_ORIGIN
ACCESS_TOKEN_SECRET = YOUR_ACCESS_TOKEN_SECRET
ACCESS_TOKEN_EXPIRATION = 1d
REFRESH_TOKEN_SECRET = YOUR_REFRESH_TOKEN_SECRET
REFRESH_TOKEN_EXPIRATION = 7d

CLOUDINARY_CLOUD_NAME = YOUR_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY = YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET = YOUR_CLOUDINARY_API_SECRET
```

Run the server in dev mode:

```bash
npm run dev
```

Or build and run in production:

```bash
npm run build   # if configured
npm start
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on Vite's default dev server (typically `http://localhost:5173`) and the backend on the port set in your `.env` (e.g. `http://localhost:5000`).

## Available Scripts

**Backend**
| Script | Description |
| --- | --- |
| `npm run dev` | Run the API in watch mode via `tsx` |
| `npm start` | Run the compiled server (`dist/index.js`) |

**Frontend**
| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Features

- User authentication with JWT and hashed passwords
- Employee data management backed by MongoDB
- File/image upload support via Multer and Cloudinary
- Responsive UI built with React, MUI, and Tailwind CSS

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

## License

ISC (as declared in `backend/package.json`) — update if a different license applies to the whole project.
