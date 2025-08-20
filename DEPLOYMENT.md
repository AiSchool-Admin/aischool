# AiSchool Deployment Guide

This guide covers deploying AiSchool to various platforms for production use.

## 🎯 Deployment Options

### Option 1: Render.com (Recommended)
- **Pros**: Easy setup, automatic deployments, built-in PostgreSQL
- **Cons**: Cold starts on free tier
- **Best for**: MVP testing, small to medium scale

### Option 2: Vercel + Supabase
- **Pros**: Excellent Next.js support, fast global CDN
- **Cons**: Requires separate database setup
- **Best for**: High-performance applications

### Option 3: Railway
- **Pros**: Simple setup, good for full-stack apps
- **Cons**: Limited free tier
- **Best for**: Development and testing

### Option 4: Self-hosted (VPS)
- **Pros**: Full control, cost-effective at scale
- **Cons**: Requires server management
- **Best for**: Large scale or custom requirements

## 🚀 Render.com Deployment (Detailed)

### Step 1: Prepare Repository

1. **Ensure all changes are committed**:
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Verify build works locally**:
   ```bash
   npm run build
   npm start
   ```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 3: Create PostgreSQL Database

1. In Render dashboard, click "New +"
2. Select "PostgreSQL"
3. Configure:
   - **Name**: `aischool-db`
   - **Database**: `aischool`
   - **User**: `aischool_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (for testing) or Starter ($7/month)

4. **Save connection details**:
   - Internal Database URL (for your app)
   - External Database URL (for local access)

### Step 4: Create Web Service

1. Click "New +" > "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `aischool-app`
   - **Environment**: `Node`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`

### Step 5: Configure Environment Variables

In the Render dashboard, add these environment variables:

```env
# Database (use Internal Database URL from Step 3)
DATABASE_URL=postgresql://aischool_user:password@hostname:5432/aischool
DATABASE_URL_POOLER=postgresql://aischool_user:password@hostname:5432/aischool?pgbouncer=true

# NextAuth (generate a new secret for production)
NEXTAUTH_SECRET=your-production-secret-here
NEXTAUTH_URL=https://your-app-name.onrender.com

# Google OAuth (same as development)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI API (same as development)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Important**: 
- Generate a new `NEXTAUTH_SECRET` for production: `openssl rand -base64 32`
- Use the Internal Database URL from Render for `DATABASE_URL`

### Step 6: Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add to "Authorized redirect URIs":
   ```
   https://your-app-name.onrender.com/api/auth/callback/google
   ```

### Step 7: Deploy and Initialize

1. **Deploy**: Render will automatically build and deploy
2. **Run migrations**: After first deployment, go to your web service shell and run:
   ```bash
   npx prisma migrate deploy
   ```
3. **Test**: Visit your app URL and verify everything works

## 🔧 Vercel + Supabase Deployment

### Step 1: Set up Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to be ready
4. Go to Settings > Database
5. Copy connection string

### Step 2: Configure Database

1. **Update connection string** in your local `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"
   ```

2. **Push schema to Supabase**:
   ```bash
   npx prisma db push
   ```

### Step 3: Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set environment variables** in Vercel dashboard

4. **Update Google OAuth** with Vercel domain

## 🛠️ Railway Deployment

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project

### Step 2: Add Services

1. **Add PostgreSQL**:
   - Click "Add Service" > "Database" > "PostgreSQL"
   - Note the connection details

2. **Add Web Service**:
   - Click "Add Service" > "GitHub Repo"
   - Select your repository

### Step 3: Configure Environment

1. Set environment variables in Railway dashboard
2. Use the PostgreSQL connection string from Railway
3. Deploy automatically

## 🖥️ Self-Hosted Deployment (VPS)

### Prerequisites

- Ubuntu 20.04+ VPS
- Domain name pointed to your server
- SSL certificate (Let's Encrypt recommended)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Database Setup

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE aischool;
CREATE USER aischool_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE aischool TO aischool_user;
\q
```

### Step 3: Application Setup

```bash
# Clone repository
git clone https://github.com/yourusername/aischool.git
cd aischool

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your production values

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# Build application
npm run build
```

### Step 4: Process Management

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'aischool',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 5: Nginx Configuration

```bash
# Create Nginx config
sudo cat > /etc/nginx/sites-available/aischool << EOF
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/aischool /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Post-Deployment Checklist

### Functionality Testing
- [ ] Homepage loads correctly
- [ ] Google OAuth sign-in works
- [ ] Database connection is successful
- [ ] Curriculum upload works
- [ ] AI lesson generation works
- [ ] All API endpoints respond correctly

### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] AI generation times < 30 seconds
- [ ] Database queries are optimized
- [ ] No memory leaks

### Security Testing
- [ ] HTTPS is enforced
- [ ] Environment variables are secure
- [ ] No sensitive data in logs
- [ ] API endpoints require proper authentication

### Monitoring Setup
- [ ] Error tracking (Sentry recommended)
- [ ] Performance monitoring
- [ ] Database monitoring
- [ ] Uptime monitoring

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify connection string format
   - Check database server status
   - Ensure database user has proper permissions

3. **Authentication Issues**
   - Verify Google OAuth redirect URIs
   - Check NEXTAUTH_SECRET is set
   - Ensure NEXTAUTH_URL matches your domain

4. **AI Generation Failures**
   - Verify OpenAI API key is valid
   - Check API usage limits
   - Monitor for rate limiting

### Getting Help

- Check application logs
- Review deployment platform documentation
- Contact support if needed

## 🎯 Production Optimization

### Performance
- Enable caching for static assets
- Optimize database queries
- Use CDN for global distribution
- Implement rate limiting

### Security
- Regular security updates
- Database backups
- Access logging
- Intrusion detection

### Scaling
- Database connection pooling
- Horizontal scaling options
- Load balancing
- Monitoring and alerting

---

Your AiSchool platform is now ready for production deployment! Choose the option that best fits your needs and follow the detailed steps above.

