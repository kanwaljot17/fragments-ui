# Fragments UI

A modern web application for managing and viewing text fragments with a clean, responsive interface.

## Features

- **Authentication**: Secure login with user management
- **Fragment Management**: Create, view, and manage text fragments
- **Modern UI**: Clean, responsive design with dark theme
- **Real-time Updates**: Dynamic fragment loading and refreshing
- **Mobile Friendly**: Responsive design that works on all devices

## Recent Improvements

### Fixed Content-Type Handling
- **Issue**: Frontend was trying to parse all responses as JSON, causing errors with plain text fragments
- **Solution**: Implemented smart content-type detection that handles both JSON and plain text responses
- **Result**: No more "Unexpected token" errors when viewing fragments

### Enhanced Visual Design
- **Dark Theme**: Fragment boxes now use a professional dark blue-grey theme
- **High Contrast**: Light grey text on dark backgrounds for better readability
- **Orange Buttons**: Vibrant orange "View Fragment" buttons for better visibility
- **Hover Effects**: Smooth transitions and shadow effects for better user experience

### Improved User Experience
- **Cache Busting**: Implemented cache-busting to ensure users always see the latest changes
- **Better Error Handling**: Robust error handling for different content types
- **Responsive Layout**: Optimized for both desktop and mobile viewing

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Build Tool**: Parcel
- **Styling**: CSS3 with modern features
- **Authentication**: Custom auth system
- **API**: RESTful API integration

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kanwaljot17/fragments-ui.git
cd fragments-ui
```

2. Install dependencies:
```bash
npm install
```

3. **Set up environment variables** (Required):
   
   Create a `.env` file in the project root with the following variables:
   ```
   API_URL=http://ec2-54-224-105-205.compute-1.amazonaws.com:8080
   AWS_COGNITO_POOL_ID=us-east-1_wEBJivNbO
   AWS_COGNITO_CLIENT_ID=6fspvdp6egvu25v30f462b2i2k
   OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234
   ```
   
   **Note:** For local development, use `http://localhost:1234` as the redirect URL. For production, update it to your production URL.

4. Start the development server:
```bash
npm start
```

5. Open your browser and navigate to `http://localhost:1234`

### macOS Users

For detailed macOS setup instructions, see [SETUP_MACOS.md](./SETUP_MACOS.md)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

1. **Login**: Click the "Login" button to authenticate
2. **Create Fragments**: Use the "Create Fragment" button to add new text fragments
3. **View Fragments**: Click "View Fragment" on any fragment to see its content
4. **Refresh**: Use the "Refresh Fragments" button to reload the fragment list

## API Integration

The application integrates with a RESTful API that supports:
- **GET** `/v1/fragments` - Retrieve all fragments for authenticated user
- **POST** `/v1/fragments` - Create new fragments
- **GET** `/v1/fragments/:id` - Retrieve specific fragment by ID

### Content Type Support
- **text/plain**: Plain text fragments (default)
- **application/json**: JSON fragments
- **Automatic detection**: The frontend automatically detects and handles both types

## Development

### Project Structure
```
src/
├── index.html      # Main HTML file
├── app.js         # Application logic
├── api.js         # API integration
├── auth.js        # Authentication
└── styles.css     # Styling (referenced but embedded in HTML)
```

### Key Features
- **Modular Architecture**: Clean separation of concerns
- **Error Handling**: Comprehensive error handling for API calls
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Semantic HTML and proper contrast ratios

## Troubleshooting

### Common Issues

1. **"Unexpected token" errors**: This was fixed in the latest version with smart content-type detection
2. **Grey text visibility**: Resolved with dark theme and high contrast colors
3. **Cache issues**: Use hard refresh (`Ctrl + Shift + R` on Windows/Linux, `Cmd + Shift + R` on macOS) or incognito mode
4. **Environment variables not working**: 
   - Make sure `.env` file exists in the project root
   - Restart the development server after creating/modifying `.env`
   - Check that variable names match exactly (case-sensitive)
5. **Port already in use**: 
   - Kill the process using port 1234, or
   - Change the port in `package.json` scripts
6. **Module not found errors**: 
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.