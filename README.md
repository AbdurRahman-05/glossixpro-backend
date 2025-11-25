# GlossixPro Backend

Backend API for GlossixPro publishing platform.

## Features

- Job posting management
- Image gallery management
- Services management
- Page content management
- User authentication
- Contact form with email notifications
- Career application submissions with file uploads

## Tech Stack

- Node.js + Express
- MongoDB (via Mongoose)
- Nodemailer for email
- Multer for file uploads
- bcryptjs for password hashing

## Environment Variables

Create a `.env` file with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3002
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

## Installation

```bash
npm install
```

## Running Locally

```bash
npm start
```

## Creating Admin User

```bash
npm run create-admin
```

## API Endpoints

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Images
- `GET /api/images` - Get all images
- `GET /api/images/:category` - Get images by category
- `POST /api/images` - Create image
- `PUT /api/images/:id` - Update image
- `DELETE /api/images/:id` - Delete image

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Pages
- `GET /api/pages/:pageId` - Get page content
- `POST /api/pages/:pageId` - Update page content

### Auth
- `POST /api/login` - Admin login
- `POST /api/register` - Register user

### Other
- `POST /upload` - Upload file
- `POST /api/contact` - Submit contact form
- `POST /api/career/apply` - Submit job application

## Deployment

See [Render Deployment Guide](./DEPLOYMENT.md) for detailed instructions.

## License

Private
