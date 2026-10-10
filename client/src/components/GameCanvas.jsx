import React, { useRef, useEffect } from 'react';
import { useGame } from '../context/GameSocketContext';
import { Plane, AlertTriangle, Sparkles } from 'lucide-react';

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const { gameState, multiplier, countdown, currentRound } = useGame();

  // Animation & Particle State Refs
  const particlesRef = useRef([]);
  const starsRef = useRef([]);
  const planePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, angle: 0 });
  const propAngleRef = useRef(0);
  const crashAnimRef = useRef({ active: false, x: 0, y: 0, vx: 0, vy: 0, opacity: 1 });

  // Initialize background stars
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.0003 + 0.0001
      });
    }
    starsRef.current = stars;
  }, []);

  // Main Canvas Render Loop (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear Canvas with sleek deep cockpit background
      ctx.clearRect(0, 0, width, height);

      // 1. Background Gradient & Stars
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0c0e14');
      bgGrad.addColorStop(1, '#080a0d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle parallax moving stars
      starsRef.current.forEach(star => {
        star.y = (star.y + star.speed) % 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Radar Grid Lines & Coordinates
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSpacingX = width / 8;
      const gridSpacingY = height / 6;

      for (let x = gridSpacingX; x < width; x += gridSpacingX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = gridSpacingY; y < height; y += gridSpacingY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // X and Y Baseline Axes
      const paddingLeft = 40;
      const paddingBottom = 40;
      const originX = paddingLeft;
      const originY = height - paddingBottom;
      const plotWidth = width - paddingLeft - 40;
      const plotHeight = height - paddingBottom - 40;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(originX, 20);
      ctx.lineTo(originX, originY);
      ctx.lineTo(width - 20, originY);
      ctx.stroke();

      // Draw axis ticks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('1.0x', originX - 8, originY + 4);
      ctx.fillText(`${(Math.max(2, multiplier * 0.6)).toFixed(1)}x`, originX - 8, originY - plotHeight * 0.5);
      ctx.fillText(`${(Math.max(3, multiplier * 1.1)).toFixed(1)}x`, originX - 8, originY - plotHeight * 0.95);

      // --- GAME STATE HANDLING ---

      if (gameState === 'FLYING' || (gameState === 'CRASHED' && crashAnimRef.current.active)) {
        // Calculate curve progression based on multiplier
        // As multiplier grows, curve climbs towards top-right
        const progress = Math.min(1, Math.log10(multiplier + 0.1) / Math.log10(50));
        const curveX = originX + Math.min(plotWidth * 0.85, (plotWidth * 0.2) + progress * (plotWidth * 0.65));
        const curveY = originY - Math.min(plotHeight * 0.85, (plotHeight * 0.15) + progress * (plotHeight * 0.7));

        // Smooth plane position tracking
        planePosRef.current.x += (curveX - planePosRef.current.x) * 0.15;
        planePosRef.current.y += (curveY - planePosRef.current.y) * 0.15;

        // Calculate flight tangent angle for plane tilt
        const currentX = planePosRef.current.x;
        const currentY = planePosRef.current.y;
        const controlX = originX + (currentX - originX) * 0.55;
        const controlY = originY;

        // Draw filled gradient under curve
        const areaGrad = ctx.createLinearGradient(0, currentY, 0, originY);
        areaGrad.addColorStop(0, 'rgba(229, 30, 56, 0.45)');
        areaGrad.addColorStop(0.5, 'rgba(229, 30, 56, 0.15)');
        areaGrad.addColorStop(1, 'rgba(229, 30, 56, 0.01)');

        ctx.fillStyle = areaGrad;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.quadraticCurveTo(controlX, controlY, currentX, currentY);
        ctx.lineTo(currentX, originY);
        ctx.closePath();
        ctx.fill();

        // Draw dynamic red trajectory line
        ctx.strokeStyle = '#e51e38';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#e51e38';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.quadraticCurveTo(controlX, controlY, currentX, currentY);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow

        // Emit smoke / flame particles behind plane
        if (gameState === 'FLYING') {
          particlesRef.current.push({
            x: currentX - 15,
            y: currentY + 5,
            vx: - (Math.random() * 2 + 1),
            vy: (Math.random() - 0.5) * 1.5,
            radius: Math.random() * 4 + 2,
            alpha: 0.8,
            color: Math.random() > 0.4 ? 'rgba(229, 30, 56,' : 'rgba(255, 140, 0,'
          });
        }

        // Draw and update particles
        particlesRef.current = particlesRef.current.filter(p => p.alpha > 0.05);
        particlesRef.current.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha *= 0.94;
          p.radius *= 0.98;

          ctx.fillStyle = `${p.color} ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw Spribe Aviator Red Aeroplane
        ctx.save();
        ctx.translate(currentX, currentY);
        
        // Calculate banking angle
        const dx = currentX - controlX;
        const dy = currentY - controlY;
        const flightAngle = Math.atan2(dy, dx) + 0.15;
        ctx.rotate(flightAngle);

        // Draw Aircraft Body
        drawAviatorPlane(ctx, propAngleRef.current);
        propAngleRef.current += 0.4;
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameState, multiplier]);

  // Helper to draw custom aerodynamic red propeller plane
  const drawAviatorPlane = (ctx, propAngle) => {
    // 1. Red Jet Body
    ctx.fillStyle = '#e51e38';
    ctx.beginPath();
    ctx.moveTo(25, 0);       // Nose
    ctx.lineTo(-20, -10);   // Upper fuselage
    ctx.lineTo(-30, -8);    // Tail fin base
    ctx.lineTo(-38, -22);   // Tail fin top
    ctx.lineTo(-28, -5);    // Tail fin back
    ctx.lineTo(-30, 5);     // Rear bottom
    ctx.lineTo(10, 8);      // Belly
    ctx.closePath();
    ctx.fill();

    // 2. Main Wing
    ctx.fillStyle = '#b80c25';
    ctx.beginPath();
    ctx.moveTo(2, -4);
    ctx.lineTo(-12, -26);
    ctx.lineTo(-4, -26);
    ctx.lineTo(14, -2);
    ctx.closePath();
    ctx.fill();

    // 3. Cockpit Canopy Glass
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(8, -3, 8, 4, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(8, -3, 6, 3, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 4. Front Nose Propeller Disk Blur
    ctx.save();
    ctx.translate(26, 0);
    ctx.rotate(propAngle);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(-1.5, -16, 3, 32);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Wingtip navigation light
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(-10, -26, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <div className="relative w-full h-[340px] md:h-[440px] lg:h-[480px] bg-[#0c0e14] rounded-2xl overflow-hidden border border-[#262b3a] shadow-2xl flex items-center justify-center select-none">
      {/* 60FPS Trajectory Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Top Left Provably Fair Round Info Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#14171f]/80 backdrop-blur-md border border-slate-700/40 px-3 py-1.5 rounded-xl text-xs text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span className="font-mono font-semibold">ROUND #{currentRound ? currentRound.roundNumber : '1001'}</span>
        {currentRound?.serverSeedHash && (
          <span className="hidden sm:inline text-slate-500 font-mono text-[10px] truncate max-w-[120px]">
            {currentRound.serverSeedHash}
          </span>
        )}
      </div>

      {/* CENTER STAGE: GAME STATE OVERLAYS */}

      {/* 1. WAITING / BETTING PHASE COUNTDOWN */}
      {gameState === 'WAITING' && (
        <div className="absolute z-20 flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
          {/* Circular Radar Spinner */}
          <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="stroke-aviator-red transition-all duration-100 ease-linear"
                strokeWidth="6"
                strokeDasharray={280}
                strokeDashoffset={280 - (countdown / 5.0) * 280}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <Plane className="w-8 h-8 md:w-10 md:h-10 text-aviator-red animate-pulse transform -rotate-45" />
              <span className="font-mono font-extrabold text-lg md:text-xl text-white mt-1">
                {countdown.toFixed(1)}s
              </span>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase font-['Outfit'] flex items-center gap-2">
            Waiting for Next Round
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xs">
            Place your bets before the plane takes off!
          </p>

          {/* Linear Progress Bar */}
          <div className="w-48 md:w-64 h-2 bg-slate-800 rounded-full overflow-hidden mt-3 border border-slate-700/50">
            <div 
              className="h-full bg-gradient-to-r from-aviator-red to-[#ff4760] transition-all duration-100 ease-linear"
              style={{ width: `${(countdown / 5.0) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 2. FLYING PHASE: DYNAMIC LIVE MULTIPLIER DISPLAY */}
      {gameState === 'FLYING' && (
        <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex items-baseline gap-1">
            <span className="font-['Outfit'] font-black text-6xl md:text-8xl lg:text-9xl text-white tracking-tight drop-shadow-[0_0_35px_rgba(229,30,56,0.6)]">
              {multiplier.toFixed(2)}
            </span>
            <span className="font-['Outfit'] font-black text-3xl md:text-5xl text-aviator-red drop-shadow-[0_0_20px_rgba(229,30,56,0.8)]">
              x
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Rising Multiplier</span>
          </div>
        </div>
      )}

      {/* 3. CRASHED EVENT: "FLEW AWAY!" */}
      {gameState === 'CRASHED' && (
        <div className="absolute z-20 flex flex-col items-center justify-center text-center p-6 animate-pulse">
          <div className="bg-aviator-red/20 border border-aviator-red/60 px-6 py-4 rounded-2xl backdrop-blur-xl shadow-2xl shadow-aviator-red/40 flex flex-col items-center">
            <span className="text-base md:text-lg font-black text-slate-300 uppercase tracking-widest mb-1">
              FLEW AWAY!
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-['Outfit'] font-black text-5xl md:text-7xl lg:text-8xl text-aviator-red tracking-tight drop-shadow-[0_0_40px_rgba(229,30,56,1)]">
                {multiplier.toFixed(2)}
              </span>
              <span className="font-['Outfit'] font-black text-3xl md:text-4xl text-aviator-red">
                x
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
