# M.O.A dev stats - setup (about 10 minutes, free)

The site is static (GitHub Pages), so the numbers are stored in Firebase Firestore (free plan is enough).

## 1. Create the Firebase project
1. Go to https://console.firebase.google.com -> **Add project** (you can turn Google Analytics off).
2. **Build -> Firestore Database -> Create database** -> production mode -> pick a region near you.

## 2. Turn on Google sign-in
1. **Build -> Authentication -> Get started -> Sign-in method -> Google -> Enable**.
2. **Authentication -> Settings -> Authorized domains -> Add domain**, add both:
   - `moonlight-auto-clicker.runs-on.dev`
   - `moa-creator.github.io`

## 3. Add the security rules (this is what makes it dev-only)
1. **Firestore Database -> Rules**.
2. Paste everything from `firestore.rules`.
3. Replace `YOUR_EMAIL@gmail.com` with the Google account(s) that should see the dev page.
   More devs = more emails in the list: `['a@gmail.com', 'b@gmail.com']`.
4. **Publish**.

## 4. Connect the website
1. **Project settings (gear) -> Your apps -> Web (`</>`) -> Register app**.
2. Copy `apiKey`, `authDomain`, `projectId`, `appId` into `firebase-config.js`.
   (These are not secret - the rules are what protect the data.)

## 5. Upload and use
1. Put these files in your repo root and push: `index.html`, `dev.html`, `tracker.js`, `firebase-config.js`
   (`firestore.rules` and this file are just for reference).
2. Open `https://moonlight-auto-clicker.runs-on.dev/dev.html`, sign in with a dev account.
3. From then on, a red **Dev** button shows in the site menu (and footer on phones) on that browser only.

## How it works
- Visitors never see a Dev button and no login shows anywhere on the public page.
- Visitors' browsers can only add +1 to four counters (`views`, `uniques`, `searchVisits`, `downloads`).
  They can never read the numbers.
- Only emails in `firestore.rules` can read the numbers. Opening `dev.html` with another account shows "No access".
- No personal data is stored - just counters, total and per day (UTC).

## Limits (good to know)
- Counts are approximate: ad blockers can block them, and download = click on the download button.
- Someone technical could send fake +1s to the counters. Fine for a small site; if it ever matters, add Firebase App Check.
- Free plan: 20k writes/day. Each visit costs 2 writes, so around 10k visits/day.
- "Searched it" = visits that arrived from a search engine. Impressions (seen in results, not clicked) only exist in Google Search Console.
