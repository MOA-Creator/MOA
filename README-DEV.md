# M.O.A - Dev button

## What this is
A "Dev" link on the site that, when clicked, asks for an access code.
If it matches, you're taken to `dev.html`. If not, nothing happens.

The code itself now lives in a separate **private** GitHub repo called
`DevCodes`, in a file called `Code.txt` (format: `Code: your-code-here`,
one per line if you ever want more than one). A small server-side
function checks guesses against that file - the code never gets sent to
anyone's browser.

## How it works
1. Visitor clicks "Dev" -> `access.js` asks the site's own
   `/api/check-code` endpoint "is this code right?"
2. `functions/api/check-code.js` (a Cloudflare Pages Function - runs on
   Cloudflare's servers, not in the browser) uses a GitHub token to read
   `Code.txt` from the private `DevCodes` repo, compares it, and replies
   yes/no.
3. If yes, the visitor is sent to `dev.html` and the code is remembered
   in their browser (`localStorage`) so they're not asked again.

## Setting it up on Cloudflare Pages
This site is deployed from a **private** repo (GitHub Pages doesn't
support that on the free plan, which is why we moved to Cloudflare
Pages). In the Cloudflare Pages project settings -> Environment
variables, add these as **secret/encrypted** variables:

- `GITHUB_TOKEN` - a GitHub fine-grained personal access token, scoped
  to **only** the `DevCodes` repo, with **Contents: Read-only**
  permission and nothing else. (GitHub -> Settings -> Developer
  settings -> Personal access tokens -> Fine-grained tokens.) Give it
  an expiration date and re-generate it when it lapses.
- `DEVCODES_OWNER` - your GitHub username (the owner of the `DevCodes`
  repo).

## Changing the code
Edit `Code.txt` in the private `DevCodes` repo. No redeploy of this
site needed - the function reads it fresh on every check.

## Files
- `access.js` - asks the server-side function whether a code is right.
- `functions/api/check-code.js` - the actual check (reads `Code.txt`
  from the private repo using the token above).
- `dev.html` - the page devs land on.
- `index.html` - already wired up to use `access.js`.

## Why this is real, not a filter
Unlike the old setup, the code and the GitHub token never reach the
browser - DevTools has nothing to find. The only way in is to know a
code in `Code.txt`, or to have write access to `DevCodes` itself.

## The stats themselves
`dev.html` still shows the four stat boxes with no real numbers, since
nothing feeds them yet. Ask when you want that wired up.
