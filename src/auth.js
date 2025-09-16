// src/auth.js

import { UserManager } from "oidc-client-ts";

const cognitoAuthConfig = {
  authority: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_wEBJivNbO`,
  client_id: "6fspvdp6egvu25v30f462b2i2k",
  redirect_uri: "http://localhost:1234",
  response_type: "code",
  scope: "openid email profile",
  // no revoke of "access token" (https://github.com/authts/oidc-client-ts/issues/262)
  revokeTokenTypes: ["refresh_token"],
  // no silent renew via "prompt=none" (https://github.com/authts/oidc-client-ts/issues/366)
  automaticSilentRenew: false,
};

// Create a UserManager instance
const userManager = new UserManager({
  ...cognitoAuthConfig,
});

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
  // First, check if we're handling a signin redirect callback (e.g., is ?code=... in URL)
  if (window.location.search.includes("code=")) {
    const user = await userManager.signinCallback();
    // Remove the auth code from the URL without triggering a reload
    window.history.replaceState({}, document.title, window.location.pathname);
    return formatUser(user);
  }

  // Otherwise, get the current user
  const user = await userManager.getUser();
  return user ? formatUser(user) : null;
}
