// Configuration for our API - EC2 instance
const apiUrl = "http://3.90.2.171:8080";

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
 * @param {string} content - Fragment content
 * @param {string} contentType - Content type (e.g., 'text/plain', 'text/markdown', 'application/json')
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
  } else {
    body = content;
  }
  
  const headers = {
    ...user.authorizationHeaders(contentType), // Include the user's authentication with correct Content-Type
  };

  console.log("POST →", fragmentsUrl.toString());
  console.log("Headers:", headers);
  console.log("Body content:", body);
  console.log("Content-Type:", contentType);

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
 * This is the smart function that handles both JSON and plain text responses
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


