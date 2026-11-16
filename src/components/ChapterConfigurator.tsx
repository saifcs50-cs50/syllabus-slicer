import { motion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import {
  ALL_CHAPTERS,
  EXAM_META,
  SUBJECT_META,
  SUBJECTS_BY_EXAM,
  type ExamType,
  type SubjectId,
} from "../data/syllabus";
import { isChapterIncluded, type OverrideMap } from "../lib/chapterConfig";

interface Props {
  exam: ExamType;
  overrides: OverrideMap;
  onChange: (next: OverrideMap) => void;
  onClose: () => void;
}

export default function ChapterConfigurator({ exam, overrides, onChange, onClose }: Props) {
  const meta = EXAM_META[exam];
  const examOverrides = overrides[exam] ?? {};
  const subjectsForExam = SUBJECTS_BY_EXAM[exam];

  const included = (chapterId: string, defaultIncluded: boolean) =>
    isChapterIncluded(chapterId, exam, overrides, defaultIncluded);

  const toggle = (chapterId: string, defaultIncluded: boolean) => {
    const current = included(chapterId, defaultIncluded);
    onChange({
      ...overrides,
      [exam]: { ...examOverrides, [chapterId]: !current },
    });
  };

  const resetSubject = (subject: SubjectId) => {
    const next = { ...examOverrides };
    for (const c of ALL_CHAPTERS) {
      if (c.subject === subject) delete next[c.id];
    }
    onChange({ ...overrides, [exam]: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="panel-strong flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl"
      >
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-lg font-bold text-white">Configure chapters</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Choose which chapters count toward{" "}
              <span className="font-semibold" style={{ color: meta.color }}>
                {meta.full}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-lg border border-white/10 p-1.5 text-gray-300 transition-colors hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {subjectsForExam.map((subject) => {
            const subMeta = SUBJECT_META[subject];
            const subjectChapters = ALL_CHAPTERS.filter((c) => c.subject === subject);
            const includedCount = subjectChapters.filter((c) =>
              included(c.id, c.included[exam])
            ).length;

            return (
              <div key={subject}>
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: subMeta.color }}
                  >
                    {subMeta.name} · {includedCount}/{subjectChapters.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => resetSubject(subject)}
                    className="flex cursor-pointer items-center gap-1 text-[11px] text-gray-500 transition-colors hover:text-gray-300"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                </div>
                <div className="space-y-1.5">
                  {subjectChapters.map((c) => {
                    const isIn = included(c.id, c.included[exam]);
                    const inSyllabus = c.included[exam];
                    return (
                      <label
                        key={c.id}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors"
                        style={{
                          borderColor: isIn
                            ? `color-mix(in srgb, ${subMeta.color} 20%, transparent)`
                            : "rgba(255,255,255,0.06)",
                          background: isIn
                            ? `color-mix(in srgb, ${subMeta.color} 5%, transparent)`
                            : "rgba(255,255,255,0.02)",
                          opacity: isIn ? 1 : 0.55,
                        }}
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isIn}
                            onChange={() => toggle(c.id, c.included[exam])}
                            className="h-4 w-4 cursor-pointer"
                          />
                          <span className="text-gray-200">{c.name}</span>
                          {!inSyllabus && (
                            <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                              Not in default syllabus
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-[10px] text-gray-500">
                          {c.weightage[exam].label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/10 p-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl px-8 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: meta.color, color: meta.ink }}
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
