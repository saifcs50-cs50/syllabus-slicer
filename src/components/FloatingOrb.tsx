import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import type { CSSProperties } from "react";
import { EXAM_META, type ExamType } from "../data/syllabus";

interface Props {
  exam: ExamType;
}

const CUBE_SIZE = 120;
const HALF = CUBE_SIZE / 2;

export default function FloatingOrb({ exam }: Props) {
  const meta = EXAM_META[exam];
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const tiltX = useSpring(useTransform(mouseY, [-300, 300], [14, -14]), {
    stiffness: 120,
    damping: 20,
  });
  const tiltY = useSpring(useTransform(mouseX, [-300, 300], [-14, 14]), {
    stiffness: 120,
    damping: 20,
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  const faceStyle = (transform: string): CSSProperties => ({
    position: "absolute",
    inset: 0,
    transform,
    border: `1.5px solid ${meta.glow}`,
    boxShadow: `0 0 24px ${meta.color}55, 0 0 18px ${meta.color}40 inset`,
    backgroundImage: `linear-gradient(135deg, ${meta.color}99, ${meta.glow}33), linear-gradient(${meta.glow}30 1px, transparent 1px), linear-gradient(90deg, ${meta.glow}30 1px, transparent 1px)`,
    backgroundSize: "100% 100%, 30px 30px, 30px 30px",
  });

  return (
    <div
      className="pointer-events-none fixed right-10 top-28 z-0 hidden lg:block"
      style={{ perspective: 1000 }}
    >
      {/* bobbing layer */}
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* mouse-tilt layer */}
        <motion.div
          style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
          className="relative h-[120px] w-[120px]"
        >
          {/* glow core */}
          <div
            className="animate-pulse-glow absolute left-1/2 top-1/2 -z-10 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
            style={{ background: meta.glow, opacity: 0.35 }}
          />

          {/* orbit rings */}
          <motion.div
            animate={{ rotateZ: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 -z-10 rounded-full"
            style={{
              width: 190,
              height: 190,
              marginLeft: -95,
              marginTop: -95,
              border: `1px solid ${meta.color}40`,
              rotateX: 78,
            }}
          />
          <motion.div
            animate={{ rotateZ: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 -z-10 rounded-full"
            style={{
              width: 240,
              height: 240,
              marginLeft: -120,
              marginTop: -120,
              border: `1px solid ${meta.glow}2a`,
              rotateX: 78,
              rotateZ: 30,
            }}
          />

          {/* auto-rotating cube */}
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
            style={{
              width: CUBE_SIZE,
              height: CUBE_SIZE,
              transformStyle: "preserve-3d",
              rotateX: -18,
            }}
            className="relative"
          >
            <div style={faceStyle(`translateZ(${HALF}px)`)} />
            <div style={faceStyle(`rotateY(180deg) translateZ(${HALF}px)`)} />
            <div style={faceStyle(`rotateY(90deg) translateZ(${HALF}px)`)} />
            <div style={faceStyle(`rotateY(-90deg) translateZ(${HALF}px)`)} />
            <div style={faceStyle(`rotateX(90deg) translateZ(${HALF}px)`)} />
            <div style={faceStyle(`rotateX(-90deg) translateZ(${HALF}px)`)} />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
