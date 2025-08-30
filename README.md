# 📝 DevnovateBlog

A modern, full-stack blogging platform built with the MERN stack, featuring admin controls, analytics, real-time commenting, and a beautiful responsive design.

![DevnovateBlog](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-Latest-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)

## 🌟 Features

### 📖 Core Blog Features

- **Rich Text Editor**: Advanced markdown editor with syntax highlighting
- **Blog Management**: Create, edit, publish, and draft blog posts
- **Tagging System**: Organize content with customizable tags
- **SEO Optimization**: Meta tags, descriptions, and search engine friendly URLs
- **Reading Time Estimation**: Automatic calculation of estimated reading time
- **Featured Images**: Upload and manage blog featured images with Cloudinary

### 👥 User Management

- **Authentication**: Secure JWT-based authentication system
- **User Profiles**: Customizable user profiles with avatars and social links
- **Role-based Access**: Admin and regular user roles with different permissions
- **Social Integration**: Connect Instagram, GitHub, LinkedIn profiles

### 💬 Interactive Features

- **Commenting System**: Threaded comments with like functionality
- **Blog Reactions**: Like and engagement system for posts
- **User Following**: Follow/unfollow other users
- **Activity Tracking**: Track user engagement and activities

### 📊 Analytics & Admin

- **Admin Dashboard**: Comprehensive admin panel for content management
- **Blog Analytics**: Detailed analytics for views, likes, comments, and engagement
- **User Analytics**: Track user registrations, activity, and demographics
- **Performance Metrics**: Blog performance tracking and trending analysis
- **Content Moderation**: Approve, reject, or moderate blog submissions

### 🎨 Design & UX

- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark/Light Theme**: Beautiful UI with modern design principles
- **Smooth Animations**: Framer Motion powered animations
- **Loading States**: Elegant loading spinners and skeleton screens
- **Interactive Charts**: Data visualization with Recharts

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **React Hook Form** - Form handling and validation
- **React Query** - Server state management
- **Recharts** - Chart and data visualization library

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image upload and management
- **Nodemailer** - Email service
- **Express Validator** - Input validation
- **Helmet** - Security middleware

### DevOps & Tools

- **Vercel** - Frontend deployment
- **MongoDB Atlas** - Database hosting
- **Cloudinary** - Image CDN
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/gupta-ashwani/DevnovateBlog.git
   cd DevnovateBlog
   ```

2. **Install dependencies**

   ```bash
   npm run install-all
   ```

3. **Environment Setup**

   Create `.env` file in the `backend` directory:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

   Create `.env` file in the `frontend` directory:

   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   ```

4. **Start Development Servers**

   ```bash
   npm run dev
   ```

   This will start:

   - Backend server on `http://localhost:5000`
   - Frontend server on `http://localhost:3000`

## 📁 Project Structure

```
DevnovateBlog/
├── backend/                 # Backend Node.js application
│   ├── src/
│   │   ├── config/         # Database and service configurations
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB/Mongoose models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── server.js           # Express server entry point
│   └── package.json
├── frontend/               # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main App component
│   ├── public/             # Static assets
│   └── package.json
└── README.md
```

## 🎯 Key Features Breakdown

### Admin Dashboard

- **Blog Management**: Approve, reject, edit, and moderate all blog submissions
- **User Management**: View user statistics, manage accounts, and monitor activity
- **Analytics**: Comprehensive analytics dashboard with charts and metrics
- **Content Overview**: Track blog performance, engagement, and trending content

### User Experience

- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Fast Loading**: Optimized images, lazy loading, and efficient data fetching
- **SEO Friendly**: Meta tags, structured data, and search engine optimization
- **Accessibility**: WCAG compliant design with proper ARIA labels

### Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Cross-origin resource sharing protection
- **Rate Limiting**: API rate limiting to prevent abuse

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Backend (Render)

1. Set up MongoDB Atlas cluster
2. Configure environment variables
3. Deploy to preferred hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Team

- **Developer**: [Ashwani Gupta](https://github.com/gupta-ashwani)
- **LinkedIn**: [Sukriti Saraswati](https://www.linkedin.com/in/sukriti-saraswati-258451273/)

## 📞 Contact

- **Email**: devnovateblog@gmail.com
- **Instagram**: [@i.ashwani.gupta](https://www.instagram.com/i.ashwani.gupta)
- **GitHub**: [gupta-ashwani](https://github.com/gupta-ashwani)

⭐ **Star this repository if you found it helpful!**
