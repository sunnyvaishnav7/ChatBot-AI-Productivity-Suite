import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Sparkle = ({ id, x, y, color, delay, scale }) => {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, scale, 0],
      }}
      transition={{
        duration: 1,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 3,
      }}
      style={{
        position: "absolute",
        left: x + "%",
        top: y + "%",
        transform: `translate(-50%, -50%)`,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 0L13.4328 10.5672L24 12L13.4328 13.4328L12 24L10.5672 13.4328L0 12L10.5672 10.5672L12 0Z"
          fill={color}
        />
      </svg>
    </motion.div>
  );
};

const generateSparkle = () => {
  return {
    id: Math.random(),
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: `rgba(${102 + Math.random() * 24}, ${126 + Math.random() * 24}, ${234 + Math.random() * 21}, ${0.7 + Math.random() * 0.3})`,
    delay: Math.random() * 0.5,
    scale: 0.5 + Math.random() * 0.5,
  };
};

export const SparklesText = ({ children, className = "" }) => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const numSparkles = 6; // Adjust number of sparkles
    const initialSparkles = Array.from({ length: numSparkles }, () =>
      generateSparkle()
    );
    setSparkles(initialSparkles);

    const interval = setInterval(() => {
      setSparkles((currentSparkles) => {
        const newSparkle = generateSparkle();
        const oldestSparkle = currentSparkles[0];
        return [...currentSparkles.slice(1), newSparkle];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.h1
      className={`text-4xl font-bold relative inline-block ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        textShadow: "0 0 30px rgba(102, 126, 234, 0.3)",
        padding: "0.5rem",
      }}
    >
      {sparkles.map((sparkle) => (
        <Sparkle key={sparkle.id} {...sparkle} />
      ))}
      <span className="relative z-10">{children}</span>
    </motion.h1>
  );
}; 