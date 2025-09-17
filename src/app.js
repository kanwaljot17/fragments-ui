// src/app.js

import { signIn, signOut, simpleSignOut, getUser } from "./auth.js";
import { getUserFragments } from "./api.js";

async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");

  // Wire up event handlers to deal with login and logout
  loginBtn.onclick = () => {
    console.log("Login button clicked!");
    signIn();
  };

  // See if we're signed in
  const user = await getUser();

  if (user) {
    console.log("✅ User object returned from getUser():", user);

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

    // Debug: entering getUserFragments()
    console.log("➡️ Entering getUserFragments(user)...");

    try {
      const userFragments = await getUserFragments(user);
      console.log("✅ getUserFragments() returned:", userFragments);

      // Render results in DOM
      const fragmentsList = document.createElement("ul");
      if (!userFragments || !userFragments.fragments) {
        fragmentsList.innerHTML = "<li>⚠️ No fragments returned</li>";
      } else if (userFragments.fragments.length === 0) {
        fragmentsList.innerHTML = "<li>No fragments yet...</li>";
      } else {
        fragmentsList.innerHTML = userFragments.fragments
          .map((f) => `<li>${JSON.stringify(f)}</li>`)
          .join("");
      }
      userSection.appendChild(fragmentsList);
    } catch (err) {
      console.error("❌ getUserFragments(user) threw an error:", err);
    }
  } else {
    console.log("⚠️ No user object returned from getUser()");
    // User is not authenticated - show login button
    userSection.hidden = true;
    loginBtn.disabled = false;
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
