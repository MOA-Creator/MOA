# M.O.A - Dev button (no backend)

## What this is
A "Dev" link on the site that, when clicked, asks for your email.
If it's on the approved list, you're taken to `dev.html`. If not, nothing happens.

No Firebase, no server, no signup - it's plain JavaScript running in the browser.

## Set your email
Open `dev-emails.js` and put your Google (or any) email in the list:

```js
export const DEV_EMAILS = [
  "you@gmail.com"
];
```

Add more people by adding more lines, separated by commas.

## Where the Dev link is
It's a small gray "Dev" text link - in the nav on desktop, and in the footer
on phones (since the nav is hidden there). It blends in on purpose so
ordinary visitors don't notice it, but it isn't invisible - anyone can click it.

## Files
- `dev-emails.js` - the list of approved emails. Edit this to add/remove devs.
- `access.js` - the check itself (prompts for email, compares it, redirects).
- `dev.html` - the page devs land on.
- `index.html` - already wired up to use these.

## Important limits (please read)
This is **not real security** - just a filter for ordinary visitors:
- The email list and the check are sent to every visitor's browser as plain
  JavaScript. Anyone who opens "View Page Source" or the browser's dev tools
  can read `dev-emails.js` and see every approved email.
- There's no password and no verification that you actually own that email -
  anyone who types a listed email gets in. It only stops people who don't
  already know (or guess) an approved email.
- A technical visitor could also just open dev tools and set the saved flag
  themselves to get past the redirect.

If you ever want this to be real security (so only the real owner of an
approved email can get in, not just anyone who types it), that needs an
actual login service like Google Sign-In - which is what Firebase was for.
Happy to set that up again if you change your mind.

## The stats themselves
Right now `dev.html` shows the four stat boxes but no real numbers, because
a static site with no backend has no way to remember other people's visits.
Ask me when you want that wired up - options range from a single free script
tag (Google Analytics, view results on Google's own dashboard) to a small
free database that shows numbers right on this page.
