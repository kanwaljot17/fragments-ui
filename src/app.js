// src/app.js

import { signIn, signOut, getUser } from "./auth.js";
import { getUserFragments, createFragment, getFragment } from "./api.js";

console.log("🧭 DOM fully loaded. actionsDiv exists?", document.querySelector("#actions"));


async function init() {
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const actionsDiv = document.querySelector("#actions");
  const fragmentsList = document.querySelector("#fragments");

  // --- LOGIN HANDLER ---
  loginBtn.onclick = () => {
    console.log("🔐 Login button clicked");
    signIn();
  };

  // --- CHECK LOGIN STATE ---
  const user = await getUser();

  if (user) {
    console.log("✅ Authenticated user:", user);

    userSection.hidden = false;
    userSection.querySelector(".username").innerText = user.username;
    loginBtn.disabled = true;

    // --- SIGN OUT BUTTON ---
    if (!document.querySelector("#signout-btn")) {
      const signoutBtn = document.createElement("button");
      signoutBtn.id = "signout-btn";
      signoutBtn.textContent = "Sign Out";
      signoutBtn.onclick = () => signOut();
      actionsDiv.appendChild(signoutBtn);
    }

    // --- CREATE FRAGMENT BUTTON ---
    if (!document.querySelector("#create-fragment-btn")) {
      const createBtn = document.createElement("button");
      createBtn.id = "create-fragment-btn";
      createBtn.textContent = "Create Fragment";
      createBtn.style.marginRight = "10px";
      createBtn.onclick = async () => {
        try {
          console.log("📤 Creating new fragment...");
          const result = await createFragment(user, "Hello from Fragments UI!");
          console.log("🎯 Fragment created successfully:", result);

          // Refresh the fragments list
          await loadFragments();

          alert(`✅ Fragment created!\nID: ${result.fragment.id}`);
        } catch (err) {
          console.error("❌ Failed to create fragment:", err);
          alert("⚠️ Error creating fragment — check console.");
        }
      };
      actionsDiv.appendChild(createBtn);
    }

    // --- REFRESH FRAGMENTS BUTTON ---
    if (!document.querySelector("#refresh-fragments-btn")) {
      const refreshBtn = document.createElement("button");
      refreshBtn.id = "refresh-fragments-btn";
      refreshBtn.textContent = "Refresh Fragments";
      refreshBtn.onclick = async () => {
        try {
          console.log("🔄 Refreshing fragments...");
          await loadFragments();
          alert("✅ Fragments refreshed!");
        } catch (err) {
          console.error("❌ Failed to refresh fragments:", err);
          alert("⚠️ Error refreshing fragments — check console.");
        }
      };
      actionsDiv.appendChild(refreshBtn);
    }



    // --- LOAD FRAGMENTS FUNCTION ---
    async function loadFragments() {
      try {
        console.log("📡 Fetching existing fragments...");
        const userFragments = await getUserFragments(user);
        console.log("✅ Fragments fetched:", userFragments);

        // Clear any old entries
        fragmentsList.innerHTML = "";

        if (!userFragments?.fragments?.length) {
          fragmentsList.innerHTML = "<li>No fragments yet...</li>";
        } else {
          fragmentsList.innerHTML = userFragments.fragments
            .map((f) => {
              const fragmentId = typeof f === 'string' ? f : f.id;
              return `<li class="fragment-item">
                <h5>Fragment ID: ${fragmentId}</h5>
                <div class="fragment-meta">Click View to see content</div>
                <button onclick="viewFragment('${fragmentId}')" style="margin-top: 10px;">View Fragment</button>
              </li>`;
            })
            .join("");
        }
      } catch (err) {
        console.error("❌ Error fetching fragments:", err);
        fragmentsList.innerHTML = "<li>Error loading fragments</li>";
      }
    }

    // --- INITIAL LOAD ---
    await loadFragments();

    // --- GLOBAL VIEW FRAGMENT FUNCTION ---
    window.viewFragment = async (fragmentId) => {
      try {
        console.log("👁️ Viewing fragment:", fragmentId);
        const fragmentData = await getFragment(user, fragmentId);
        console.log("✅ Fragment data:", fragmentData);
        
        // Display the fragment content directly
        alert(`🧾 Fragment Data:\n${fragmentData}`);
      } catch (err) {
        console.error("❌ Failed to view fragment:", err);
        alert("⚠️ Error viewing fragment — check console.");
      }
    };
  } else {
    console.log("⚠️ No user logged in.");
    userSection.hidden = true;
    loginBtn.disabled = false;
  }
}

addEventListener("DOMContentLoaded", init);
