"use client";

import React, { useState, useEffect, useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface ContainerTextFlipProps {
  words?: string[];
  interval?: number;
  className?: string;
  textClassName?: string;
  animationDuration?: number;
}

const defaultWords = ["better", "modern", "beautiful", "awesome"];

export function ContainerTextFlip({
  words = defaultWords,
  interval = 3000,
  className,
  textClassName,
  animationDuration = 700,
}: ContainerTextFlipProps) {
  const id = useId();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [width, setWidth] = useState(100);
  const textRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const currentWord = words[currentWordIndex % words.length] ?? "";

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (textRef.current) setWidth(textRef.current.scrollWidth + 30);
    });
    return () => cancelAnimationFrame(frame);
  }, [currentWord]);

  useEffect(() => {
    if (reduceMotion || words.length < 2) return;
    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);
    return () => clearInterval(intervalId);
  }, [words, interval, reduceMotion]);

  return (
    <motion.p
      layout={!reduceMotion}
      layoutId={`words-here-${id}`}
      animate={{ width }}
      transition={{ duration: reduceMotion ? 0 : animationDuration / 2000 }}
      className={cn(
        "relative inline-block rounded-lg pt-2 pb-3 text-center text-4xl font-bold text-black md:text-7xl dark:text-white",
        "[background:linear-gradient(to_bottom,#f3f4f6,#e5e7eb)]",
        "shadow-[inset_0_-1px_#d1d5db,inset_0_0_0_1px_#d1d5db,_0_4px_8px_#d1d5db]",
        "dark:[background:linear-gradient(to_bottom,#374151,#1f2937)]",
        "dark:shadow-[inset_0_-1px_#10171e,inset_0_0_0_1px_hsla(205,89%,46%,.24),_0_4px_8px_#00000052]",
        className,
      )}
      key={currentWord}
      aria-label={words.join(", ")}
    >
      <motion.div
        transition={{ duration: animationDuration / 1000, ease: "easeInOut" }}
        className={cn("inline-block", textClassName)}
        ref={textRef}
        layoutId={`word-div-${currentWord}-${id}`}
        aria-hidden="true"
      >
        <motion.div className="inline-block">
          {currentWord.split("").map((letter, index) => (
            <motion.span
              key={index}
              initial={reduceMotion ? false : { opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: reduceMotion ? 0 : index * 0.02 }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.p>
  );
}
