import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full -z-1" style={{ zIndex: -1 }}>
      {/* Gradient blobs */}
      <motion.div
        className="absolute"
        style={{
          filter: 'blur(100px)',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          height: '70%',
          background: 'linear-gradient(to right, #4f46e5, #0ea5e9)',
          borderRadius: '50%',
          opacity: 0.5,
          top: '0%',
          left: '0%',
        }}
        animate={{
          x: ['0%', '100%', '0%'],
          y: ['0%', '100%', '0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute"
        style={{
          filter: 'blur(100px)',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          height: '70%',
          background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
          borderRadius: '50%',
          opacity: 0.5,
          top: '100%',
          left: '100%',
        }}
        animate={{
          x: ['0%', '-100%', '0%'],
          y: ['0%', '-100%', '0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute"
        style={{
          filter: 'blur(100px)',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          height: '70%',
          background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
          borderRadius: '50%',
          opacity: 0.5,
          top: '50%',
          left: '50%',
        }}
        animate={{
          x: ['0%', '50%', '0%'],
          y: ['0%', '50%', '0%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Mesh gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
          mixBlendMode: 'multiply',
        }}
      />
      
      {/* Noise texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          opacity: 0.015,
        }}
      />
    </div>
  );
}; 