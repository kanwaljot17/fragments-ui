const apiUrl = process.env.API_URL || "http://localhost:8080";

/**
 * Given an authenticated user, request all fragments for this user
 */
export async function getUserFragments(user) {
  console.log("📡 Preparing request to Fragments API...");
  console.log("➡️ API URL:", apiUrl);
  console.log("➡️ User object received:", user);
  console.log("➡️ User ID Token present?", !!user?.idToken);

  try {
    const fragmentsUrl = new URL("/v1/fragments", apiUrl);
    console.log("➡️ Full fetch URL:", fragmentsUrl.toString());

    const headers = user.authorizationHeaders();
    console.log("➡️ Request headers:", headers);

    const res = await fetch(fragmentsUrl, { headers });

    console.log("⬅️ Response status:", res.status, res.statusText);
    console.log("⬅️ Response headers:", [...res.headers.entries()]);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error response body:", errorText);
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("✅ Successfully got fragments data:", data);
    return data;
  } catch (err) {
    console.error("❌ Fetch to /v1/fragments failed:", err);
    throw err;
  }
}

/**
 * Create a new text fragment for the authenticated user
 */
export async function createFragment(user, content = "Hello from Fragments UI!") {
  const fragmentsUrl = new URL("/v1/fragments", apiUrl);
  const headers = {
    "Content-Type": "text/plain",
    ...user.authorizationHeaders(),
  };

  console.log("📡 POST →", fragmentsUrl.toString());
  console.log("➡️ Headers:", headers);
  console.log("➡️ Body content:", content);

  const res = await fetch(fragmentsUrl, {
    method: "POST",
    headers,
    body: content,
  });

  console.log("⬅️ Response status:", res.status, res.statusText);
  console.log("⬅️ Response headers:", [...res.headers.entries()]);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Error response body:", errorText);
    throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
  }

  const data = await res.json();
  console.log("✅ Created fragment:", data);
  return data;
}
//  * Get a specific fragment by ID for the authenticated user
//  */
export async function getFragment(user, fragmentId) {
  console.log("📡 Getting fragment:", fragmentId);

  try {
    const fragmentUrl = new URL(`/v1/fragments/${fragmentId}`, apiUrl);
    const headers = user.authorizationHeaders();
    console.log("➡️ Full fetch URL:", fragmentUrl.toString());
    console.log("➡️ Request headers:", headers);

    const res = await fetch(fragmentUrl, { headers });

    console.log("⬅️ Response status:", res.status, res.statusText);
    console.log("⬅️ Response headers:", [...res.headers.entries()]);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
    }

    // ✅ ALWAYS parse as text first, then check if it's JSON
    const textData = await res.text();
    console.log("📄 Raw response text:", textData);
    
    // Try to parse as JSON, but don't fail if it's not JSON
    let data;
    try {
      data = JSON.parse(textData);
      console.log("📄 Successfully parsed as JSON:", data);
    } catch (jsonError) {
      console.log("📄 Not JSON, using as plain text:", textData);
      data = textData;
    }

    console.log("✅ Successfully got fragment data:", data);
    return data;
  } catch (err) {
    console.error("❌ Fetch to /v1/fragments/:id failed:", err);
    throw err;
  }
}


