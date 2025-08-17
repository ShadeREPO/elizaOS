# Maintenance Mode Guide

The Purl application includes a built-in maintenance mode that can be activated via environment variables. When enabled, it displays a beautiful maintenance page with a blurred version of the cat display and blocks access to all other routes.

## Features

- **Blurred Cat Display**: Shows an animated ASCII cat in the background with blur effects
- **Centered Message**: Professional maintenance message with Purl branding
- **Route Blocking**: Completely blocks access to all application routes
- **Theme Support**: Works with both dark and light themes
- **Mobile Responsive**: Optimized for all screen sizes
- **Environment Controlled**: Easy to enable/disable via environment variables

## How to Enable Maintenance Mode

### 1. Environment Variable Setup

**For Development:**
1. Create or edit `.env.local` in the frontend directory
2. Add or modify the maintenance mode variable:
```env
VITE_MAINTENANCE_MODE=true
```

**For Production Deployment:**
Set the environment variable in your deployment platform:
```env
VITE_MAINTENANCE_MODE=true
```

### 2. Restart the Application

After setting the environment variable, restart your application:

**Development:**
```bash
cd frontend
npm run dev
```

**Production:**
Redeploy your application or restart your production server.

## How to Disable Maintenance Mode

Simply change the environment variable back to `false`:

```env
VITE_MAINTENANCE_MODE=false
```

Then restart the application.

## What Happens When Enabled

1. **Complete Route Override**: All routes (`/`, `/chat`, `/logs`, `/about`, `/docs`, etc.) are blocked
2. **Maintenance Page Display**: Users see a centered maintenance message with:
   - Animated ASCII cat in the background (blurred)
   - "Purl is Sleeping" message
   - "Purl is Dreaming" status indicator with pulsing animation
   - Link to @futurepurl X account for updates
3. **No Navigation**: Header, footer, and navigation are completely hidden
4. **Theme Preservation**: Maintains the user's selected theme (dark/light)

## Customization

The maintenance page can be customized by editing:

- **Message Content**: `frontend/components/MaintenancePage.jsx`
- **Styling**: Maintenance styles in `frontend/index.css` (search for "MAINTENANCE PAGE STYLES")
- **Animation**: Cat animation states and timing in the MaintenancePage component

## Use Cases

- **Server Maintenance**: When Purl needs to rest during backend work
- **Feature Deployments**: When Purl is learning new abilities
- **Emergency Situations**: Quick way to put Purl to sleep temporarily  
- **Scheduled Downtime**: Planned nap times for our digital cat

## Technical Implementation

- **Environment Check**: `import.meta.env.VITE_MAINTENANCE_MODE === 'true'`
- **Route Blocking**: Conditional rendering in App.jsx before router setup
- **Component**: Self-contained MaintenancePage component with animated background
- **Styling**: Dedicated CSS section with theme support and responsive design

## Example .env.local File

```env
# Frontend Environment Variables

# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_KEY=

# Maintenance Mode - Set to 'true' to enable
VITE_MAINTENANCE_MODE=true
```

The maintenance mode provides a professional and on-brand way to handle downtime while keeping users informed that Purl is simply taking a well-deserved nap.
