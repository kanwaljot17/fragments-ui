// src/app.js

import { signIn, signOut, simpleSignOut, getUser } from "./auth.js";

async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    console.log("Login button clicked!");
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    signIn();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();

  if (user) {
    // User is authenticated - show user info
    userSection.hidden = false;
    userSection.querySelector(".username").innerText = user.username;
    loginBtn.disabled = true;

    // Add sign out button if it doesn't exist
    if (!document.querySelector("#signout-btn")) {
      const signoutBtn = document.createElement("button");
      signoutBtn.id = "signout-btn";
      signoutBtn.textContent = "Sign Out";
      signoutBtn.onclick = () => signOut();
      userSection.appendChild(signoutBtn);
    }
  } else {
    // User is not authenticated - show login button
    userSection.hidden = true;
    loginBtn.disabled = false;
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
