// Fragments UI - Main JavaScript file
// This integrates with auth.js for Cognito authentication

import { signIn, signOut, getUser } from "./auth.js";

// Configuration
const CONFIG = {
  API_URL: process.env.API_URL || "http://localhost:8080",
};

// Global state
let currentUser = null;

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", async function () {
  console.log("Fragments UI initialized");

  // Check if user is already authenticated
  await checkAuthStatus();

  // Set up event listeners
  setupEventListeners();

  // Check API status
  checkApiStatus();
});

// Check authentication status
async function checkAuthStatus() {
  try {
    const user = await getUser();
    if (user) {
      currentUser = user;
      updateUI();
      console.log("User is authenticated:", user);
    } else {
      currentUser = null;
      updateUI();
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
    currentUser = null;
    updateUI();
  }
}

// Set up event listeners
function setupEventListeners() {
  // Login button
  const loginBtn = document.getElementById("login");
  if (loginBtn) {
    loginBtn.addEventListener("click", handleSignIn);
  }

  // Add sign out button if user is authenticated
  // We'll add this dynamically in updateUI()
}

// Handle sign in
async function handleSignIn() {
  try {
    console.log("Initiating sign in...");
    await signIn();
  } catch (error) {
    console.error("Error signing in:", error);
    showMessage("Error signing in. Please try again.", "error");
  }
}

// Handle sign out
async function handleSignOut() {
  try {
    console.log("Signing out...");
    await signOut();
  } catch (error) {
    console.error("Error signing out:", error);
    showMessage("Error signing out. Please try again.", "error");
  }
}

// Update UI based on authentication state
function updateUI() {
  const loginSection = document.querySelector("nav");
  const userSection = document.getElementById("user");
  const usernameSpan = document.querySelector(".username");

  if (currentUser) {
    // User is authenticated
    loginSection.style.display = "none";
    userSection.hidden = false;
    usernameSpan.textContent =
      currentUser.username || currentUser.email || "User";

    // Add sign out button if it doesn't exist
    if (!document.getElementById("signout-btn")) {
      const signoutBtn = document.createElement("button");
      signoutBtn.id = "signout-btn";
      signoutBtn.textContent = "Sign Out";
      signoutBtn.addEventListener("click", handleSignOut);
      userSection.appendChild(signoutBtn);
    }
  } else {
    // User is not authenticated
    loginSection.style.display = "block";
    userSection.hidden = true;
  }
}

// Check API status
async function checkApiStatus() {
  // Create a status element if it doesn't exist
  let statusElement = document.getElementById("api-status");
  if (!statusElement) {
    statusElement = document.createElement("div");
    statusElement.id = "api-status";
    statusElement.style.cssText = `
      margin: 20px 0;
      padding: 10px;
      border-radius: 4px;
      font-weight: 600;
    `;
    document.body.appendChild(statusElement);
  }

  statusElement.textContent = "Checking API connection...";
  statusElement.style.backgroundColor = "#f39c12";
  statusElement.style.color = "white";

  try {
    const response = await fetch(`${CONFIG.API_URL}/`);
    if (response.ok) {
      const data = await response.json();
      statusElement.textContent = `API Connected - Status: ${
        data.status || "OK"
      }`;
      statusElement.style.backgroundColor = "#27ae60";
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    statusElement.textContent = `API Error: ${error.message}`;
    statusElement.style.backgroundColor = "#e74c3c";
    console.error("API check failed:", error);
  }
}

// Show message to user
function showMessage(message, type = "info") {
  // Create a simple message display
  const messageDiv = document.createElement("div");
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    border-radius: 4px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    max-width: 300px;
  `;

  // Set background color based on type
  switch (type) {
    case "success":
      messageDiv.style.backgroundColor = "#27ae60";
      break;
    case "error":
      messageDiv.style.backgroundColor = "#e74c3c";
      break;
    case "info":
      messageDiv.style.backgroundColor = "#3498db";
      break;
    default:
      messageDiv.style.backgroundColor = "#95a5a6";
  }

  document.body.appendChild(messageDiv);

  // Remove message after 3 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 3000);
}

// Export for potential use in other modules
window.FragmentsUI = {
  CONFIG,
  currentUser,
  showMessage,
  checkApiStatus,
  signIn: handleSignIn,
  signOut: handleSignOut,
};

