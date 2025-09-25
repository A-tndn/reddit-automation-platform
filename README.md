# Reddit Automation Platform 🤖

A modern full-stack web application that combines AI-powered content generation with automated Reddit posting capabilities. Built with React, Node.js, and powered by Google Gemini AI.

## 🚀 Features

### 🎯 Core Functionality
- **Reddit Integration**: Fetch trending posts from multiple subreddits using the Reddit API
- **AI Content Generation**: Generate relevant comments and posts using Google Gemini AI
- **Queue Management**: Manage content posting queue with priority levels and scheduling
- **Automation**: Configurable automated posting at set intervals
- **Real-time Dashboard**: Monitor system health, stats, and recent activity

### 🛠️ Advanced Features  
- **Smart Scheduling**: Schedule posts and comments for optimal timing
- **Multi-Subreddit Support**: Target multiple communities simultaneously
- **Error Handling**: Comprehensive error tracking and retry mechanisms
- **Health Monitoring**: Real-time API status and system health checks
- **Responsive UI**: Modern interface that works on desktop and mobile

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Shadcn/ui** + **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling with dark mode support
- **TanStack Query** for server state management
- **Wouter** for lightweight client-side routing

### Backend
- **Node.js** with **Express.js** framework
- **TypeScript** with ES modules for type safety
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** database with session storage
- **Helmet** for security headers and CORS handling

### External APIs
- **Google Gemini AI** for intelligent content generation
- **Reddit API** for fetching and posting content

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 20.16.x** or higher
- **PostgreSQL** database (or use the included in-memory storage for development)
- **Reddit Application** credentials ([Create here](https://www.reddit.com/prefs/apps))
- **Google Gemini API** key ([Get here](https://makersuite.google.com/app/apikey))

## 🔧 Installation

### Option 1: One-Click Render Deployment

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/A-tndn/reddit-automation-platform)

### Option 2: Manual Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd reddit-automation-platform
```

2. **Install dependencies**
```bash
npm ci
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
# Database (optional - uses in-memory storage by default)
DATABASE_URL=your_postgresql_connection_string

# Reddit API Credentials
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password

# AI Integration
GEMINI_API_KEY=your_gemini_api_key

# Production Settings
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

4. **Run the application**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The application will be available at `http://localhost:5000`

## 🎮 Usage

### 1. Configuration Setup
- Navigate to the **Configuration** page
- Add your Reddit API credentials
- Add your Google Gemini API key
- Configure automation settings

### 2. Dashboard Overview
- Monitor system health and API connectivity
- View key statistics (posts fetched, comments generated, etc.)
- Quick access to main functions

### 3. Content Management
- **Posts Page**: View fetched Reddit posts and their details
- **Queue Page**: Manage your content posting queue
- **Automation Page**: Configure automated posting intervals

### 4. Adding Content to Queue
- Manually add custom posts or comments
- Set priority levels and scheduling
- Configure target subreddits

### 5. Automation Features
- Enable automated queue processing
- Set processing intervals (minutes)
- Configure maximum posts per run
- Monitor automation activity

## 🚀 Deployment

### Render Deployment (Recommended)

This application is optimized for [Render](https://render.com) deployment:

1. **Fork/Clone this repository** to your GitHub account

2. **Create a new Web Service** on Render

3. **Configure Build & Deploy Settings:**
   - **Build Command**: `npm ci && npm run build && mkdir -p server/public && cp -r dist/public/* server/public/`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/api/health`

4. **Set Environment Variables** in Render Dashboard:
   ```
   NODE_ENV=production
   REDDIT_CLIENT_ID=your_reddit_client_id
   REDDIT_CLIENT_SECRET=your_reddit_client_secret  
   REDDIT_USERNAME=your_reddit_username
   REDDIT_PASSWORD=your_reddit_password
   GEMINI_API_KEY=your_gemini_api_key
   ALLOWED_ORIGINS=https://your-app-name.onrender.com
   ```

5. **Set Node.js Version** to `20.16.0` in Environment settings

6. **Deploy!** Your app will be available at `https://your-service-name.onrender.com`

### Other Platforms

The application can be deployed to any platform that supports Node.js applications:

- **Vercel**: Configure as a Node.js application
- **Railway**: Direct GitHub integration
- **Heroku**: Use the provided build scripts
- **DigitalOcean App Platform**: Standard Node.js configuration

## 🏛️ Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Application pages/routes
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and configurations
├── server/                # Express backend application
│   ├── services/         # External API integrations
│   │   ├── reddit.ts     # Reddit API service
│   │   ├── gemini.ts     # Google Gemini AI service
│   │   └── queue.ts      # Queue processing service
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database interface
│   └── index.ts          # Application entry point
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema and TypeScript types
└── RENDER_DEPLOYMENT.md  # Detailed deployment guide
```

## 🔒 Security Features

- **Helmet.js**: Security headers including CSP
- **CORS**: Configurable origin allowlist
- **Environment Variables**: Secure credential management
- **Session Management**: Secure server-side sessions
- **Input Validation**: Zod schema validation for all inputs

## 📊 API Documentation

### Configuration Endpoints
- `GET /api/config` - Fetch current configuration
- `POST /api/config` - Update configuration settings

### Reddit Integration
- `GET /api/posts` - Fetch stored Reddit posts
- `POST /api/posts/fetch` - Fetch new posts from Reddit
- `POST /api/posts/generate` - Generate AI-powered posts

### Queue Management
- `GET /api/queue` - Fetch queue items
- `POST /api/queue` - Add items to queue
- `POST /api/queue/process` - Process pending queue items

### System Monitoring
- `GET /api/health` - System health check
- `GET /api/stats` - Application statistics

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests and ensure code quality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for deployment-specific help
2. Review the application logs for error details
3. Ensure all environment variables are correctly configured
4. Verify your Reddit and Gemini API credentials

## 🔄 Recent Updates

- ✅ Optimized for Render deployment
- ✅ Enhanced error handling and logging  
- ✅ Improved queue processing reliability
- ✅ Added comprehensive health monitoring
- ✅ Mobile-responsive dashboard interface

---

Built with ❤️ using React, Node.js, and powered by AI