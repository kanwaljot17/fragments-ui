# macOS Setup Guide for Fragments UI

This guide will help you set up and run the Fragments UI project on your MacBook.

## Prerequisites

### 1. Install Node.js and npm

**Option A: Using Homebrew (Recommended)**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (includes npm)
brew install node
```

**Option B: Download from Official Website**
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the macOS installer (LTS version recommended)
3. Run the installer and follow the instructions

**Verify Installation:**
```bash
node --version  # Should show v14 or higher
npm --version   # Should show version number
```

### 2. Install Git (if not already installed)

```bash
# Check if git is installed
git --version

# If not installed, install via Homebrew
brew install git
```

## Project Setup

### 1. Clone or Navigate to the Project

If you have the project files, navigate to the project directory:
```bash
cd /path/to/fragments-ui
```

If you need to clone from GitHub:
```bash
git clone https://github.com/kanwaljot17/fragments-ui.git
cd fragments-ui
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- `parcel` (build tool)
- `amazon-cognito-identity-js` (AWS authentication)
- `oidc-client-ts` (OAuth client)

### 3. Set Up Environment Variables

**Important:** Parcel reads environment variables from a `.env` file. Create one in the project root:

```bash
# Create .env file
cat > .env << 'EOF'
API_URL=http://ec2-54-224-105-205.compute-1.amazonaws.com:8080
AWS_COGNITO_POOL_ID=us-east-1_wEBJivNbO
AWS_COGNITO_CLIENT_ID=6fspvdp6egvu25v30f462b2i2k
OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234
EOF
```

Or manually create a `.env` file in the project root with:
```
API_URL=http://ec2-54-224-105-205.compute-1.amazonaws.com:8080
AWS_COGNITO_POOL_ID=us-east-1_wEBJivNbO
AWS_COGNITO_CLIENT_ID=6fspvdp6egvu25v30f462b2i2k
OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234
```

**Note:** For local development, `OAUTH_SIGN_IN_REDIRECT_URL` should be `http://localhost:1234`. If you're deploying, update it to your production URL.

### 4. Start the Development Server

```bash
npm start
```

Or use the dev script:
```bash
npm run dev
```

The server will start on `http://localhost:1234`

### 5. Open in Browser

Open your browser and navigate to:
```
http://localhost:1234
```

## Troubleshooting

### Port Already in Use

If port 1234 is already in use, you can:
1. Kill the process using the port:
   ```bash
   lsof -ti:1234 | xargs kill -9
   ```
2. Or change the port in `package.json` scripts:
   ```json
   "start": "parcel src/index.html --port 3000"
   ```

### Node Version Issues

If you encounter compatibility issues:
```bash
# Check your Node version
node --version

# If needed, use nvm to manage Node versions
brew install nvm
nvm install 18
nvm use 18
```

### Permission Errors

If you get permission errors:
```bash
# Fix npm permissions (if needed)
sudo chown -R $(whoami) ~/.npm
```

### Module Not Found Errors

If you see module not found errors:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Working

1. Make sure `.env` file is in the project root (same level as `package.json`)
2. Restart the development server after creating/modifying `.env`
3. Check that variable names match exactly (case-sensitive)

## Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
fragments-ui/
├── src/
│   ├── index.html    # Main HTML file
│   ├── app.js        # Application logic
│   ├── api.js        # API integration
│   ├── auth.js       # Authentication
│   └── styles.css    # Styling
├── dist/             # Built files (generated)
├── node_modules/     # Dependencies (generated)
├── .env              # Environment variables (create this)
├── package.json      # Project configuration
└── README.md         # Project documentation
```

## Features

- **Authentication**: Secure login with AWS Cognito
- **Fragment Management**: Create, view, and manage text fragments
- **Modern UI**: Clean, responsive design
- **Hot Reload**: Automatic page refresh during development

## Next Steps

1. Make sure the backend API is running and accessible
2. Test the login functionality
3. Create and view fragments
4. Customize the UI as needed

## Need Help?

- Check the main `README.md` for more details
- Review browser console for error messages
- Verify all environment variables are set correctly
- Ensure the backend API is accessible



