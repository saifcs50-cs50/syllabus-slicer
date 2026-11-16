// Syllabus Slicer data
// Chapter weight numbers are relative-within-subject scores (roughly 0-10) used
// by the slicer engine to allocate study hours. Tiers/labels are derived from
// weight, not hand-typed, so the display text always matches the number driving
// the algorithm.

export type ExamType = "JEE" | "CET" | "NCERT";

// `ink` is the text colour that stays readable on top of `color`.
export const EXAM_META: Record<
  ExamType,
  { label: string; full: string; color: string; ink: string }
> = {
  JEE: { label: "JEE Main", full: "JEE Main", color: "var(--color-jee)", ink: "#ffffff" },
  CET: { label: "KCET", full: "Karnataka CET", color: "var(--color-cet)", ink: "#05050a" },
  NCERT: { label: "NCERT", full: "NCERT / Board Level", color: "var(--color-ncert)", ink: "#05050a" },
};

export type SubjectId = "physics" | "chemistry" | "math" | "cs" | "english" | "hindi";

// English, CS, and Hindi are board-level subjects only: JEE Main and KCET
// don't examine them at all, so they only ever apply under NCERT / board mode.
export const SUBJECTS_BY_EXAM: Record<ExamType, SubjectId[]> = {
  JEE: ["physics", "chemistry", "math"],
  CET: ["physics", "chemistry", "math"],
  NCERT: ["physics", "chemistry", "math", "cs", "english", "hindi"],
};

export const SUBJECT_META: Record<SubjectId, { name: string; short: string; color: string }> = {
  physics: { name: "Physics", short: "P", color: "var(--color-physics)" },
  chemistry: { name: "Chemistry", short: "C", color: "var(--color-chemistry)" },
  math: { name: "Mathematics", short: "M", color: "var(--color-math)" },
  cs: { name: "Computer Science", short: "CS", color: "var(--color-cs)" },
  english: { name: "English", short: "En", color: "var(--color-english)" },
  hindi: { name: "Hindi", short: "Hi", color: "var(--color-hindi)" },
};

// Overall paper weightage (% of the exam) per subject, per exam type.
// JEE uses a custom 35% Math / 22.5% Physics / 22.5% Chemistry split. It is a
// planning bias towards Maths, not the official marks split (roughly equal in the real paper).
// CET treats each subject's paper independently (near-equal split).
// NCERT/board mode covers all six subjects. P/C/M stay equal to each other
// (so a P/C/M-only board plan behaves exactly as before), while CS/English/Hindi
// get a smaller share reflecting less raw content volume than the science majors.
export const PAPER_WEIGHTAGE: Record<SubjectId, Record<ExamType, number>> = {
  math: { JEE: 35, CET: 33.4, NCERT: 19 },
  physics: { JEE: 22.5, CET: 33.3, NCERT: 19 },
  chemistry: { JEE: 22.5, CET: 33.3, NCERT: 19 },
  cs: { JEE: 0, CET: 0, NCERT: 17 },
  english: { JEE: 0, CET: 0, NCERT: 14 },
  hindi: { JEE: 0, CET: 0, NCERT: 12 },
};

type JeeTier = "Very High" | "High" | "Moderate" | "Low";
type CetTier = "Very High" | "High" | "Moderate" | "Low";
type NcertTier = "Extensive" | "Standard" | "Foundational" | "Quick Revision";

function jeeTier(w: number): JeeTier {
  if (w >= 7) return "Very High";
  if (w >= 4.5) return "High";
  if (w >= 2.5) return "Moderate";
  return "Low";
}
function cetTier(w: number): CetTier {
  if (w >= 7) return "Very High";
  if (w >= 4.5) return "High";
  if (w >= 2.5) return "Moderate";
  return "Low";
}
function ncertTier(w: number): NcertTier {
  if (w >= 7) return "Extensive";
  if (w >= 4.5) return "Standard";
  if (w >= 2.5) return "Foundational";
  return "Quick Revision";
}

export interface WeightageProfile {
  tier: string;
  weight: number;
  label: string;
}

export interface Chapter {
  id: string;
  name: string;
  class: "11" | "12";
  subject: SubjectId;
  highYield: boolean;
  weightage: Record<ExamType, WeightageProfile>;
  // Whether this chapter is part of a given exam's syllabus at all, distinct
  // from weightage, which only applies once a chapter is included.
  included: Record<ExamType, boolean>;
}

interface RawChapter {
  name: string;
  cls: "11" | "12";
  jee: number;
  cet: number;
  ncert: number;
  highYield?: boolean;
  // Exams whose syllabus does NOT cover this chapter at all.
  excludeFrom?: ExamType[];
}

function buildChapter(subject: SubjectId, raw: RawChapter): Chapter {
  const id = `${subject}-${raw.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  const jTier = jeeTier(raw.jee);
  const cTier = cetTier(raw.cet);
  const nTier = ncertTier(raw.ncert);
  const excluded = new Set(raw.excludeFrom ?? []);
  return {
    id,
    name: raw.name,
    class: raw.cls,
    subject,
    highYield: !!raw.highYield,
    weightage: {
      JEE: { tier: jTier, weight: raw.jee, label: `${jTier} (${raw.jee}%)` },
      CET: { tier: cTier, weight: raw.cet, label: cTier },
      NCERT: { tier: nTier, weight: raw.ncert, label: nTier },
    },
    included: {
      JEE: !excluded.has("JEE"),
      CET: !excluded.has("CET"),
      NCERT: !excluded.has("NCERT"),
    },
  };
}

const PHYSICS_RAW: RawChapter[] = [
  { name: "Units and Measurements", cls: "11", jee: 1.5, cet: 2, ncert: 2 },
  { name: "Kinematics", cls: "11", jee: 3.5, cet: 5, ncert: 4.5 },
  { name: "Laws of Motion", cls: "11", jee: 4, cet: 5.5, ncert: 5 },
  { name: "Work, Energy and Power", cls: "11", jee: 3, cet: 4, ncert: 4 },
  { name: "Rotational Motion", cls: "11", jee: 6.5, cet: 4.5, ncert: 5.5 },
  { name: "Gravitation", cls: "11", jee: 2.5, cet: 3, ncert: 3.5 },
  { name: "Thermodynamics", cls: "11", jee: 6.5, cet: 5, ncert: 5.5, highYield: true },
  { name: "Kinetic Theory of Gases", cls: "11", jee: 2, cet: 2.5, ncert: 3 },
  { name: "Oscillations and Waves", cls: "11", jee: 5, cet: 6, ncert: 5.5 },
  { name: "Electrostatics", cls: "12", jee: 7, cet: 7, ncert: 6.5 },
  { name: "Current Electricity", cls: "12", jee: 6.5, cet: 8, ncert: 5.5 },
  { name: "Magnetism and Matter", cls: "12", jee: 5.5, cet: 5, ncert: 4.5 },
  { name: "Electromagnetic Induction and AC", cls: "12", jee: 5, cet: 5, ncert: 4.5 },
  { name: "Geometrical Optics", cls: "12", jee: 7, cet: 6.5, ncert: 5.5, highYield: true },
  { name: "Wave Optics", cls: "12", jee: 3, cet: 3, ncert: 3.5 },
  { name: "Dual Nature of Radiation and Matter", cls: "12", jee: 4, cet: 4, ncert: 4 },
  { name: "Atoms and Nuclei", cls: "12", jee: 4, cet: 4.5, ncert: 4.5 },
  { name: "Semiconductor Electronics", cls: "12", jee: 4, cet: 5, ncert: 4.5 },
];

const CHEMISTRY_RAW: RawChapter[] = [
  { name: "Some Basic Concepts of Chemistry", cls: "11", jee: 2, cet: 3, ncert: 3.5 },
  { name: "Atomic Structure", cls: "11", jee: 3.5, cet: 4.5, ncert: 4 },
  { name: "Chemical Bonding and Molecular Structure", cls: "11", jee: 5.5, cet: 6, ncert: 5.5 },
  { name: "States of Matter", cls: "11", jee: 2.5, cet: 3, ncert: 3 },
  { name: "Chemical Thermodynamics", cls: "11", jee: 5, cet: 5, ncert: 4.5 },
  { name: "Equilibrium", cls: "11", jee: 6, cet: 6.5, ncert: 5.5 },
  { name: "Redox Reactions and Electrochemistry", cls: "12", jee: 5.5, cet: 6, ncert: 5 },
  { name: "Chemical Kinetics", cls: "12", jee: 4, cet: 4.5, ncert: 4 },
  { name: "Periodic Table and Periodicity", cls: "11", jee: 3, cet: 4, ncert: 3.5 },
  { name: "p-Block Elements", cls: "12", jee: 5, cet: 5.5, ncert: 5.5 },
  { name: "d and f Block Elements", cls: "12", jee: 5, cet: 5, ncert: 5 },
  { name: "Coordination Compounds", cls: "12", jee: 7, cet: 6.5, ncert: 5.5, highYield: true },
  { name: "General Organic Chemistry", cls: "11", jee: 6, cet: 5.5, ncert: 5 },
  { name: "Hydrocarbons", cls: "11", jee: 4, cet: 4.5, ncert: 4.5 },
  { name: "Haloalkanes and Haloarenes", cls: "12", jee: 4, cet: 4, ncert: 4 },
  { name: "Alcohols, Phenols and Ethers", cls: "12", jee: 4, cet: 4, ncert: 4 },
  { name: "Aldehydes, Ketones and Carboxylic Acids", cls: "12", jee: 4.5, cet: 4.5, ncert: 4.5 },
  { name: "Amines and Biomolecules", cls: "12", jee: 3.5, cet: 4, ncert: 4 },
];

const MATH_RAW: RawChapter[] = [
  { name: "Sets, Relations and Functions", cls: "11", jee: 2, cet: 3, ncert: 3 },
  { name: "Complex Numbers and Quadratic Equations", cls: "11", jee: 4, cet: 4.5, ncert: 4 },
  { name: "Matrices and Determinants", cls: "12", jee: 5, cet: 5.5, ncert: 5 },
  { name: "Permutations and Combinations", cls: "11", jee: 3.5, cet: 4, ncert: 3.5 },
  { name: "Binomial Theorem", cls: "11", jee: 3, cet: 3.5, ncert: 3 },
  { name: "Sequences and Series", cls: "11", jee: 3, cet: 4, ncert: 3.5 },
  { name: "Limits, Continuity and Differentiability", cls: "12", jee: 5.5, cet: 6, ncert: 5.5 },
  { name: "Application of Derivatives", cls: "12", jee: 5, cet: 5.5, ncert: 5 },
  { name: "Integral Calculus", cls: "12", jee: 6.5, cet: 6.5, ncert: 6 },
  { name: "Differential Equations", cls: "12", jee: 4.5, cet: 4.5, ncert: 4 },
  { name: "Coordinate Geometry", cls: "11", jee: 5.5, cet: 6, ncert: 5.5 },
  { name: "Conic Sections", cls: "11", jee: 4.5, cet: 5, ncert: 4.5 },
  { name: "Three Dimensional Geometry", cls: "12", jee: 7.5, cet: 6, ncert: 5, highYield: true },
  { name: "Vector Algebra", cls: "12", jee: 4.5, cet: 4.5, ncert: 4 },
  { name: "Statistics and Probability", cls: "11", jee: 3.5, cet: 4, ncert: 4 },
  { name: "Trigonometry", cls: "11", jee: 4, cet: 5, ncert: 4.5 },
  { name: "Mathematical Reasoning", cls: "11", jee: 1.5, cet: 2.5, ncert: 2.5, excludeFrom: ["JEE"] },
];

// Board-only subjects, not tested by JEE Main or KCET at all, so every
// chapter here is excluded from both.
const BOARD_ONLY: ExamType[] = ["JEE", "CET"];

const CS_RAW: RawChapter[] = [
  { name: "Python Revision Tour – Functions & Modules", cls: "12", jee: 0, cet: 0, ncert: 6, excludeFrom: BOARD_ONLY },
  { name: "Data Structures – Stacks & Queues", cls: "12", jee: 0, cet: 0, ncert: 7, excludeFrom: BOARD_ONLY },
  { name: "File Handling in Python", cls: "12", jee: 0, cet: 0, ncert: 6.5, excludeFrom: BOARD_ONLY },
  { name: "Database Concepts & SQL", cls: "12", jee: 0, cet: 0, ncert: 8, highYield: true, excludeFrom: BOARD_ONLY },
  { name: "Networking Concepts", cls: "12", jee: 0, cet: 0, ncert: 5, excludeFrom: BOARD_ONLY },
  { name: "Object-Oriented Programming Concepts", cls: "12", jee: 0, cet: 0, ncert: 4.5, excludeFrom: BOARD_ONLY },
  { name: "Boolean Algebra & Logic Gates", cls: "11", jee: 0, cet: 0, ncert: 5.5, excludeFrom: BOARD_ONLY },
  { name: "Web Technologies (HTML Basics)", cls: "12", jee: 0, cet: 0, ncert: 3.5, excludeFrom: BOARD_ONLY },
  { name: "Cyber Safety & Ethics", cls: "12", jee: 0, cet: 0, ncert: 2.5, excludeFrom: BOARD_ONLY },
];

const ENGLISH_RAW: RawChapter[] = [
  { name: "Reading Comprehension", cls: "12", jee: 0, cet: 0, ncert: 5, excludeFrom: BOARD_ONLY },
  { name: "Grammar & Vocabulary", cls: "12", jee: 0, cet: 0, ncert: 7.5, excludeFrom: BOARD_ONLY },
  { name: "Prose – Detailed Study", cls: "12", jee: 0, cet: 0, ncert: 8.5, highYield: true, excludeFrom: BOARD_ONLY },
  { name: "Poetry – Detailed Study", cls: "12", jee: 0, cet: 0, ncert: 6, excludeFrom: BOARD_ONLY },
  { name: "Non-Detailed / Supplementary Reading", cls: "12", jee: 0, cet: 0, ncert: 5.5, excludeFrom: BOARD_ONLY },
  { name: "Writing Skills – Letter Writing", cls: "12", jee: 0, cet: 0, ncert: 4, excludeFrom: BOARD_ONLY },
  { name: "Writing Skills – Essay Writing", cls: "12", jee: 0, cet: 0, ncert: 4.5, excludeFrom: BOARD_ONLY },
  { name: "Note Making & Summarizing", cls: "12", jee: 0, cet: 0, ncert: 3, excludeFrom: BOARD_ONLY },
  { name: "Dialogue Writing / Information Transfer", cls: "12", jee: 0, cet: 0, ncert: 2.5, excludeFrom: BOARD_ONLY },
];

const HINDI_RAW: RawChapter[] = [
  { name: "Gadya (Prose)", cls: "12", jee: 0, cet: 0, ncert: 8, highYield: true, excludeFrom: BOARD_ONLY },
  { name: "Padya (Poetry)", cls: "12", jee: 0, cet: 0, ncert: 6.5, excludeFrom: BOARD_ONLY },
  { name: "Vyakaran (Grammar)", cls: "12", jee: 0, cet: 0, ncert: 7.5, excludeFrom: BOARD_ONLY },
  { name: "Rachna (Letter & Essay Writing)", cls: "12", jee: 0, cet: 0, ncert: 5, excludeFrom: BOARD_ONLY },
  { name: "Anuvad (Translation)", cls: "12", jee: 0, cet: 0, ncert: 4, excludeFrom: BOARD_ONLY },
  { name: "Shabd Bhandar (Vocabulary)", cls: "12", jee: 0, cet: 0, ncert: 3, excludeFrom: BOARD_ONLY },
];

export const SYLLABUS: Record<SubjectId, Chapter[]> = {
  physics: PHYSICS_RAW.map((r) => buildChapter("physics", r)),
  chemistry: CHEMISTRY_RAW.map((r) => buildChapter("chemistry", r)),
  math: MATH_RAW.map((r) => buildChapter("math", r)),
  cs: CS_RAW.map((r) => buildChapter("cs", r)),
  english: ENGLISH_RAW.map((r) => buildChapter("english", r)),
  hindi: HINDI_RAW.map((r) => buildChapter("hindi", r)),
};

export const ALL_CHAPTERS: Chapter[] = [
  ...SYLLABUS.physics,
  ...SYLLABUS.chemistry,
  ...SYLLABUS.math,
  ...SYLLABUS.cs,
  ...SYLLABUS.english,
  ...SYLLABUS.hindi,
];
