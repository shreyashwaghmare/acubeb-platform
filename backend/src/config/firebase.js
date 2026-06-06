const admin = require("firebase-admin");

// 🌟 Check if the core credential environment variables exist locally
const hasFirebaseEnv = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY;

let exportedAdmin;

if (!hasFirebaseEnv) {
  console.log("------------------------------------------------------------------");
  console.log("⚠️  Firebase Env Keys Missing. Initializing Local Mock Sandbox Mode.");
  console.log("------------------------------------------------------------------");

  // Provide a clean mock wrapper to keep dependent routes from crashing
  exportedAdmin = {
    apps: { length: 1 },
    auth: () => ({
      verifyIdToken: async (token) => {
        console.log("🛠️ Local Sandbox Verification Handler Intercepted Token:", token);
        // Returns a deterministic fallback matching your operator testing setup
        return { 
          uid: "mock-local-operator-id", 
          phone_number: "9697985597" 
        };
      }
    })
  };
} else {
  // If the variables exist (like on your live Render production server), use the real SDK engine
  if (!admin.apps.length) {
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Live Firebase Admin Initialized Successfully");
  }
  exportedAdmin = admin;
}

module.exports = exportedAdmin;