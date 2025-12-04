import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebasePushConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

const pushApp = initializeApp(firebasePushConfig, "pushApp");

let firebaseMessaging = null;
const is_messaging_supported =
  "Notification" in window &&
  "serviceWorker" in navigator &&
  "PushManager" in window;
if (is_messaging_supported) {
  try {
    firebaseMessaging = getMessaging(pushApp);
  } catch (err) {
    console.warn(
      "Firebase Messaging is not supported in this environment:",
      err
    );
  }
}

export { firebaseMessaging, getToken, onMessage };
