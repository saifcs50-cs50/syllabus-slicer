import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";
import ExamSelector from "./components/ExamSelector";
import SlicerForm from "./components/SlicerForm";
import OutputDashboard from "./components/OutputDashboard";
import ChapterConfigurator from "./components/ChapterConfigurator";
import FloatingOrb from "./components/FloatingOrb";
import AmbientShapes from "./components/AmbientShapes";
import TiltCard from "./components/TiltCard";
import { ALL_CHAPTERS, EXAM_META, SUBJECTS_BY_EXAM, type ExamType, type SubjectId } from "./data/syllabus";
import { sliceSyllabus, type SlicerResult } from "./lib/slicerEngine";
import { isChapterIncluded, loadOverrides, saveOverrides, type OverrideMap } from "./lib/chapterConfig";

export default function App() {
  const [exam, setExam] = useState<ExamType>("JEE");
  const [totalDays, setTotalDays] = useState(90);
  const [hoursPerDay, setHoursPerDay] = useState(6);
  const [subjects, setSubjects] = useState<SubjectId[]>(["physics", "chemistry", "math"]);
  const [result, setResult] = useState<SlicerResult | null>(null);
  const [overrides, setOverrides] = useState<OverrideMap>(() => loadOverrides());
  const [configuratorOpen, setConfiguratorOpen] = useState(false);

  const meta = EXAM_META[exam];

  useEffect(() => {
    saveOverrides(overrides);
  }, [overrides]);

  const handleExamChange = (next: ExamType) => {
    setExam(next);
    const allowed = new Set(SUBJECTS_BY_EXAM[next]);
    setSubjects((prev) => prev.filter((s) => allowed.has(s)));
  };

  const relevantChapters = ALL_CHAPTERS.filter((c) => subjects.includes(c.subject));
  const includedChapterCount = relevantChapters.filter((c) =>
    isChapterIncluded(c.id, exam, overrides, c.included[exam])
  ).length;

  const handleSlice = () => {
    if (subjects.length === 0) return;
    const excludedChapterIds = new Set(
      ALL_CHAPTERS.filter((c) => !isChapterIncluded(c.id, exam, overrides, c.included[exam])).map(
        (c) => c.id
      )
    );
    setResult(
      sliceSyllabus({ examType: exam, totalDays, hoursPerDay, subjects, excludedChapterIds })
    );
  };

  return (
    <div className="relative mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-8">
      <BackgroundGrid color={meta.color} />
      <AmbientShapes />
      <FloatingOrb exam={exam} />

      <header className="relative mb-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mb-3 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400"
        >
          <ScanLine className="h-3.5 w-3.5" style={{ color: meta.color }} />
          Command Center Online
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl font-black tracking-tight text-white sm:text-6xl"
        >
          Syllabus <span style={{ color: meta.color }}>Slicer</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-3 max-w-xl text-sm text-gray-400 sm:text-base"
        >
          Slice your prep into a weightage-driven battle plan for JEE Main, KCET, or NCERT boards.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 w-full max-w-md"
        >
          <ExamSelector value={exam} onChange={handleExamChange} />
        </motion.div>
      </header>

      <main className="relative grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SlicerForm
            exam={exam}
            totalDays={totalDays}
            setTotalDays={setTotalDays}
            hoursPerDay={hoursPerDay}
            setHoursPerDay={setHoursPerDay}
            subjects={subjects}
            setSubjects={setSubjects}
            onSlice={handleSlice}
            includedChapterCount={includedChapterCount}
            totalChapterCount={relevantChapters.length}
            onConfigureChapters={() => setConfiguratorOpen(true)}
          />
        </motion.div>

        <div>
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <OutputDashboard result={result} />
            </motion.div>
          ) : (
            <TiltCard
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              maxTilt={5}
              className="glass glow-border flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl p-10 text-center"
            >
              <div
                className="animate-float mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: `${meta.color}22`, boxShadow: `0 0 30px ${meta.color}44` }}
              >
                <ScanLine className="h-7 w-7" style={{ color: meta.color }} />
              </div>
              <p className="text-lg font-semibold text-gray-300">
                Configure your parameters and slice your syllabus
              </p>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Pick your exam, set your days and hours, then hit Slice to generate your
                weightage-driven study plan.
              </p>
            </TiltCard>
          )}
        </div>
      </main>

      {configuratorOpen && (
        <ChapterConfigurator
          exam={exam}
          overrides={overrides}
          onChange={setOverrides}
          onClose={() => setConfiguratorOpen(false)}
        />
      )}
    </div>
  );
}

function BackgroundGrid({ color }: { color: string }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.07]"
      style={{
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }}
    />
  );
}
