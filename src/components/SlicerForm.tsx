import { motion } from "framer-motion";
import { ListChecks, Zap } from "lucide-react";
import { SUBJECT_META, SUBJECTS_BY_EXAM, type ExamType, type SubjectId } from "../data/syllabus";

interface Props {
  exam: ExamType;
  totalDays: number;
  setTotalDays: (n: number) => void;
  hoursPerDay: number;
  setHoursPerDay: (n: number) => void;
  subjects: SubjectId[];
  setSubjects: (s: SubjectId[] | ((prev: SubjectId[]) => SubjectId[])) => void;
  onSlice: () => void;
  includedChapterCount: number;
  totalChapterCount: number;
  onConfigureChapters: () => void;
}

export default function SlicerForm({
  exam,
  totalDays,
  setTotalDays,
  hoursPerDay,
  setHoursPerDay,
  subjects,
  setSubjects,
  onSlice,
  includedChapterCount,
  totalChapterCount,
  onConfigureChapters,
}: Props) {
  const availableSubjects = SUBJECTS_BY_EXAM[exam];
  const toggleSubject = (s: SubjectId) => {
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const canSlice = totalDays > 0 && hoursPerDay > 0 && subjects.length > 0;

  return (
    <div className="glass glow-border rounded-2xl p-6 space-y-6">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400">
          Total Days Until Exam
        </label>
        <input
          type="number"
          min={1}
          max={730}
          value={totalDays}
          onChange={(e) => setTotalDays(Math.max(1, Number(e.target.value) || 0))}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-lg font-semibold text-white outline-none transition-colors focus:border-[var(--color-jee)] focus:ring-2 focus:ring-[var(--color-jee)]/40"
          placeholder="e.g. 90"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400">
            Available Study Hours / Day
          </label>
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-sm font-bold text-white">
            {hoursPerDay}h
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={16}
          step={0.5}
          value={hoursPerDay}
          onChange={(e) => setHoursPerDay(Number(e.target.value))}
          className="slicer-range w-full"
        />
        <div className="mt-1 flex justify-between text-[11px] text-gray-500">
          <span>1h</span>
          <span>16h</span>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400">
          Select Subjects to Slice
        </label>
        <div className="grid grid-cols-3 gap-2" style={{ perspective: 500 }}>
          {availableSubjects.map((s) => {
            const meta = SUBJECT_META[s];
            const active = subjects.includes(s);
            return (
              <motion.button
                key={s}
                type="button"
                onClick={() => toggleSubject(s)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.93, rotateX: 14 }}
                className="flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-colors cursor-pointer"
                style={{
                  borderColor: active ? meta.color : "rgba(255,255,255,0.1)",
                  background: active ? `${meta.color}1a` : "rgba(255,255,255,0.02)",
                  boxShadow: active ? `0 0 16px ${meta.color}55` : "none",
                }}
              >
                <motion.span
                  animate={{ rotateY: active ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    background: active ? meta.color : "rgba(255,255,255,0.08)",
                    color: active ? "#05050a" : "#9ca3af",
                  }}
                >
                  {meta.short}
                </motion.span>
                <span className="text-xs font-medium text-gray-300">{meta.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onConfigureChapters}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/5"
      >
        <span className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-gray-400" />
          Configure Chapters
        </span>
        <span className="text-xs text-gray-500">
          {includedChapterCount}/{totalChapterCount} included
        </span>
      </button>

      <motion.button
        whileHover={canSlice ? { scale: 1.02, y: -2 } : {}}
        whileTap={canSlice ? { scale: 0.96, rotateX: 12 } : {}}
        style={{ perspective: 500 }}
        disabled={!canSlice}
        onClick={onSlice}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-jee)] via-[var(--color-cet)] to-[var(--color-ncert)] px-6 py-4 text-base font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Zap className="h-5 w-5" fill="currentColor" />
        Slice My Syllabus
      </motion.button>
    </div>
  );
}
