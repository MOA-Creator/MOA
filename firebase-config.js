// Firebase web config for the M.O.A dev stats.
// These values are NOT secrets - they only tell the browser which Firebase project to talk to.
// The real protection is in firestore.rules (only listed dev emails can read the numbers).
//
// Fill these in from: Firebase console -> Project settings -> Your apps -> Web app -> Config.
// See SETUP-DEV.md for the step-by-step.

export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  appId: "PASTE_APP_ID"
};
