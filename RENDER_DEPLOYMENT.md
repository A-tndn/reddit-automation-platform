# Render Deployment Configuration

This app has been optimized for deployment on Render. Follow these configuration steps:

## Required Render Service Settings

### Build Configuration
```
Build Command: npm ci && npm run build && mkdir -p server/public && cp -r dist/public/* server/public/
Start Command: npm run start
```

### Environment Variables
Set these in Render Dashboard → Environment:
```
NODE_ENV=production
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
GEMINI_API_KEY=your_gemini_api_key
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Health Check Configuration
```
Health Check Path: /api/health
```

### Node.js Version
**CRITICAL:** Set Node version to 20.16.x in Render Dashboard → Settings → Environment:
- Either add to package.json: `"engines": {"node": "20.16.x"}`
- Or manually set in Render Dashboard: Environment → NODE_VERSION = 20.16.0
- The .node-version file (20.16.0) is included but Render prioritizes package.json engines

## Optimizations Implemented

✅ **Production Middleware**
- Helmet for security headers with CSP allowing Google Fonts
- Gzip compression for better performance
- CORS handling with environment-based origin allowlist

✅ **Graceful Shutdown**
- Proper SIGTERM/SIGINT handling for container environments
- Server cleanup on shutdown

✅ **Error Handling**
- Production-safe error handling (no stack trace exposure)
- JSON error responses

✅ **Static Asset Serving**
- Optimized static file serving from server/public
- Build process copies client assets to correct location

✅ **Health Monitoring**  
- /api/health endpoint returns service status
- Includes Reddit API, Gemini AI, and queue system status

## Performance Features

- **Compression**: Automatic gzip compression in production
- **Security Headers**: Helmet provides security headers including CSP
- **Static Caching**: Express static file serving with proper headers
- **Error Boundaries**: Graceful error handling without crashes

## Deployment Steps

1. Connect your GitHub repository to Render
2. Create a new Web Service  
3. Set the build and start commands above
4. Add all environment variables
5. Set health check path to `/api/health`
6. Add the engines field to package.json if possible
7. Deploy!

Your app will be available at `https://your-service-name.onrender.com`