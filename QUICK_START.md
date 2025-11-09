# Quick Start Guide - macOS

## Fast Setup (5 minutes)

### 1. Install Node.js
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org
```

### 2. Navigate to Project
```bash
cd /path/to/fragments-ui
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Create .env File
```bash
cat > .env << 'EOF'
API_URL=http://ec2-54-224-105-205.compute-1.amazonaws.com:8080
AWS_COGNITO_POOL_ID=us-east-1_wEBJivNbO
AWS_COGNITO_CLIENT_ID=6fspvdp6egvu25v30f462b2i2k
OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234
EOF
```

### 5. Start the Server
```bash
npm start
```

### 6. Open Browser
Navigate to: **http://localhost:1234**

## That's it! 🎉

The app should now be running. If you encounter any issues, check:
- [SETUP_MACOS.md](./SETUP_MACOS.md) for detailed troubleshooting
- [README.md](./README.md) for full documentation

## Common Commands

```bash
npm start      # Start development server
npm run dev    # Same as npm start
npm run build  # Build for production
```

## Important Notes

- The `.env` file is required for the app to work
- Make sure port 1234 is not already in use
- The backend API must be accessible for full functionality



