# Briefly — CLAT Study Studio

A responsive, manifestation-inspired CLAT study planner built with plain HTML, CSS and JavaScript. No framework, build step, database or API key required.

## Features

- Dashboard with daily completion, mock count and weekly task-based focus estimate.
- Editable daily routine with a pencil icon. Edit task names, time slots, descriptions, blocks, and add/remove tasks for each weekday.
- Alternating default morning subject pairs:
  - Monday/Wednesday/Friday: Legal Reasoning + English Language
  - Tuesday/Thursday/Saturday: Logical Reasoning + Quantitative Techniques
  - Sunday: full-length mock + analysis.
- Quant is not scheduled as a separate daily morning task; the morning second block follows the day's subject pair.
- Fixed study blocks: 9 AM–12 PM, 2 PM–4 PM, plus night revision.
- Daily reading habit, Current Affairs class, GK marathon and Quant sets.
- Sunday full-length mock and mock-analysis checklist.
- Mock score tracker (out of 120), weakest section, attempted questions, duration and takeaways.
- Daily intention, affirmation, reflection journal and personal “why”.
- Progress and custom routines are saved in browser `localStorage` on the device/browser being used.

## Deploy to Vercel

### Option A — GitHub (recommended)
1. Extract the ZIP.
2. Create a GitHub repository and upload `index.html`, `styles.css`, `app.js`, and `README.md` to its root.
3. In Vercel, choose **Add New → Project**, import that repository.
4. Framework preset: **Other**. Build command: leave empty. Output directory: leave as `.` (or the root/default for a static site).
5. Deploy. Future pushes to the connected branch deploy automatically.

### Option B — Vercel CLI
Install Node.js, then:
```bash
npm install -g vercel
cd clat_manifestation_planner
vercel
```
Follow the prompts. For production deployment, run `vercel --prod`.

## Run locally
You can open `index.html` directly in a browser, or use a local static server:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Important data note
This version stores checklist, journal and mock data in local browser storage. It stays in that browser on that device and does not automatically sync across devices. Clearing browser site data can remove it. For cross-device sync and login, add a backend such as Supabase or Firebase in a future version.

## Customization
- Change subject rotation and task descriptions in `app.js`.
- Edit the visual design and responsive layout in `styles.css`.
- Edit page sections in `index.html`.
