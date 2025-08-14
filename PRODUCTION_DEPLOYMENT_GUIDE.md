# 🚀 Production Deployment Guide - CORS & URL Issues Fixed

## ✅ **Issues Resolved:**

1. **All hardcoded URLs removed** from frontend components
2. **Environment variables properly configured** for production
3. **CORS settings updated** to support your deployment domains
4. **Dynamic URL resolution** based on environment

## 🎯 **Current Problem & Solution:**

### **Problem:**
- Frontend showing `elizaos-api.railway.app` (hardcoded fallback)
- CORS error: Backend only allows `https://railway.com` 
- Need to set proper environment variables

### **Solution:**
Update environment variables in both Railway and Vercel.

---

## 🔧 **Railway Backend Configuration:**

### **Step 1: Get Your Railway URL**
1. Go to your Railway project dashboard
2. Find your deployment URL (something like `https://elizaos-production-xxxx.railway.app`)
3. Copy this URL - you'll need it for the frontend

### **Step 2: Set Railway Environment Variables**
In your Railway project dashboard, add these variables:

```bash
# Core Settings
NODE_ENV=production
PORT=3000

# Security (REQUIRED)
API_KEY=zK=ogGk@LJZfb58qMB&e%VPnRx+H0!w?
DISABLE_DASHBOARD=true
API_ONLY_MODE=true

# CORS - CRITICAL: Allow your Vercel domain
ALLOWED_ORIGINS=https://eliza-os-sooty.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AI Provider (Choose ONE)
OPENAI_API_KEY=sk-your-openai-api-key
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Logging
LOG_LEVEL=warn

# Plugin Configuration
IGNORE_BOOTSTRAP=false
```

---

## 🌐 **Vercel Frontend Configuration:**

### **Step 1: Set Vercel Environment Variables**
In your Vercel project dashboard, add these variables:

```bash
# API URL - Replace with your actual Railway URL
VITE_API_URL=https://your-actual-railway-app-name.railway.app

# API Key - Same as backend
VITE_API_KEY=zK=ogGk@LJZfb58qMB&e%VPnRx+H0!w?
```

### **Your Actual Configuration:**
```bash
# Your Railway URL: https://elizaos-production-2d55.up.railway.app
VITE_API_URL=https://elizaos-production-2d55.up.railway.app
VITE_API_KEY=zK=ogGk@LJZfb58qMB&e%VPnRx+H0!w?
```

---

## 🔄 **Deployment Steps:**

### **1. Update Railway Variables**
- Add all the Railway environment variables above
- **CRITICAL:** Set `ALLOWED_ORIGINS=https://eliza-os-sooty.vercel.app`
- Railway will automatically redeploy

### **2. Update Vercel Variables** 
- Add the Vercel environment variables above
- Use your **actual Railway URL** for `VITE_API_URL`
- Trigger a new Vercel deployment

### **3. Test the Connection**
After both deployments complete:

```bash
# Test 1: Backend health check
curl https://your-railway-url.railway.app/health

# Test 2: API with authentication  
curl -H "X-API-Key: zK=ogGk@LJZfb58qMB&e%VPnRx+H0!w?" \
     https://your-railway-url.railway.app/api/agents

# Test 3: CORS from browser
# Open https://eliza-os-sooty.vercel.app
# Check browser console - should see successful API calls
```

---

## 🐛 **Troubleshooting:**

### **Still seeing CORS errors?**
1. **Check Railway environment variables** - Make sure `ALLOWED_ORIGINS` matches your Vercel domain exactly
2. **Redeploy Railway** - Environment variable changes require redeploy
3. **Wait for propagation** - Can take 1-2 minutes after deployment

### **Still seeing hardcoded URLs?**
1. **Check Vercel environment variables** - Make sure `VITE_API_URL` is set correctly
2. **Redeploy Vercel** - Environment variable changes require redeploy  
3. **Clear browser cache** - Old cached JavaScript might have hardcoded URLs

### **API returning 401 errors?**
1. **Check API key** - Make sure both Railway and Vercel have the same `API_KEY`
2. **Check headers** - Frontend should send `X-API-Key` header
3. **Check Railway logs** - Look for authentication errors

---

## 📋 **Verification Checklist:**

### **Railway Backend:**
- ✅ `ALLOWED_ORIGINS=https://eliza-os-sooty.vercel.app`
- ✅ `API_KEY=zK=ogGk@LJZfb58qMB&e%VPnRx+H0!w?`
- ✅ `NODE_ENV=production`
- ✅ `DISABLE_DASHBOARD=true`
- ✅ Health endpoint returns 200: `/health`

### **Vercel Frontend:**
- ✅ `VITE_API_URL=https://your-actual-railway-url.railway.app`
- ✅ `VITE_API_KEY=zK=ogGk@LJZfb58qMB&e%VPnRx+H0!w?`
- ✅ No hardcoded localhost URLs in console
- ✅ No CORS errors in browser console

### **Connection Test:**
- ✅ Frontend loads without errors
- ✅ API calls succeed (no 401/403/CORS errors)
- ✅ Chat functionality works
- ✅ Cat display shows data

---

## 🎉 **Success Indicators:**

Your deployment is working when:

1. **No CORS errors** in browser console
2. **No hardcoded URLs** in network requests  
3. **API calls succeed** with 200 status codes
4. **Chat interface works** with real-time responses
5. **Cat display loads data** from your Railway backend

---

## 📞 **Next Steps:**

1. **Share your Railway URL** so I can help verify the exact environment variables
2. **Update both platforms** with the correct variables
3. **Test the connection** using the verification steps above

**What's your actual Railway deployment URL?** Once you share that, I can provide the exact environment variable values to copy/paste! 🚀
