// Main application entry point - handles user interface and fragment management
// This is where all the magic happens when someone visits our app

import { signIn, signOut, getUser } from "./auth.js";
import { getUserFragments, createFragment, getFragment } from "./api.js";

console.log("DOM fully loaded. actionsDiv exists?", document.querySelector("#actions"));

// Initialize the app when the page loads
async function init() {
  // Grab all the important elements we'll be working with
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const actionsDiv = document.querySelector("#actions");
  const fragmentsList = document.querySelector("#fragments");

  // Set up the login button - when clicked, start the authentication process
  loginBtn.onclick = () => {
    console.log("Login button clicked");
    signIn();
  };

  // Check if someone is already logged in when the page loads
  const user = await getUser();

  if (user) {
    console.log("Authenticated user:", user);

    // Great! Someone is logged in, so let's show them the app
    userSection.hidden = false;
    userSection.querySelector(".username").innerText = user.username;
    loginBtn.disabled = true; // Hide the login button since they're already logged in

    // Create a sign out button so users can log out when they're done
    if (!document.querySelector("#signout-btn")) {
      const signoutBtn = document.createElement("button");
      signoutBtn.id = "signout-btn";
      signoutBtn.textContent = "Sign Out";
      signoutBtn.onclick = () => signOut();
      actionsDiv.appendChild(signoutBtn);
    }

    // Add a form to create new fragments with type selection
    if (!document.querySelector("#create-fragment-form")) {
      const form = document.createElement("div");
      form.id = "create-fragment-form";
      form.innerHTML = `
        <h4>Create New Fragment</h4>
        <label>
          Content Type:
          <select id="fragment-type">
            <option value="text/plain">text/plain</option>
            <option value="text/markdown">text/markdown</option>
            <option value="text/html">text/html</option>
            <option value="application/json">application/json</option>
          </select>
        </label>
        <label>
          Content:
          <textarea id="fragment-content" rows="6" placeholder="Enter fragment content here..."></textarea>
        </label>
        <button id="create-fragment-btn">Create Fragment</button>
      `;
      actionsDiv.appendChild(form);

      const createBtn = form.querySelector("#create-fragment-btn");
      createBtn.onclick = async () => {
        try {
          const contentType = form.querySelector("#fragment-type").value;
          const content = form.querySelector("#fragment-content").value;
          
          if (!content.trim()) {
            alert("Please enter some content for the fragment.");
            return;
          }

          console.log("Creating new fragment...", { contentType, content });
          
          // Create fragment with selected type
          const result = await createFragment(user, content, contentType);
          console.log("Fragment created successfully:", result);

          // Clear the form
          form.querySelector("#fragment-content").value = "";
          
          // After creating, refresh the list so the user can see their new fragment
          await loadFragments();

          alert(`Fragment created!\nID: ${result.fragment.id}\nType: ${result.fragment.type}\nSize: ${result.fragment.size} bytes`);
        } catch (err) {
          console.error("Failed to create fragment:", err);
          alert("Error creating fragment — check console.");
        }
      };
    }

    // Add a refresh button so users can reload their fragments if needed
    if (!document.querySelector("#refresh-fragments-btn")) {
      const refreshBtn = document.createElement("button");
      refreshBtn.id = "refresh-fragments-btn";
      refreshBtn.textContent = "Refresh Fragments";
      refreshBtn.onclick = async () => {
        try {
          console.log("Refreshing fragments...");
          await loadFragments();
          alert("Fragments refreshed!");
        } catch (err) {
          console.error("Failed to refresh fragments:", err);
          alert("Error refreshing fragments — check console.");
        }
      };
      actionsDiv.appendChild(refreshBtn);
    }



    // This function loads all the user's fragments and displays them in a nice list
    async function loadFragments() {
      try {
        console.log("Fetching existing fragments...");
        const userFragments = await getUserFragments(user);
        console.log("Fragments fetched:", userFragments);

        // Clear the list first so we don't have duplicates
        fragmentsList.innerHTML = "";

        // If the user doesn't have any fragments yet, show a helpful message
        if (!userFragments?.fragments?.length) {
          fragmentsList.innerHTML = '<li class="empty-state">No fragments yet. Create your first fragment above!</li>';
        } else {
          // Create a basic card for each fragment with metadata only
          fragmentsList.innerHTML = userFragments.fragments
            .map((f) => {
              // Handle both expanded (object) and non-expanded (string ID) formats
              const fragment = typeof f === 'string' ? { id: f } : f;
              const fragmentId = fragment.id;
              
              // Display metadata if available (expanded format)
              let metadataHtml = '';
              if (typeof f === 'object' && f.id) {
                metadataHtml = `
                  <div class="fragment-meta">
                    <div><strong>Type:</strong> ${f.type || 'N/A'}</div>
                    <div><strong>Size:</strong> ${f.size || 0} bytes</div>
                    <div><strong>Created:</strong> ${f.created ? new Date(f.created).toLocaleString() : 'N/A'}</div>
                    <div><strong>Updated:</strong> ${f.updated ? new Date(f.updated).toLocaleString() : 'N/A'}</div>
                  </div>
                `;
              }
              
              return `<li class="fragment-item">
                <h5>Fragment ID: ${fragmentId}</h5>
                ${metadataHtml}
                <button onclick="viewFragment('${fragmentId}')">View Fragment</button>
              </li>`;
            })
            .join("");
        }
      } catch (err) {
        console.error("Error fetching fragments:", err);
        fragmentsList.innerHTML = "<li>Error loading fragments</li>";
      }
    }

    // Load the fragments when the page first loads
    await loadFragments();

    // This function is called when someone clicks "View Fragment" on any fragment
    // It fetches the actual content and shows it to the user
    window.viewFragment = async (fragmentId) => {
      try {
        console.log("Viewing fragment:", fragmentId);
        const fragmentData = await getFragment(user, fragmentId);
        console.log("Fragment data:", fragmentData);
        
        // Format the data for display
        let displayText = '';
        if (typeof fragmentData === 'object') {
          // JSON - pretty print it
          displayText = JSON.stringify(fragmentData, null, 2);
        } else {
          // Plain text or other
          displayText = String(fragmentData);
        }
        
        // Show the fragment content in a popup - simple but effective
        alert(`Fragment Data:\n${displayText}`);
      } catch (err) {
        console.error("Failed to view fragment:", err);
        alert("Error viewing fragment — check console.");
      }
    };
  } else {
    // No one is logged in, so hide the app and show the login button
    console.log("No user logged in.");
    userSection.hidden = true;
    loginBtn.disabled = false;
  }
}

// Start the app as soon as the page finishes loading
addEventListener("DOMContentLoaded", init);
