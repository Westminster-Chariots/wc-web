"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [mounted, setMounted] = useState(false);

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  // Dot: near-instant tracking
  const dotX = useSpring(mx, { stiffness: 1000, damping: 50 });
  const dotY = useSpring(my, { stiffness: 1000, damping: 50 });

  // Ring: slight lag for elegance
  const ringX = useSpring(mx, { stiffness: 180, damping: 22 });
  const ringY = useSpring(my, { stiffness: 180, damping: 22 });

  // Ambient glow: very slow, dreamy
  const glowX = useSpring(mx, { stiffness: 45, damping: 16 });
  const glowY = useSpring(my, { stiffness: 45, damping: 16 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setMounted(true);
    document.body.classList.add("has-custom-cursor");

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setIsPointer(!!el.closest("a, button, [role='button'], input, textarea, select"));
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    window.addEventListener("mouseover", onOver);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mouseover", onOver);
    };
  }, [mx, my]);

  if (!mounted) return null;

  return (
    <>
      {/* Ambient glow — large, slow, dreamy blue halo */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9997] h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.07] blur-[90px]"
        style={{ x: glowX, y: glowY }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.9 }}
      />

      {/* Ring — follows with spring lag */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50"
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: visible ? 1 : 0,
          width: isPointer ? 52 : 36,
          height: isPointer ? 52 : 36,
          borderColor: isPointer ? "rgba(96,165,250,0.7)" : "rgba(255,255,255,0.5)",
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Dot — nearly instant */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{ x: dotX, y: dotY }}
        animate={{ opacity: visible ? 1 : 0, scale: isPointer ? 2 : 1 }}
        transition={{ duration: 0.12 }}
      />
    </>
  );
}
