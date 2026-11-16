import { useEffect, useState, type CSSProperties } from "react";
import { MotionConfig, motion } from "framer-motion";
import ExamSelector from "./components/ExamSelector";
import SlicerForm from "./components/SlicerForm";
import OutputDashboard from "./components/OutputDashboard";
import ChapterConfigurator from "./components/ChapterConfigurator";
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

  // The selected exam's colour, read by the slider, inputs and buttons.
  const accentStyle = { "--accent": meta.color, "--accent-ink": meta.ink } as CSSProperties;

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-8" style={accentStyle}>
        <header className="mb-10 flex flex-col items-center text-center">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">Syllabus Slicer</h1>
          <p className="mt-3 max-w-xl text-sm text-gray-400 sm:text-base">
            Turn the days and hours you have left into a week-by-week study plan for JEE Main, KCET or
            NCERT boards.
          </p>

          <div className="mt-8 w-full max-w-md">
            <ExamSelector value={exam} onChange={handleExamChange} />
          </div>
        </header>

        <main className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
          <div className="lg:self-start">
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
          </div>

          <div>
            {result ? (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <OutputDashboard result={result} />
              </motion.div>
            ) : (
              <div className="panel flex h-full min-h-[400px] items-center justify-center rounded-2xl p-10 text-center">
                <p className="max-w-sm text-gray-400">
                  Set your days and hours, then press Slice my syllabus.
                </p>
              </div>
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
    </MotionConfig>
  );
}
