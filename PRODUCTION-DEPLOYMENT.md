# Production Deployment Guide for SmartDebtFlow

This guide provides detailed instructions for deploying the SmartDebtFlow application to production with all security features properly configured, including hCaptcha integration.

## Prerequisites

Before deploying to production, ensure you have:

- A domain name for your application
- Access to your production server or cloud platform (AWS, Azure, Google Cloud, etc.)
- Access to your Supabase project in production

## Deployment Checklist

### 1. Build the Application

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

The production build will be created in the `dist` directory.

### 2. Environment Setup

Create a `.env.production` file with the following variables:

```
# Supabase
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Other environment variables
# ...
```

### 3. hCaptcha Configuration

Ensure your production environment has the hCaptcha secret key set:

```bash
export SUPABASE_AUTH_CAPTCHA_SECRET="0x4AAAAAAA_KNOUHEzgNKyMZTtF5g1LSBB4"
```

### 4. Supabase Production Setup

In your Supabase Cloud project:

1. Navigate to Authentication → Settings
2. Enable email authentication
3. Configure email templates (refer to the email template guide)
4. Enable captcha protection with hCaptcha
5. Set the captcha secret key

### 5. Web Server Configuration

#### Nginx Example Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://hcaptcha.com https://*.hcaptcha.com; frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com; style-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com; img-src 'self' data: https://hcaptcha.com https://*.hcaptcha.com; connect-src 'self' https://your-production-project.supabase.co wss://your-production-project.supabase.co;" always;
    
    # Root directory and index file
    root /path/to/your/dist;
    index index.html;
    
    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    # Don't cache HTML
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
    }
}
```

### 6. Domain Allowlist for hCaptcha

Ensure your production domain is added to the allowlist in your hCaptcha dashboard:

1. Log in to the [hCaptcha dashboard](https://dashboard.hcaptcha.com/)
2. Navigate to Settings → Domains
3. Add your production domain

### 7. Deployment Options

#### Option 1: Traditional Server Deployment

```bash
# Copy build files to your server
scp -r dist/* user@your-server:/path/to/webroot/

# Set environment variables on your server
ssh user@your-server "echo 'export SUPABASE_AUTH_CAPTCHA_SECRET=\"0x4AAAAAAA_KNOUHEzgNKyMZTtF5g1LSBB4\"' >> ~/.bashrc && source ~/.bashrc"
```

#### Option 2: Docker Deployment

Create a `Dockerfile` in your project root:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create an `nginx.conf` file:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Deploy with Docker:

```bash
docker build -t smartdebtflow .
docker run -d -p 80:80 -e SUPABASE_AUTH_CAPTCHA_SECRET="0x4AAAAAAA_KNOUHEzgNKyMZTtF5g1LSBB4" smartdebtflow
```

#### Option 3: Cloud Platform Deployment

For Vercel, Netlify, or similar platforms:

1. Connect your Git repository
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Set environment variables in the platform dashboard

### 8. Post-Deployment Verification

After deploying:

1. Test user registration flow with hCaptcha
2. Verify email templates are being sent correctly
3. Test login flow
4. Check for any console errors or warnings

## Monitoring and Maintenance

### Error Monitoring

Consider implementing error tracking with a service like Sentry:

```bash
npm install @sentry/react
```

### Performance Monitoring

Set up monitoring tools like:
- Google Analytics
- Application performance monitoring (APM)
- Server monitoring

### Regular Updates

Keep your dependencies updated to ensure security and performance:

```bash
npm outdated
npm update
```

## Backup Strategy

1. Regularly backup your Supabase database
2. Keep backups of your configuration files
3. Document all custom configurations

## Rollback Plan

In case of deployment issues:

1. Keep the previous version accessible
2. Document the steps to revert to the previous version
3. Test your rollback procedure before you need it

---

By following this guide, you'll have a secure, production-ready deployment of your SmartDebtFlow application with hCaptcha protection against automated bots. 