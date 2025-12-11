// Main application entry point - handles user interface and fragment management
// This is where all the magic happens when someone visits our app

import { signIn, signOut, getUser } from "./auth.js";
import { getUserFragments, createFragment, getFragment, updateFragment, deleteFragment, getFragmentAsType } from "./api.js";

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
    // Hide the login button section since they're already logged in
    const loginSection = loginBtn.closest('section');
    if (loginSection) {
      loginSection.hidden = true;
    } else {
      loginBtn.style.display = 'none';
    }

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
            <option value="image/png">image/png</option>
            <option value="image/jpeg">image/jpeg</option>
            <option value="image/webp">image/webp</option>
            <option value="image/avif">image/avif</option>
            <option value="image/gif">image/gif</option>
          </select>
        </label>
        <label id="text-content-label">
          Content:
          <textarea id="fragment-content" rows="6" placeholder="Enter fragment content here..."></textarea>
        </label>
        <label id="image-content-label" style="display: none;">
          Image File:
          <input type="file" id="fragment-image" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" />
        </label>
        <button id="create-fragment-btn">Create Fragment</button>
      `;
      actionsDiv.appendChild(form);

      const typeSelect = form.querySelector("#fragment-type");
      const textLabel = form.querySelector("#text-content-label");
      const imageLabel = form.querySelector("#image-content-label");
      const textContent = form.querySelector("#fragment-content");
      const imageInput = form.querySelector("#fragment-image");

      // Show/hide text or image input based on selected type
      typeSelect.onchange = () => {
        const selectedType = typeSelect.value;
        if (selectedType.startsWith("image/")) {
          textLabel.style.display = "none";
          imageLabel.style.display = "block";
        } else {
          textLabel.style.display = "block";
          imageLabel.style.display = "none";
        }
      };

      const createBtn = form.querySelector("#create-fragment-btn");
      createBtn.onclick = async () => {
        try {
          const contentType = typeSelect.value;
          let content;
          
          if (contentType.startsWith("image/")) {
            // Handle image upload
            const file = imageInput.files[0];
            if (!file) {
              alert("Please select an image file.");
              return;
            }
            // Read file as ArrayBuffer
            // NOTE: We use the selected contentType from dropdown, NOT file.type
            // This allows users to convert images (e.g., upload PNG but save as JPEG)
            content = await file.arrayBuffer();
            console.log("File selected:", file.name, "File type detected by browser:", file.type, "Using selected type:", contentType);
          } else {
            // Handle text content
            content = textContent.value;
            if (!content.trim()) {
              alert("Please enter some content for the fragment.");
              return;
            }
          }

          console.log("Creating new fragment...", { contentType, contentSize: content.length || content.byteLength });
          
          // Create fragment with selected type (NOT the file's detected type)
          const result = await createFragment(user, content, contentType);
          console.log("Fragment created successfully:", result);

          // Clear the form
          textContent.value = "";
          imageInput.value = "";
          
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
          // Sort fragments by last updated time (most recently updated first)
          const sortedFragments = [...userFragments.fragments].sort((a, b) => {
            // Handle both expanded (object) and non-expanded (string ID) formats
            const aFragment = typeof a === 'string' ? { id: a } : a;
            const bFragment = typeof b === 'string' ? { id: b } : b;
            
            // Get updated timestamps, fallback to created if updated doesn't exist
            const aTime = aFragment.updated || aFragment.created || '';
            const bTime = bFragment.updated || bFragment.created || '';
            
            // Sort descending (newest first)
            if (!aTime && !bTime) return 0;
            if (!aTime) return 1;
            if (!bTime) return -1;
            
            return new Date(bTime) - new Date(aTime);
          });
          
          // Create a basic card for each fragment with metadata only
          fragmentsList.innerHTML = sortedFragments
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
              
              // Get available conversions based on fragment type
              const fragmentType = f.type || '';
              let conversionOptions = '';
              
              if (fragmentType === 'text/markdown') {
                conversionOptions = '<option value="html">HTML</option><option value="txt">Plain Text</option>';
              } else if (fragmentType === 'text/html') {
                conversionOptions = '<option value="txt">Plain Text</option>';
              } else if (fragmentType === 'application/json') {
                conversionOptions = '<option value="txt">Plain Text</option>';
              } else if (fragmentType === 'image/png') {
                conversionOptions = '<option value="jpg">JPEG</option><option value="webp">WebP</option><option value="avif">AVIF</option>';
              } else if (fragmentType === 'image/jpeg' || fragmentType === 'image/jpg') {
                conversionOptions = '<option value="png">PNG</option><option value="webp">WebP</option><option value="avif">AVIF</option>';
              } else if (fragmentType === 'image/webp') {
                conversionOptions = '<option value="png">PNG</option><option value="jpg">JPEG</option><option value="avif">AVIF</option>';
              } else if (fragmentType === 'image/avif') {
                conversionOptions = '<option value="png">PNG</option><option value="jpg">JPEG</option><option value="webp">WebP</option>';
              }
              
              return `<li class="fragment-item" data-fragment-id="${fragmentId}" data-fragment-type="${fragmentType}">
                <h5>Fragment ID: ${fragmentId}</h5>
                ${metadataHtml}
                <div class="fragment-actions">
                  <button onclick="viewFragment('${fragmentId}')">View</button>
                  <button onclick="editFragment('${fragmentId}', '${fragmentType}')">Edit</button>
                  <button onclick="deleteFragmentConfirm('${fragmentId}')">Delete</button>
                  ${conversionOptions ? `
                    <select id="convert-${fragmentId}" onchange="convertFragment('${fragmentId}', this.value)">
                      <option value="">Convert to...</option>
                      ${conversionOptions}
                    </select>
                  ` : ''}
                </div>
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
        
        // Check if it's an image
        if (fragmentData && fragmentData.type === 'image' && fragmentData.blob) {
          // Image - create data URL and show in new window
          const imageUrl = URL.createObjectURL(fragmentData.blob);
          const imgWindow = window.open('', '_blank');
          if (imgWindow) {
            imgWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Fragment Image</title>
                  <style>
                    body {
                      margin: 0;
                      padding: 20px;
                      background: #f5f5f5;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      min-height: 100vh;
                    }
                    img {
                      max-width: 100%;
                      max-height: 90vh;
                      height: auto;
                      border: 1px solid #ddd;
                      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                      background: white;
                    }
                  </style>
                </head>
                <body>
                  <img src="${imageUrl}" alt="Fragment image" />
                </body>
              </html>
            `);
            imgWindow.document.close();
          } else {
            alert("Please allow popups to view images.");
          }
          return;
        }
        
        // Format the data for display (text or JSON)
        let displayText = '';
        if (typeof fragmentData === 'object' && fragmentData.type !== 'image') {
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

    // Edit fragment function
    window.editFragment = async (fragmentId, fragmentType) => {
      try {
        // Get current fragment content
        const fragmentData = await getFragment(user, fragmentId);
        let currentContent = '';
        if (typeof fragmentData === 'object') {
          currentContent = JSON.stringify(fragmentData, null, 2);
        } else {
          currentContent = String(fragmentData);
        }

        // Create edit form
        const editContent = prompt(`Edit fragment content (Type: ${fragmentType}):`, currentContent);
        if (editContent === null) return; // User cancelled

        if (!editContent.trim()) {
          alert("Content cannot be empty.");
          return;
        }

        // Update the fragment
        const result = await updateFragment(user, fragmentId, editContent, fragmentType);
        console.log("Fragment updated successfully:", result);

        // Refresh the list
        await loadFragments();
        alert(`Fragment updated!\nID: ${result.fragment.id}\nSize: ${result.fragment.size} bytes`);
      } catch (err) {
        console.error("Failed to update fragment:", err);
        alert(`Error updating fragment: ${err.message}`);
      }
    };

    // Delete fragment function with confirmation
    window.deleteFragmentConfirm = async (fragmentId) => {
      if (!confirm("Are you sure you want to delete this fragment? This action cannot be undone.")) {
        return;
      }

      try {
        await deleteFragment(user, fragmentId);
        console.log("Fragment deleted successfully");

        // Refresh the list
        await loadFragments();
        alert("Fragment deleted successfully!");
      } catch (err) {
        console.error("Failed to delete fragment:", err);
        alert(`Error deleting fragment: ${err.message}`);
      }
    };

    // Convert fragment function
    window.convertFragment = async (fragmentId, extension) => {
      if (!extension) return; // No extension selected

      try {
        // Show loading feedback
        const selectElement = document.querySelector(`#convert-${fragmentId}`);
        const originalValue = selectElement.value;
        selectElement.disabled = true;
        selectElement.style.opacity = '0.6';

        const convertedData = await getFragmentAsType(user, fragmentId, extension);
        console.log("Fragment converted successfully:", convertedData);

        // Handle display based on data type
        if (convertedData instanceof Blob) {
          // Image - create data URL and show in new window
          const imageUrl = URL.createObjectURL(convertedData);
          const imgWindow = window.open('', '_blank');
          if (imgWindow) {
            // Show loading state in the new window
            imgWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Converted Image - ${extension.toUpperCase()}</title>
                  <style>
                    body {
                      margin: 0;
                      padding: 20px;
                      background: #f5f5f5;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      min-height: 100vh;
                      font-family: Arial, sans-serif;
                    }
                    .loading {
                      text-align: center;
                      color: #666;
                    }
                    .spinner {
                      border: 4px solid #f3f3f3;
                      border-top: 4px solid #3498db;
                      border-radius: 50%;
                      width: 40px;
                      height: 40px;
                      animation: spin 1s linear infinite;
                      margin: 20px auto;
                    }
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                    img {
                      max-width: 100%;
                      max-height: 90vh;
                      height: auto;
                      border: 1px solid #ddd;
                      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                      background: white;
                      display: none;
                    }
                    img.loaded {
                      display: block;
                    }
                  </style>
                </head>
                <body>
                  <div class="loading" id="loading">
                    <div class="spinner"></div>
                    <p>Loading converted image...</p>
                  </div>
                  <img src="${imageUrl}" alt="Converted image" id="convertedImage" onload="document.getElementById('loading').style.display='none'; this.classList.add('loaded');" />
                </body>
              </html>
            `);
            imgWindow.document.close();
          } else {
            alert("Please allow popups to view converted images.");
          }
        } else {
          // Text - show in a better modal-like display
          const textContent = String(convertedData);
          const maxLength = 2000;
          const displayText = textContent.length > maxLength 
            ? textContent.substring(0, maxLength) + '\n\n... (truncated, full content in console)'
            : textContent;
          
          // Create a modal-like display
          const modal = document.createElement('div');
          modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
          `;
          
          const content = document.createElement('div');
          content.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 80%;
            max-height: 80vh;
            overflow: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          `;
          
          content.innerHTML = `
            <h3 style="margin-top: 0;">Converted Fragment (${extension.toUpperCase()})</h3>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; max-height: 60vh; overflow-y: auto;">${displayText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            <button onclick="this.closest('div').parentElement.remove()" style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">Close</button>
            ${textContent.length > maxLength ? '<p style="color: #666; font-size: 12px; margin-top: 10px;">Note: Content truncated. Check browser console for full content.</p>' : ''}
          `;
          
          modal.appendChild(content);
          document.body.appendChild(modal);
          
        }
        
        // Reset dropdown
        selectElement.value = '';
        selectElement.disabled = false;
        selectElement.style.opacity = '1';
      } catch (err) {
        console.error("Failed to convert fragment:", err);
        alert(`Error converting fragment: ${err.message}`);
        
        // Reset dropdown on error
        const selectElement = document.querySelector(`#convert-${fragmentId}`);
        if (selectElement) {
          selectElement.value = '';
          selectElement.disabled = false;
          selectElement.style.opacity = '1';
        }
      }
    };
  } else {
    // No one is logged in, so hide the app and show the login button
    console.log("No user logged in.");
    userSection.hidden = true;
    // Show the login button section
    const loginSection = loginBtn.closest('section');
    if (loginSection) {
      loginSection.hidden = false;
    } else {
      loginBtn.style.display = 'block';
    }
    loginBtn.disabled = false;
  }
}

// Start the app as soon as the page finishes loading
addEventListener("DOMContentLoaded", init);
