# Syllabus Slicer

A small web tool that turns "I have N days and H hours a day" into a week-by-week study plan.
You pick an exam (JEE Main, KCET, or an NCERT / board-level plan), the subjects you want to cover and
how much time you have. It splits the total hours between subjects and chapters by weight, flags the
highest-weight chapters as "Do or Die", and lays everything out as a timeline.

Everything runs in the browser. There is no backend, no account and no network call after the page loads.

**Try it live: https://saifcs50-cs50.github.io/syllabus-slicer/**

![Syllabus Slicer with a 90-day JEE Main plan](screenshot.png)

## What it does

- **Three exam modes:** JEE Main (Physics, Chemistry, Maths), KCET (same three subjects) and an
  NCERT / board mode that also offers Computer Science, English and Hindi.
- **Inputs:** days until the exam, study hours per day (1 to 16, in half-hour steps) and which subjects to include.
- **Output:** total hours, hours per subject, hours per chapter, a list of high-weight chapters, and a
  week-by-week timeline. A chapter that doesn't fit in one week is split across weeks.
- **Chapter configurator:** switch individual chapters in or out for each exam. Your choices are kept in
  your browser's `localStorage` on your own device and are never sent anywhere.

## How the plan is calculated

1. Total hours = days × hours per day.
2. Each selected subject gets a share of those hours, proportional to its paper weight for the chosen exam.
3. Inside a subject, each included chapter gets a share proportional to its chapter weight (minimum half an hour).
4. Chapters are interleaved across subjects, highest weight first, and packed into weeks.

The weights live in [`src/data/syllabus.ts`](src/data/syllabus.ts) and the maths in
[`src/lib/slicerEngine.ts`](src/lib/slicerEngine.ts).

## Please read: the weights are rough

The chapter weights (roughly 0 to 10) and the per-subject paper weights are **hand-set estimates for planning**,
not official figures from any exam body. In particular:

- The JEE Main split (35% Maths / 22.5% Physics / 22.5% Chemistry) is a deliberate bias towards Maths.
  The real paper is roughly equal across the three subjects.
- The Computer Science, English and Hindi chapter lists are generic groupings. Check them against the
  syllabus of your own board and use the chapter configurator to adjust.
- Chapter names follow the usual public syllabus headings. No textbook text is included.

Treat the output as a starting point and edit the data file to match your own syllabus and priorities.

## Run it

You need Node.js 20.19 or newer (or 22.12 or newer), which is what Vite 8 requires.

```bash
npm ci
npm run dev
```

Then open the address Vite prints (by default `http://localhost:5173`).

Other scripts:

```bash
npm run build     # type-check and build to dist/
npm run preview   # serve the built files locally
npm run lint      # oxlint
```

The live demo is the same build with GitHub Pages' sub-path: `npx vite build --base=/syllabus-slicer/`.

There is no automated test suite yet.

## Built with

React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion and Lucide icons.

## Licence

[MIT](LICENSE). Not affiliated with, or endorsed by, any exam body, board or coaching institute.
