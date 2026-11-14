import {
  ALL_CHAPTERS,
  PAPER_WEIGHTAGE,
  type Chapter,
  type ExamType,
  type SubjectId,
} from "../data/syllabus";

export interface AllocatedChapter extends Chapter {
  hours: number;
  isDoOrDie: boolean;
}

export interface WeekPlan {
  week: number;
  startDay: number;
  endDay: number;
  capacityHours: number;
  allocatedHours: number;
  items: { chapter: AllocatedChapter; hours: number }[];
}

export interface SlicerResult {
  examType: ExamType;
  totalDays: number;
  hoursPerDay: number;
  totalHours: number;
  subjects: SubjectId[];
  hoursBySubject: Record<string, number>;
  chapters: AllocatedChapter[];
  doOrDie: AllocatedChapter[];
  weeks: WeekPlan[];
}

const TOP_TIER: Record<ExamType, string> = {
  JEE: "Very High",
  CET: "Very High",
  NCERT: "Extensive",
};

const round2 = (n: number) => Math.round(n * 2) / 2;

export function sliceSyllabus(input: {
  examType: ExamType;
  totalDays: number;
  hoursPerDay: number;
  subjects: SubjectId[];
  excludedChapterIds?: Set<string>;
}): SlicerResult {
  const { examType, totalDays, hoursPerDay, subjects, excludedChapterIds } = input;
  const totalHours = totalDays * hoursPerDay;
  const excluded = excludedChapterIds ?? new Set<string>();

  // A chapter counts only if the exam's syllabus covers it at all AND it
  // hasn't been manually excluded via the chapter configurator.
  const chaptersBySubject = new Map<SubjectId, Chapter[]>();
  const activeSubjects: SubjectId[] = [];
  for (const subject of subjects) {
    const subjectChapters = ALL_CHAPTERS.filter(
      (c) => c.subject === subject && c.included[examType] && !excluded.has(c.id)
    );
    if (subjectChapters.length > 0) {
      chaptersBySubject.set(subject, subjectChapters);
      activeSubjects.push(subject);
    }
  }

  const subjectWeightSum = activeSubjects.reduce(
    (sum, s) => sum + PAPER_WEIGHTAGE[s][examType],
    0
  );

  const hoursBySubject: Record<string, number> = {};
  const chapters: AllocatedChapter[] = [];

  for (const subject of activeSubjects) {
    const subjectShare =
      subjectWeightSum > 0 ? PAPER_WEIGHTAGE[subject][examType] / subjectWeightSum : 0;
    const subjectHours = totalHours * subjectShare;
    hoursBySubject[subject] = round2(subjectHours);

    const subjectChapters = chaptersBySubject.get(subject)!;
    const chapterWeightSum = subjectChapters.reduce(
      (sum, c) => sum + c.weightage[examType].weight,
      0
    );

    for (const chapter of subjectChapters) {
      const chapterShare =
        chapterWeightSum > 0 ? chapter.weightage[examType].weight / chapterWeightSum : 0;
      const hours = Math.max(0.5, round2(subjectHours * chapterShare));
      const isDoOrDie =
        chapter.highYield || chapter.weightage[examType].tier === TOP_TIER[examType];
      chapters.push({ ...chapter, hours, isDoOrDie });
    }
  }

  chapters.sort((a, b) => b.hours - a.hours);
  const doOrDie = chapters.filter((c) => c.isDoOrDie).sort((a, b) => b.hours - a.hours);

  const weeks = buildWeeklyTimeline(chapters, totalDays, hoursPerDay, activeSubjects);

  return {
    examType,
    totalDays,
    hoursPerDay,
    totalHours: round2(totalHours),
    subjects: activeSubjects,
    hoursBySubject,
    chapters,
    doOrDie,
    weeks,
  };
}

// Interleaves chapters round-robin across subjects (highest-weight first within
// each subject) so a study week isn't dominated by a single subject, then bin-packs
// them into week-capacity buckets — splitting a chapter across weeks if it overflows.
function buildWeeklyTimeline(
  chapters: AllocatedChapter[],
  totalDays: number,
  hoursPerDay: number,
  subjects: SubjectId[]
): WeekPlan[] {
  const bySubject: Record<string, AllocatedChapter[]> = {};
  for (const s of subjects) {
    bySubject[s] = chapters
      .filter((c) => c.subject === s)
      .sort((a, b) => b.hours - a.hours);
  }

  const ordered: AllocatedChapter[] = [];
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const s of subjects) {
      const next = bySubject[s].shift();
      if (next) {
        ordered.push(next);
        remaining = true;
      }
    }
  }

  const totalWeeks = Math.ceil(totalDays / 7);
  const weeks: WeekPlan[] = [];
  for (let w = 0; w < totalWeeks; w++) {
    const startDay = w * 7 + 1;
    const daysInWeek = Math.min(7, totalDays - w * 7);
    const endDay = startDay + daysInWeek - 1;
    weeks.push({
      week: w + 1,
      startDay,
      endDay,
      capacityHours: round2(daysInWeek * hoursPerDay),
      allocatedHours: 0,
      items: [],
    });
  }
  if (weeks.length === 0) return weeks;

  let weekIdx = 0;
  const queue = ordered.map((c) => ({ chapter: c, hoursLeft: c.hours }));

  for (const entry of queue) {
    while (entry.hoursLeft > 0.001 && weekIdx < weeks.length) {
      const week = weeks[weekIdx];
      const space = week.capacityHours - week.allocatedHours;
      if (space <= 0.001) {
        weekIdx++;
        continue;
      }
      const take = Math.min(space, entry.hoursLeft);
      const existing = week.items.find((i) => i.chapter.id === entry.chapter.id);
      if (existing) {
        existing.hours = round2(existing.hours + take);
      } else {
        week.items.push({ chapter: entry.chapter, hours: round2(take) });
      }
      week.allocatedHours = round2(week.allocatedHours + take);
      entry.hoursLeft = round2(entry.hoursLeft - take);
      if (week.allocatedHours >= week.capacityHours - 0.001) {
        weekIdx++;
      }
    }
  }

  return weeks;
}
