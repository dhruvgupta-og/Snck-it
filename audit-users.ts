import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    console.log("Current User Audit:");
    querySnapshot.forEach((doc) => {
      console.log(`- ${doc.data().name} (${doc.id}): ${doc.data().role}`);
    });
    process.exit(0);
  } catch (e) {
    console.error("Error: ", e);
    process.exit(1);
  }
}

listUsers();
