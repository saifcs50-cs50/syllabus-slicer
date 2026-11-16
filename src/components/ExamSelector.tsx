import { motion } from "framer-motion";
import { EXAM_META, type ExamType } from "../data/syllabus";

const EXAMS: ExamType[] = ["JEE", "CET", "NCERT"];

interface Props {
  value: ExamType;
  onChange: (exam: ExamType) => void;
}

export default function ExamSelector({ value, onChange }: Props) {
  return (
    <div className="panel relative flex gap-1 rounded-2xl p-1.5">
      {EXAMS.map((exam) => {
        const meta = EXAM_META[exam];
        const active = exam === value;
        return (
          <button
            key={exam}
            type="button"
            onClick={() => onChange(exam)}
            className="relative z-10 flex-1 cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold transition-colors sm:text-base"
            style={{ color: active ? meta.ink : "#9ca3af" }}
          >
            {active && (
              <motion.div
                layoutId="exam-pill"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-xl"
                style={{ background: meta.color }}
              />
            )}
            <span className="relative">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
