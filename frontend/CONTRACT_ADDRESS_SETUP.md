# Contract Address Configuration

The Terminal Header includes a clickable contract address display that users can copy to their clipboard. This address is now configurable via environment variables.

## Setup

### 1. Environment Variable Configuration

Add your contract address to your `.env.local` file:

```env
# Contract Address - The blockchain contract address to display in header
VITE_CONTRACT_ADDRESS=your-actual-contract-address-here
```

### 2. Example Addresses

**Ethereum Mainnet Example:**
```env
VITE_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

**Solana Example:**
```env
VITE_CONTRACT_ADDRESS=AbCdEfGhIjKlMnOpQrStUvWxYz123456789
```

### 3. Development vs Production

**Development (`.env.local`):**
```env
VITE_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

**Production (deployment environment):**
```env
VITE_CONTRACT_ADDRESS=0xYourActualContractAddress123456789
```

## Features

- **Click to Copy**: Users can click the contract address to copy it to clipboard
- **Truncated Display**: Shows first 6 and last 4 characters (e.g., `0x1234...5678`)
- **Copy Feedback**: Shows checkmark confirmation when copied
- **Fallback**: Uses default address if environment variable is not set
- **Cross-Platform**: Works on both desktop and mobile devices

## Deployment Notes

### Railway/Vercel/Netlify
Set the environment variable in your deployment platform's environment settings:
- Variable Name: `VITE_CONTRACT_ADDRESS`
- Variable Value: Your actual contract address

### Docker
Add to your Dockerfile or docker-compose.yml:
```dockerfile
ENV VITE_CONTRACT_ADDRESS=your-contract-address
```

### Manual Build
Ensure the environment variable is set before building:
```bash
export VITE_CONTRACT_ADDRESS=your-contract-address
npm run build
```

## Security Note

This environment variable is exposed to the client-side code and will be visible in the built JavaScript bundle. Only use public contract addresses that are meant to be shared with users.
