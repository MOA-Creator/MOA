# M.O.A - Dev button (no backend)

## What this is
A "Dev" link on the site that, when clicked, asks for an access code.
If it matches, you're taken to `dev.html`. If not, nothing happens.

No Firebase, no server, no signup, no personal email in the repo.

## Set your code
Open `dev-codes.js` and pick any word or short phrase:

```js
export const DEV_CODES = [
  "change-this-code"
];
```

Add more people by adding more codes, separated by commas. Don't reuse a
password you use anywhere else - see the warning below.

## Where the Dev link is
It's a small gray "Dev" text link - in the nav on desktop, and in the footer
on phones (since the nav is hidden there). It blends in on purpose so
ordinary visitors don't notice it, but it isn't invisible - anyone can click it.

## Files
- `dev-codes.js` - the access code(s). Edit this to add/remove devs.
- `access.js` - the check itself (prompts for the code, compares it, redirects).
- `dev.html` - the page devs land on.
- `index.html` - already wired up to use these.

## Important limits (please read)
This is **not real security** - just a filter for ordinary visitors:
- Since your repo is public, `dev-codes.js` is readable by anyone on GitHub,
  not just on the live site - the code is never actually secret.
- There's no real login, so anyone who has (or guesses) the code gets in -
  it only stops people who don't already know it.
- A technical visitor could also open dev tools and set the saved flag
  themselves to get past the redirect.
- Because of all this: never use a real email, or any password you use
  anywhere else, as the code. Treat it as a low-stakes doorbell, not a lock.

If you ever want this to be real security (so a code alone isn't enough -
only the actual account owner can get in), that needs an actual login
service like Google Sign-In, which is what Firebase was for. Happy to set
that up again if you change your mind.

## The stats themselves
Right now `dev.html` shows the four stat boxes but no real numbers, because
a static site with no backend has no way to remember other people's visits.
Ask me when you want that wired up - options range from a single free script
tag (Google Analytics, view results on Google's own dashboard) to a small
free database that shows numbers right on this page.
