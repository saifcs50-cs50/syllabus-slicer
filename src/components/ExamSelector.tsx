import { motion } from "framer-motion";
import { EXAM_META, type ExamType } from "../data/syllabus";

const EXAMS: ExamType[] = ["JEE", "CET", "NCERT"];

interface Props {
  value: ExamType;
  onChange: (exam: ExamType) => void;
}

export default function ExamSelector({ value, onChange }: Props) {
  return (
    <div
      className="relative flex gap-1 rounded-2xl p-1.5 glass glow-border"
      style={{ perspective: 500 }}
    >
      {EXAMS.map((exam) => {
        const meta = EXAM_META[exam];
        const active = exam === value;
        return (
          <motion.button
            key={exam}
            onClick={() => onChange(exam)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94, rotateX: 18 }}
            className="relative z-10 flex-1 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide transition-colors sm:text-base cursor-pointer"
            style={{ color: active ? "#05050a" : "#9ca3af" }}
          >
            {active && (
              <motion.div
                layoutId="exam-pill"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${meta.color}, ${meta.glow})`,
                  boxShadow: `0 0 24px ${meta.color}88, 0 0 4px ${meta.color}`,
                }}
              />
            )}
            <span className="relative">{meta.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
