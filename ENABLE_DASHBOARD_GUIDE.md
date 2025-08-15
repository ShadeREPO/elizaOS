# 🔓 Enable Dashboard Access Guide

## 🎯 Problem
ElizaOS is automatically disabling the Web UI in production mode with the log:
```
[2025-08-15 19:39:50] INFO: Web UI disabled for security (production mode)
```

## 🔧 Solution: Railway Environment Variables

You need to set these environment variables in your Railway deployment:

### **Required Environment Variables:**

#### 1. **Enable Dashboard Access**
```bash
DISABLE_DASHBOARD=false
```
OR
```bash
ELIZA_ENABLE_WEB_UI=true
```

#### 2. **Enable Custom Routes**
```bash
DISABLE_WEB_SECURITY=true
```
OR  
```bash
ENABLE_ALL_ROUTES=true
```

#### 3. **Development Mode (Alternative)**
```bash
NODE_ENV=development
```
**⚠️ Warning:** This disables production optimizations

### **Recommended Setup (Secure Dashboard Access):**

```bash
# Keep production optimizations but enable dashboard
NODE_ENV=production
DISABLE_DASHBOARD=false
ELIZA_ENABLE_WEB_UI=true

# Enable custom routes
ENABLE_ALL_ROUTES=true

# Keep security with API key
API_KEY=zK=ogGk@LJZfb58qMB&e%VPnRx+H0!w?
REQUIRE_API_KEY=true

# Existing CORS (already working)
ALLOWED_ORIGINS=https://eliza-os-sooty.vercel.app
```

## 🚀 How to Set These in Railway

### Method 1: Railway Dashboard
1. Go to your Railway project
2. Click on your ElizaOS service  
3. Go to **Variables** tab
4. Add each environment variable above

### Method 2: Railway CLI
```bash
railway login
railway environment
railway variables set DISABLE_DASHBOARD=false
railway variables set ELIZA_ENABLE_WEB_UI=true
railway variables set ENABLE_ALL_ROUTES=true
```

## 🔍 Expected Results

After setting these variables and redeploying, you should see:

### ✅ **Working Endpoints:**
- `https://your-app.railway.app/` ✅ Dashboard accessible
- `https://your-app.railway.app/health` ✅ Health check working  
- `https://your-app.railway.app/helloworld` ✅ Custom plugin routes
- `https://your-app.railway.app/api/*` ✅ All APIs (already working)

### 📋 **Updated Startup Logs:**
```
[2025-08-15 19:39:50] INFO: Web UI enabled for development access
[2025-08-15 19:39:50] INFO: Dashboard available at: http://localhost:3000
[2025-08-15 19:39:50] INFO: Custom routes enabled
```

## 🔒 Security Considerations

**Keep these security measures:**
- ✅ API key authentication (`REQUIRE_API_KEY=true`)
- ✅ CORS restrictions (`ALLOWED_ORIGINS` set)  
- ✅ Rate limiting (already configured)

**Optional additional security:**
- Set dashboard password: `DASHBOARD_PASSWORD=your-secure-password`
- Restrict dashboard by IP: `DASHBOARD_ALLOWED_IPS=your.ip.address`

## 🎯 Quick Action Items

1. **Add to Railway variables:**
   - `DISABLE_DASHBOARD=false`
   - `ENABLE_ALL_ROUTES=true`

2. **Redeploy or restart** your Railway service

3. **Test endpoints:**
   - Dashboard: `https://elizaos-production-2d55.up.railway.app/`
   - Health: `https://elizaos-production-2d55.up.railway.app/health`  
   - Plugin: `https://elizaos-production-2d55.up.railway.app/helloworld`

This will give you full access to the dashboard and custom routes while maintaining API security! 🚀
