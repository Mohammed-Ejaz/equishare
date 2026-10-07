import React, { useEffect, useRef } from 'react';

export function AnimatedBackground({ theme = 'dark' }) {
  const canvasRef = useRef(null);

  // High Performance 60FPS Interactive Constellation Particle Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle Colors per theme
    const getThemeColors = () => {
      if (theme === 'light') {
        return {
          particle1: 'rgba(16, 185, 129, 0.35)',
          particle2: 'rgba(6, 182, 212, 0.30)',
          line: 'rgba(16, 185, 129, 0.08)'
        };
      }
      if (theme === 'dim') {
        return {
          particle1: 'rgba(56, 189, 248, 0.45)',
          particle2: 'rgba(99, 102, 241, 0.35)',
          line: 'rgba(56, 189, 248, 0.12)'
        };
      }
      // Dark mode default
      return {
        particle1: 'rgba(16, 185, 129, 0.55)',
        particle2: 'rgba(6, 182, 212, 0.45)',
        line: 'rgba(16, 185, 129, 0.15)'
      };
    };

    const colors = getThemeColors();

    // Spawn 45 interactive ambient particles
    const particleCount = Math.min(Math.floor((width * height) / 28000), 45);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2.2 + 1,
      color: Math.random() > 0.5 ? colors.particle1 : colors.particle2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulseAngle: Math.random() * Math.PI * 2
    }));

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update & Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Subtle mouse repulsion / attraction
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x -= (dx / dist) * 0.6;
          p.y -= (dy / dist) * 0.6;
        }

        // Pulse size
        p.pulseAngle += p.pulseSpeed;
        const currentRadius = p.radius + Math.sin(p.pulseAngle) * 0.6;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Connect nearby particles with glowing lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distBetween = Math.hypot(p.x - p2.x, p.y - p2.y);

          if (distBetween < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = colors.line;
            ctx.lineWidth = (1 - distBetween / 130) * 1.2;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Interactive Constellation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />

      {/* 2. Geometric Dot Matrix Grid Pattern with Radial Vignette */}
      <div 
        className="absolute inset-0 opacity-40 transition-opacity duration-500"
        style={{
          backgroundImage: theme === 'light'
            ? 'radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.08) 1px, transparent 0)'
            : theme === 'dim'
            ? 'radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.09) 1px, transparent 0)'
            : 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.12) 1px, transparent 0)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 85%)'
        }}
      />

      {/* 3. Floating 3D Geometric Financial & Split Insignia Holograms */}
      {/* Hologram 1: Floating Rupee Glass Token (Top Right) */}
      <div className="absolute top-[12%] right-[14%] w-16 h-16 rounded-2xl glass-panel border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-float-slow rotate-12 opacity-75">
        <span className="font-mono font-extrabold text-xl text-emerald-400 select-none">₹</span>
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
      </div>

      {/* Hologram 2: Floating Equilibrium Equalizer Badge (Bottom Left) */}
      <div className="absolute bottom-[18%] left-[7%] w-14 h-14 rounded-2xl glass-panel border border-cyan-500/20 flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/10 animate-float-reverse -rotate-6 opacity-70">
        <div className="w-6 h-1 rounded-full bg-cyan-400" />
        <div className="w-6 h-1 rounded-full bg-emerald-400" />
      </div>

      {/* Hologram 3: Floating Quantum Node (Mid Center-Right) */}
      <div className="absolute top-[52%] right-[6%] w-12 h-12 rounded-full glass-panel border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10 animate-pulse-slow opacity-65">
        <div className="w-3 h-3 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400 animate-ping" />
      </div>

      {/* Hologram 4: Isometric Wireframe Rings (Top Left) */}
      <div className="absolute top-[28%] left-[4%] w-28 h-28 rounded-full border border-dashed border-emerald-500/15 animate-spin-ultra-slow opacity-50" />
      <div className="absolute bottom-[35%] right-[22%] w-36 h-36 rounded-3xl border border-cyan-500/10 animate-float-slow rotate-45 opacity-40" />

      {/* 4. Fluid Aurora Glowing Mesh Waves */}
      <div 
        className="absolute -top-[12%] left-[12%] w-[650px] h-[650px] rounded-full blur-[130px] transition-all duration-700 animate-float-slow"
        style={{
          background: theme === 'light'
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, rgba(6, 182, 212, 0.06) 50%, transparent 70%)'
            : theme === 'dim'
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.20) 0%, rgba(99, 102, 241, 0.10) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.12) 50%, transparent 70%)',
        }}
      />

      <div 
        className="absolute top-[40%] -right-[10%] w-[700px] h-[700px] rounded-full blur-[150px] transition-all duration-700 animate-float-reverse"
        style={{
          background: theme === 'light'
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%)'
            : theme === 'dim'
            ? 'radial-gradient(circle, rgba(129, 140, 248, 0.18) 0%, rgba(56, 189, 248, 0.10) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(6, 182, 212, 0.20) 0%, rgba(59, 130, 246, 0.10) 50%, transparent 70%)',
        }}
      />

      {/* 5. Subtle Ambient Vignette Lighting */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: theme === 'light'
            ? 'radial-gradient(circle at center, transparent 65%, rgba(241, 245, 249, 0.35) 100%)'
            : 'radial-gradient(circle at center, transparent 55%, rgba(0, 0, 0, 0.45) 100%)'
        }}
      />
    </div>
  );
}
