import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCj9mV2IFn4vSGPSdZrNQr77HwFITiz-8U",
  authDomain: "personal-dashboard-f979a.firebaseapp.com",
  projectId: "personal-dashboard-f979a",
  storageBucket: "personal-dashboard-f979a.firebasestorage.app",
  messagingSenderId: "923960821414",
  appId: "1:923960821414:web:02dd315c3f335a13021667",
  measurementId: "G-R6HY5YL8R2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export async function saveDataToCloud(data) {
  await setDoc(
    doc(db, "dashboard", "main"),
    data
  );
}

export async function loadDataFromCloud() {
  const snapshot = await getDoc(
    doc(db, "dashboard", "main")
  );

  if (snapshot.exists()) {
    return snapshot.data();
  }

  return null;
}