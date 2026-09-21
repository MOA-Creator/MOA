import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyBW1Erm0zvw5O6CrmtG1f6kxI2_bC_ctYs",
  authDomain: "a8h4fi9023.firebaseapp.com",
  projectId: "a8h4fi9023",
  storageBucket: "a8h4fi9023.firebasestorage.app",
  messagingSenderId: "760768385122",
  appId: "1:760768385122:web:9a1468fb47f478cd2fc13b",
  measurementId: "G-PKBKQZB2Q5"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
