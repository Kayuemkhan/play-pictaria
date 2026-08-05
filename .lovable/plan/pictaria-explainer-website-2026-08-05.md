# Pictaria explainer website

## Goal
Add a simple, elegant page that clearly explains what Pictaria is and invites visitors to play or create.

## What we'll build
1. A new `/about` route (`src/routes/about.tsx`) with:
   - Hero: "Pictaria turns your pictures into peaceful puzzles."
   - Three short sections: What it is, How it works, Why people love it.
   - One clear CTA button: "Play a puzzle" → `/collections`.
   - Secondary link: "Create your own" → `/create`.
2. Navigation link in the existing home page menu/footer so visitors can find it.
3. Styling matches Pictaria's existing ocean/Hawaiian aesthetic (no new colors, uses existing tokens).

## Out of scope
- No new backend tables or server functions.
- No new collections or images.
- No pricing changes.

## Success check
- `/about` renders cleanly on mobile and desktop.
- Copy clearly answers "What is Pictaria?" in one sentence.
- CTA buttons link to real existing routes.
