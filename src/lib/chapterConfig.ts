import type { ExamType } from "../data/syllabus";

const STORAGE_KEY = "syllabus-slicer:chapter-overrides:v1";

// chapterId -> included, keyed per exam. Absence means "use the data
// dictionary's default" rather than any particular value.
export type OverrideMap = Record<ExamType, Record<string, boolean>>;

function emptyOverrides(): OverrideMap {
  return { JEE: {}, CET: {}, NCERT: {} };
}

export function loadOverrides(): OverrideMap {
  if (typeof window === "undefined") return emptyOverrides();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyOverrides();
    const parsed = JSON.parse(raw);
    return { ...emptyOverrides(), ...parsed };
  } catch {
    return emptyOverrides();
  }
}

export function saveOverrides(overrides: OverrideMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function isChapterIncluded(
  chapterId: string,
  exam: ExamType,
  overrides: OverrideMap,
  defaultIncluded: boolean
): boolean {
  const override = overrides[exam]?.[chapterId];
  return override ?? defaultIncluded;
}
