// src/auth.js
import { UserManager } from "oidc-client-ts";

const cognitoAuthConfig = {
  authority: `https://cognito-idp.us-east-1.amazonaws.com/${process.env.AWS_COGNITO_POOL_ID}`,
  client_id: process.env.AWS_COGNITO_CLIENT_ID,
  redirect_uri: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
  response_type: "code",
  scope: "openid email profile",
  revokeTokenTypes: ["refresh_token"],
  automaticSilentRenew: false,
};

// Create a UserManager instance
const userManager = new UserManager(cognitoAuthConfig);


export async function signIn() {
  // Trigger a redirect to the Cognito auth page, so user can authenticate
  console.log("Initiating sign in...");
  console.log("Auth config:", cognitoAuthConfig);
  console.log("Authority URL:", cognitoAuthConfig.authority);
  console.log("Client ID:", cognitoAuthConfig.client_id);
  console.log("Redirect URI:", cognitoAuthConfig.redirect_uri);
  await userManager.signinRedirect();
}

export async function signOut() {
  // Sign out the user by clearing local data and redirecting
  console.log("Signing out...");
  try {
    // Clear user data from oidc-client-ts
    await userManager.removeUser();
  } catch (error) {
    console.log("Error removing user from oidc-client-ts:", error);
  }

  // Clear all local storage
  localStorage.clear();
  sessionStorage.clear();

  // Redirect to home page
  window.location.href = "http://localhost:1234";
}

// Alternative simple logout method
export async function simpleSignOut() {
  console.log("Simple sign out - clearing local data");
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "http://localhost:1234";
}

// Create a simplified view of the user, with an extra method for creating the auth headers
function formatUser(user) {
  console.log("User Authenticated", { user });
  return {
    // If you add any other profile scopes, you can include them here
    username:
      user.profile["cognito:username"] ||
      user.profile.preferred_username ||
      user.profile.email,
    email: user.profile.email,
    idToken: user.id_token,
    accessToken: user.access_token,
    authorizationHeaders: (type = "application/json") => ({
      "Content-Type": type,
      Authorization: `Bearer ${user.id_token}`,
    }),
  };
}

export async function getUser() {
  try {
    // First, check if we're handling a signin redirect callback (e.g., is ?code=... in URL)
    if (window.location.search.includes("code=")) {
      console.log("Handling signin redirect callback...");
      const user = await userManager.signinCallback();
      // Remove the auth code from the URL without triggering a reload
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log("User from callback:", user);
      return formatUser(user);
    }

    // Otherwise, get the current user
    console.log("Getting current user...");
    const user = await userManager.getUser();
    console.log("Current user from manager:", user);
    return user ? formatUser(user) : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}
