// Authentication module - handles user login/logout with AWS Cognito
// This is what makes sure only the right people can see their fragments

import { UserManager } from "oidc-client-ts";

// Configuration for connecting to AWS Cognito (our authentication provider)
const cognitoAuthConfig = {
  authority: `https://cognito-idp.us-east-1.amazonaws.com/${process.env.AWS_COGNITO_POOL_ID}`,
  client_id: process.env.AWS_COGNITO_CLIENT_ID,
  redirect_uri: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
  response_type: "code",
  scope: "openid email profile", // What user info we want to access
  revokeTokenTypes: ["refresh_token"],
  automaticSilentRenew: false,
};

// Create the user manager that handles all the authentication stuff
const userManager = new UserManager(cognitoAuthConfig);

// Starts the login process by redirecting to AWS Cognito
export async function signIn() {
  console.log("Initiating sign in...");
  console.log("Auth config:", cognitoAuthConfig);
  console.log("Authority URL:", cognitoAuthConfig.authority);
  console.log("Client ID:", cognitoAuthConfig.client_id);
  console.log("Redirect URI:", cognitoAuthConfig.redirect_uri);
  // This redirects the user to AWS Cognito where they can enter their credentials
  await userManager.signinRedirect();
}

// Signs out the user and clears all their data
export async function signOut() {
  console.log("Signing out...");
  try {
    // Tell the authentication system to forget about this user
    await userManager.removeUser();
  } catch (error) {
    console.log("Error removing user from oidc-client-ts:", error);
  }

  // Clear everything from the browser's storage
  localStorage.clear();
  sessionStorage.clear();

  // Send them back to the home page
  window.location.href =
    "http://ec2-54-224-105-205.compute-1.amazonaws.com:1234";
}

// A simpler logout method that just clears local data
export async function simpleSignOut() {
  console.log("Simple sign out - clearing local data");
  localStorage.clear();
  sessionStorage.clear();
  window.location.href =
    "http://ec2-54-224-105-205.compute-1.amazonaws.com:1234";
}

// Takes the complex user object from Cognito and makes it simple to use
function formatUser(user) {
  console.log("User Authenticated", { user });
  return {
    // Extract the username from various possible fields
    username:
      user.profile["cognito:username"] ||
      user.profile.preferred_username ||
      user.profile.email,
    email: user.profile.email,
    idToken: user.id_token,
    accessToken: user.access_token,
    // This creates the headers needed for API calls
    authorizationHeaders: (type = "application/json") => ({
      "Content-Type": type,
      Authorization: `Bearer ${user.id_token}`,
    }),
  };
}

// Gets the current user - handles both new logins and existing sessions
export async function getUser() {
  try {
    // Check if the user just came back from logging in (has a code in the URL)
    if (window.location.search.includes("code=")) {
      console.log("Handling signin redirect callback...");
      const user = await userManager.signinCallback();
      // Clean up the URL so it doesn't show the auth code
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log("User from callback:", user);
      return formatUser(user);
    }

    // Otherwise, check if someone is already logged in
    console.log("Getting current user...");
    const user = await userManager.getUser();
    console.log("Current user from manager:", user);
    return user ? formatUser(user) : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}
