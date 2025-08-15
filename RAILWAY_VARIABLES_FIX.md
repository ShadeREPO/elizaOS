# 🔧 Railway Variables Fix - Enable Dashboard & Custom Routes

## 🎯 Problem Identified
You have most variables set correctly, but ElizaOS core specifically looks for these exact variable names:

- `ENABLE_WEB_UI=true` ← **MISSING**
- `ENABLE_CUSTOM_ROUTES=true` ← **MISSING**

## ✅ Add These Variables to Railway

**In your Railway dashboard, add:**

```bash
ENABLE_WEB_UI=true
ENABLE_CUSTOM_ROUTES=true
```

## 📋 Complete Variable Set (Updated)

Keep all your existing variables AND add the two above:

```bash
# Your existing variables (KEEP THESE)
ALLOWED_ORIGINS="https://eliza-os-sooty.vercel.app"
API_KEY="UIxtS%cen8KGBN*3uHO6q0+rjozsaEM9"
API_ONLY_MODE="false"
DISABLE_DASHBOARD="false"
ELIZA_ENABLE_WEB_UI="true"
ENABLE_ALL_ROUTES="true"
NODE_ENV="production"
# ... all your other variables

# ADD THESE NEW ONES
ENABLE_WEB_UI="true"
ENABLE_CUSTOM_ROUTES="true"
```

## 🚀 Steps to Fix

1. **Go to Railway Dashboard**
2. **Select your ElizaOS service**
3. **Click "Variables" tab**
4. **Add new variables:**
   - Variable: `ENABLE_WEB_UI` Value: `true`
   - Variable: `ENABLE_CUSTOM_ROUTES` Value: `true`
5. **Save** (Railway will auto-redeploy)

## 🔍 Expected Result

After adding these and redeploying, you should see in logs:
```
[2025-08-15 19:39:50] INFO: Web UI enabled for development access
[2025-08-15 19:39:50] INFO: Dashboard available at: http://localhost:3000
[2025-08-15 19:39:50] INFO: Custom routes enabled
```

And these URLs should work:
- ✅ `https://elizaos-production-2d55.up.railway.app/` (Dashboard)
- ✅ `https://elizaos-production-2d55.up.railway.app/health` (Health check)
- ✅ `https://elizaos-production-2d55.up.railway.app/helloworld` (Plugin route)

## 🔄 Alternative (If Above Doesn't Work)

If ElizaOS still blocks it, try temporarily changing:
```bash
NODE_ENV="development"
```

This will definitely enable dashboard, but you'll lose some production optimizations. You can change it back to `production` once we confirm dashboard access works.
