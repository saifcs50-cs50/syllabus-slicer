import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Flame, Clock, BookOpen, CalendarDays } from "lucide-react";
import { EXAM_META, SUBJECT_META } from "../data/syllabus";
import type { SlicerResult } from "../lib/slicerEngine";
import TiltCard from "./TiltCard";

interface Props {
  result: SlicerResult;
}

export default function OutputDashboard({ result }: Props) {
  const meta = EXAM_META[result.examType];

  return (
    <div className="relative space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <StatCard icon={<Clock className="h-4 w-4" />} label="Total Hours" value={`${result.totalHours}h`} color={meta.color} />
        <StatCard icon={<BookOpen className="h-4 w-4" />} label="Chapters" value={String(result.chapters.length)} color={meta.color} />
        <StatCard icon={<Flame className="h-4 w-4" />} label="Do or Die" value={String(result.doOrDie.length)} color="var(--color-doordie)" />
        <StatCard icon={<CalendarDays className="h-4 w-4" />} label="Days Left" value={String(result.totalDays)} color={meta.color} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="glass glow-border rounded-2xl p-5"
      >
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Hours by Subject — {meta.full}
        </h3>
        <div className="space-y-4">
          {result.subjects.map((s) => {
            const subMeta = SUBJECT_META[s];
            const hrs = result.hoursBySubject[s] ?? 0;
            const pct = result.totalHours > 0 ? (hrs / result.totalHours) * 100 : 0;
            return (
              <div key={s}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-gray-200">{subMeta.name}</span>
                  <span className="text-gray-400">{hrs}h</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: subMeta.color, boxShadow: `0 0 8px ${subMeta.color}` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[var(--color-doordie)]">
          <Flame className="h-4 w-4" /> Do-or-Die Chapters
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {result.doOrDie.map((c, i) => (
            <TiltCard
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.03 }}
              maxTilt={10}
              className="glass relative overflow-hidden rounded-xl p-4"
              style={{
                border: "1px solid rgba(244,63,94,0.4)",
                boxShadow: "0 0 20px rgba(244,63,94,0.2)",
              }}
            >
              <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-[var(--color-doordie)]/20 blur-xl" />
              <div className="mb-1.5 flex items-center justify-between">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: SUBJECT_META[c.subject].color }}
                >
                  {SUBJECT_META[c.subject].name}
                </span>
                <span className="rounded-full bg-[var(--color-doordie)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--color-doordie-glow)]">
                  {c.weightage[result.examType].label}
                </span>
              </div>
              <p className="text-sm font-semibold text-white">{c.name}</p>
              <p className="mt-1 text-xs text-gray-400">{c.hours}h allocated</p>
            </TiltCard>
          ))}
          {result.doOrDie.length === 0 && (
            <p className="text-sm text-gray-500">No standout high-weightage chapters in this selection.</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-300">
          Week-by-Week Timeline
        </h3>
        <div className="glass glow-border max-h-[560px] space-y-4 overflow-y-auto rounded-2xl p-4 pr-3">
          {result.weeks.map((week, i) => (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.6) }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
                <span className="text-sm font-bold text-white">Week {week.week}</span>
                <span className="text-xs text-gray-500">
                  Day {week.startDay}–{week.endDay} · {week.allocatedHours}h / {week.capacityHours}h
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {week.items.map((item) => (
                  <span
                    key={item.chapter.id}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs"
                    style={{
                      background: `${SUBJECT_META[item.chapter.subject].color}1a`,
                      border: `1px solid ${SUBJECT_META[item.chapter.subject].color}44`,
                    }}
                  >
                    {item.chapter.isDoOrDie && (
                      <Flame className="h-3 w-3 text-[var(--color-doordie-glow)]" />
                    )}
                    <span className="font-medium text-gray-200">{item.chapter.name}</span>
                    <span className="text-gray-500">{item.hours}h</span>
                  </span>
                ))}
                {week.items.length === 0 && (
                  <span className="text-xs text-gray-600">Buffer / revision week</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <TiltCard maxTilt={12} className="glass glow-border rounded-xl p-4">
      <div
        className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: `${color}22`, color }}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </TiltCard>
  );
}
