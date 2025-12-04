import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

const firebaseCollectionEnum = {
  chats: "chats",
  limit: 50,
  drivers: "drivers",
};

const firebaasApp = initializeApp(firebaseConfig, "chatApp");
const firebaseDb = getFirestore(firebaasApp);

export { firebaseDb, firebaseCollectionEnum };
