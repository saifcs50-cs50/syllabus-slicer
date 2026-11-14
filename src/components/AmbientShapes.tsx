import { motion } from "framer-motion";

const SHAPES = [
  { size: 320, top: "0%", left: "-8%", color: "var(--color-jee)", duration: 19 },
  { size: 260, top: "55%", left: "88%", color: "var(--color-cet)", duration: 23 },
  { size: 220, top: "82%", left: "6%", color: "var(--color-ncert)", duration: 27 },
  { size: 200, top: "20%", left: "60%", color: "var(--color-doordie)", duration: 21 },
];

export default function AmbientShapes() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      {SHAPES.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: s.size,
            height: s.size,
            top: s.top,
            left: s.left,
            background: s.color,
            opacity: 0.1,
          }}
          animate={{ y: [0, -30, 0, 30, 0], x: [0, 20, 0, -20, 0] }}
          transition={{ duration: s.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
