import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const Globe = () => {
  const canvasRef = useRef(null);
  const globeSize = 500; // Increased size
  const dotSize = 1.5; // Slightly larger dots
  const animationSpeed = 0.002;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let rotation = 0;

    // Create points on a sphere
    const points = [];
    const numPoints = 2500; // More points for better visibility
    const radius = globeSize / 3;

    for (let i = 0; i < numPoints; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      points.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
      });
    }

    const drawGlobe = () => {
      ctx.clearRect(0, 0, globeSize, globeSize);
      
      // Add subtle glow effect
      const gradient = ctx.createRadialGradient(
        globeSize/2, globeSize/2, 0,
        globeSize/2, globeSize/2, radius
      );
      gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
      gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, globeSize, globeSize);
      
      // Sort points by z-coordinate for proper depth rendering
      const sortedPoints = [...points].sort((a, b) => {
        const aZ = a.z * Math.cos(rotation) - a.x * Math.sin(rotation);
        const bZ = b.z * Math.cos(rotation) - b.x * Math.sin(rotation);
        return bZ - aZ;
      });

      // Draw points
      sortedPoints.forEach(point => {
        // Rotate points
        const x = point.x * Math.cos(rotation) + point.z * Math.sin(rotation);
        const y = point.y;
        const z = -point.x * Math.sin(rotation) + point.z * Math.cos(rotation);

        // Project 3D to 2D
        const scale = 400 / (400 + z);
        const x2d = x * scale + globeSize / 2;
        const y2d = y * scale + globeSize / 2;

        // Calculate point brightness based on z position
        const brightness = (z + radius) / (2 * radius);
        const alpha = Math.max(0.2, brightness); // Increased minimum opacity

        // Draw point with glow
        ctx.beginPath();
        ctx.arc(x2d, y2d, dotSize * scale, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(102, 126, 234, ${alpha})`;
        ctx.fill();
        
        // Add subtle glow to points
        ctx.beginPath();
        ctx.arc(x2d, y2d, dotSize * scale * 2, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(102, 126, 234, ${alpha * 0.3})`;
        ctx.fill();
      });

      rotation += animationSpeed;
      animationFrameId = requestAnimationFrame(drawGlobe);
    };

    drawGlobe();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        background: 'transparent',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <canvas
        ref={canvasRef}
        width={globeSize}
        height={globeSize}
        style={{
          maxWidth: '100%',
          height: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </motion.div>
  );
}; 