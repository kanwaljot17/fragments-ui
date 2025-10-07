# Fragments UI

A modern web application for managing and viewing text fragments with a clean, responsive interface.

## Features

- 🔐 **Authentication**: Secure login with user management
- 📝 **Fragment Management**: Create, view, and manage text fragments
- 🎨 **Modern UI**: Clean, responsive design with dark theme
- 🔄 **Real-time Updates**: Dynamic fragment loading and refreshing
- 📱 **Mobile Friendly**: Responsive design that works on all devices

## Recent Improvements

### ✅ Fixed Content-Type Handling
- **Issue**: Frontend was trying to parse all responses as JSON, causing errors with plain text fragments
- **Solution**: Implemented smart content-type detection that handles both JSON and plain text responses
- **Result**: No more "Unexpected token" errors when viewing fragments

### ✅ Enhanced Visual Design
- **Dark Theme**: Fragment boxes now use a professional dark blue-grey theme
- **High Contrast**: Light grey text on dark backgrounds for better readability
- **Orange Buttons**: Vibrant orange "View Fragment" buttons for better visibility
- **Hover Effects**: Smooth transitions and shadow effects for better user experience

### ✅ Improved User Experience
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
git clone <repository-url>
cd fragments-ui
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:1234`

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
3. **Cache issues**: Use hard refresh (`Ctrl + Shift + R`) or incognito mode

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