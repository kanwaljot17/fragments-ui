// src/api.js

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
