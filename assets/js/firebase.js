import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

/* =========================================================
   PlanOS Firebase Data Adapter
   - Single-document cloud storage
   - Legacy-data compatible
   - Returns metadata for sync conflict checks
========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyCj9mV2IFn4vSGPSdZrNQr77HwFITiz-8U",
  authDomain: "personal-dashboard-f979a.firebaseapp.com",
  projectId: "personal-dashboard-f979a",
  storageBucket: "personal-dashboard-f979a.firebasestorage.app",
  messagingSenderId: "923960821414",
  appId: "1:923960821414:web:02dd315c3f335a13021667",
  measurementId: "G-R6HY5YL8R2",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

const COLLECTION_NAME = "dashboard";
const DOC_ID = "main";

function getMainDocRef() {
  return doc(db, COLLECTION_NAME, DOC_ID);
}

function normalizeCloudSnapshot(payload) {
  if (!payload) return null;

  // New format: { data, updatedAt, savedAt, ... }
  if (payload.data && typeof payload.data === "object") {
    return {
      data: payload.data,
      updatedAt:
        payload.updatedAt ||
        payload.savedAt ||
        payload.updated_at ||
        payload.data.savedAt ||
        "",
      savedAt: payload.savedAt || payload.data.savedAt || "",
      version: payload.version || payload.data.version || 0,
    };
  }

  // Legacy format: the app data was written directly to the document.
  return {
    data: payload,
    updatedAt: payload.savedAt || payload.updatedAt || "",
    savedAt: payload.savedAt || "",
    version: payload.version || 0,
  };
}

export async function saveDataToCloud(data) {
  const savedAt = new Date().toISOString();

  const payload = {
    id: DOC_ID,
    data,
    savedAt,
    updatedAt: savedAt,
    updatedAtServer: serverTimestamp(),
    version: Date.now(),
    app: "PlanOS",
    schemaVersion: 3,
  };

  await setDoc(getMainDocRef(), payload, { merge: true });

  return {
    updatedAt: savedAt,
    savedAt,
    version: payload.version,
  };
}

export async function loadDataFromCloud() {
  const snapshot = await getDoc(getMainDocRef());

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeCloudSnapshot(snapshot.data());
}
