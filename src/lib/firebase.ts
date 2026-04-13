// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcPmd00FHMGmdLonFazbqQHJOYw82HRwU",
  authDomain: "supercuttytoby.firebaseapp.com",
  projectId: "supercuttytoby",
  storageBucket: "supercuttytoby.firebasestorage.app",
  messagingSenderId: "720738631542",
  appId: "1:720738631542:web:7dacb06b0f141a88ef8457",
  measurementId: "G-C7W2NYP0EV"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics (client-side only)
export const initAnalytics = async () => {
    if (typeof window !== "undefined") {
        const analyticsSupported = await isSupported();
        if (analyticsSupported) {
            return getAnalytics(app);
        }
    }
    return null;
};

export { app };
