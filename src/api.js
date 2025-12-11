// Configuration for our API - ECS Load Balancer
const apiUrl = "http://fragments-lb-551416766.us-east-1.elb.amazonaws.com";

/**
 * Fetches all fragments belonging to a specific user
 * This is what gets called when we want to show someone their fragment list
 */
export async function getUserFragments(user) {
  console.log("Preparing request to Fragments API...");
  console.log("API URL:", apiUrl);
  console.log("User object received:", user);
  console.log("User ID Token present?", !!user?.idToken);

  try {
    // Build the URL to get all fragments for this user with expanded metadata
    const fragmentsUrl = new URL("/v1/fragments", apiUrl);
    fragmentsUrl.searchParams.set("expand", "1");
    console.log("Full fetch URL:", fragmentsUrl.toString());

    // Get the authentication headers from the user object
    const headers = user.authorizationHeaders();
    console.log("Request headers:", headers);

    // Make the request to get all fragments
    const res = await fetch(fragmentsUrl, { headers });

    console.log("Response status:", res.status, res.statusText);
    console.log("Response headers:", [...res.headers.entries()]);

    // If something went wrong, let the user know
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error response body:", errorText);
      throw new Error(`${res.status} ${res.statusText}`);
    }

    // Parse the response as JSON (this should always be JSON for the fragments list)
    const data = await res.json();
    console.log("Successfully got fragments data:", data);
    return data;
  } catch (err) {
    console.error("Fetch to /v1/fragments failed:", err);
    throw err;
  }
}

/**
 * Creates a new fragment for the authenticated user
 * @param {Object} user - Authenticated user object
 * @param {string|ArrayBuffer} content - Fragment content (string for text, ArrayBuffer for images)
 * @param {string} contentType - Content type (e.g., 'text/plain', 'text/markdown', 'application/json', 'image/png', etc.)
 * @returns {Promise<Object>} Created fragment data
 */
export async function createFragment(user, content, contentType = "text/plain") {
  // Build the URL for creating fragments
  const fragmentsUrl = new URL("/v1/fragments", apiUrl);
  
  // Prepare body based on content type
  let body;
  if (contentType === "application/json") {
    // If content is already a string, try to parse it; otherwise use as-is
    try {
      body = typeof content === "string" ? content : JSON.stringify(content);
    } catch (e) {
      body = JSON.stringify(content);
    }
  } else if (contentType.startsWith("image/")) {
    // For images, content should be ArrayBuffer
    body = content instanceof ArrayBuffer ? content : content;
  } else {
    // For text content, use as string
    body = content;
  }
  
  const headers = {
    ...user.authorizationHeaders(contentType), // Include the user's authentication with correct Content-Type
  };

  console.log("POST →", fragmentsUrl.toString());
  console.log("Headers:", headers);
  console.log("Content-Type:", contentType);
  console.log("Body type:", content instanceof ArrayBuffer ? "ArrayBuffer" : typeof content);
  console.log("Body size:", content instanceof ArrayBuffer ? content.byteLength : content.length);

  // Send the fragment content to the server
  const res = await fetch(fragmentsUrl, {
    method: "POST",
    headers,
    body: body,
  });

  console.log("Response status:", res.status, res.statusText);
  console.log("Response headers:", [...res.headers.entries()]);

  // Check if the creation was successful
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error response body:", errorText);
    throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
  }

  // Parse the response to get the new fragment details
  const data = await res.json();
  console.log("Created fragment:", data);
  return data;
}
/**
 * Gets a specific fragment by its ID and returns the content
 * This is the smart function that handles JSON, plain text, and image responses
 */
export async function getFragment(user, fragmentId) {
  console.log("Getting fragment:", fragmentId);

  try {
    // Build the URL to get this specific fragment
    const fragmentUrl = new URL(`/v1/fragments/${fragmentId}`, apiUrl);
    const headers = user.authorizationHeaders();
    console.log("Full fetch URL:", fragmentUrl.toString());
    console.log("Request headers:", headers);

    // Make the request to get the fragment content
    const res = await fetch(fragmentUrl, { headers });

    console.log("Response status:", res.status, res.statusText);
    console.log("Response headers:", [...res.headers.entries()]);

    // If something went wrong, let the user know
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
    }

    // Check if it's an image (binary data)
    const contentType = res.headers.get("content-type") || "";
    if (contentType.startsWith("image/")) {
      // Return as Blob for images
      const blob = await res.blob();
      console.log("Got image blob:", blob.type, blob.size);
      return { type: 'image', blob: blob, contentType: contentType };
    }

    // This is the smart part - we get the response as text first
    // This way we can handle both JSON and plain text fragments
    const textData = await res.text();
    console.log("Raw response text:", textData);
    
    // Try to parse it as JSON, but if that fails, just use it as plain text
    let data;
    try {
      data = JSON.parse(textData);
      console.log("Successfully parsed as JSON:", data);
    } catch (jsonError) {
      // Not JSON? No problem! Just use it as plain text
      console.log("Not JSON, using as plain text:", textData);
      data = textData;
    }

    console.log("Successfully got fragment data:", data);
    return data;
  } catch (err) {
    console.error("Fetch to /v1/fragments/:id failed:", err);
    throw err;
  }
}

/**
 * Updates an existing fragment for the authenticated user
 * @param {Object} user - Authenticated user object
 * @param {string} fragmentId - Fragment ID to update
 * @param {string} content - New fragment content
 * @param {string} contentType - Content type (must match existing fragment type)
 * @returns {Promise<Object>} Updated fragment data
 */
export async function updateFragment(user, fragmentId, content, contentType) {
  console.log("Updating fragment:", fragmentId);
  
  // Build the URL for updating the fragment
  const fragmentUrl = new URL(`/v1/fragments/${fragmentId}`, apiUrl);
  
  // Prepare body based on content type
  let body;
  if (contentType === "application/json") {
    try {
      body = typeof content === "string" ? content : JSON.stringify(content);
    } catch (e) {
      body = JSON.stringify(content);
    }
  } else {
    body = content;
  }
  
  const headers = {
    ...user.authorizationHeaders(contentType),
  };

  console.log("PUT →", fragmentUrl.toString());
  console.log("Headers:", headers);
  console.log("Body content:", body);
  console.log("Content-Type:", contentType);

  // Send the update request
  const res = await fetch(fragmentUrl, {
    method: "PUT",
    headers,
    body: body,
  });

  console.log("Response status:", res.status, res.statusText);
  console.log("Response headers:", [...res.headers.entries()]);

  // Check if the update was successful
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error response body:", errorText);
    throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
  }

  // Parse the response to get the updated fragment details
  const data = await res.json();
  console.log("Updated fragment:", data);
  return data;
}

/**
 * Deletes a fragment for the authenticated user
 * @param {Object} user - Authenticated user object
 * @param {string} fragmentId - Fragment ID to delete
 * @returns {Promise<void>}
 */
export async function deleteFragment(user, fragmentId) {
  console.log("Deleting fragment:", fragmentId);
  
  // Build the URL for deleting the fragment
  const fragmentUrl = new URL(`/v1/fragments/${fragmentId}`, apiUrl);
  const headers = user.authorizationHeaders();

  console.log("DELETE →", fragmentUrl.toString());
  console.log("Headers:", headers);

  // Send the delete request
  const res = await fetch(fragmentUrl, {
    method: "DELETE",
    headers,
  });

  console.log("Response status:", res.status, res.statusText);

  // Check if the deletion was successful
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error response body:", errorText);
    throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
  }

  // DELETE returns 200 with JSON response
  const data = await res.json();
  console.log("Deleted fragment:", data);
  return data;
}

/**
 * Gets a fragment converted to a different type
 * @param {Object} user - Authenticated user object
 * @param {string} fragmentId - Fragment ID
 * @param {string} extension - File extension (e.g., 'html', 'txt', 'jpg', 'png')
 * @returns {Promise<string|Blob>} Converted fragment data
 */
export async function getFragmentAsType(user, fragmentId, extension) {
  console.log("Getting fragment as type:", fragmentId, extension);
  
  // Build the URL with extension for conversion
  const fragmentUrl = new URL(`/v1/fragments/${fragmentId}.${extension}`, apiUrl);
  const headers = user.authorizationHeaders();

  console.log("GET →", fragmentUrl.toString());
  console.log("Headers:", headers);

  // Make the request
  const res = await fetch(fragmentUrl, { headers });

  console.log("Response status:", res.status, res.statusText);
  console.log("Response headers:", [...res.headers.entries()]);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
  }

  // Check if it's an image (binary data)
  const contentType = res.headers.get("content-type") || "";
  if (contentType.startsWith("image/")) {
      // Return as Blob for images
      const blob = await res.blob();
      return blob;
  } else {
    // Return as text for text-based conversions
    const textData = await res.text();
    console.log("Got converted text:", textData);
    return textData;
  }
}


