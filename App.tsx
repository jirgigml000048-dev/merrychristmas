import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ENVELOPES, TREE_COORDINATES, SCATTER_COORDINATES, COVER_BG_IMAGE, GAME_BG_IMAGE, COLORS } from './constants';
import { GameState, EnvelopeData } from './types';

// Declare GSAP on window
declare global {
  interface Window {
    gsap: any;
  }
}

// --- Helper: Mouse Trail Component ---
const CursorTrail = () => {
  const [trails, setTrails] = useState<{ x: number, y: number, id: number }[]>([]);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    let counter = 0;
    const handleMouseMove = (e: MouseEvent) => {
      // Add a particle every few frames to prevent DOM overload
      if (counter % 3 === 0) {
        setTrails(prev => [
          ...prev.slice(-15), // Keep only last 15 particles
          { x: e.clientX, y: e.clientY, id: Date.now() }
        ]);
      }
      counter++;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {trails.map((trail, index) => (
        <div
          key={trail.id}
          className="absolute w-2 h-2 bg-[#FFAD66] opacity-80"
          style={{
            left: trail.x,
            top: trail.y,
            transform: 'translate(-50%, -50%)',
            animation: 'fadeTrail 0.8s forwards'
          }}
        />
      ))}
      <style>{`
        @keyframes fadeTrail {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          100% { transform: translate(-50%, 0%) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// --- Helper: Advanced Audio Context ---
const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContextClass();
    
    // BGM: 8-bit Jingle Bells (Festive & Retro Game Feel)
    // Source: Archive.org (Public Domain / Creative Commons for 8-bit renditions)
    bgmRef.current = new Audio('https://ia801605.us.archive.org/17/items/8-bit-christmas-music/Jingle%20Bells%20%288-Bit%29.mp3'); 
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.2; // Keep it subtle
  }, []);

  // Watch muted state
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    // Ensure context is running if we unmute
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  // 1. Hover Sound: Short, high-pitched tick
  const playHover = useCallback(() => {
    if (isMuted || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, [isMuted]);

  // 2. Open Sound: "Item Get" Fanfare (Arpeggio slide)
  const playOpen = useCallback(() => {
    if (isMuted || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square'; // Retro game sound
    // Slide pitch up: C -> E -> G -> C
    osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
    osc.frequency.linearRampToValueAtTime(329.63, ctx.currentTime + 0.1); // E4
    osc.frequency.linearRampToValueAtTime(392.00, ctx.currentTime + 0.2); // G4
    osc.frequency.linearRampToValueAtTime(523.25, ctx.currentTime + 0.3); // C5
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }, [isMuted]);

  // 3. Typing Blip
  const playBlip = useCallback(() => {
    if (isMuted || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, [isMuted]);

  const startBGM = useCallback(() => {
    if (bgmRef.current) {
        bgmRef.current.play().catch(e => console.log("Audio play failed", e));
    }
  }, []);

  return { playBlip, startBGM, playHover, playOpen, isMuted, toggleMute };
};

// --- Helper Component: Snowfall ---
const Snowfall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: { x: number; y: number; s: number; v: number; o: number }[] = [];
    const count = 50; 

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        s: Math.random() * 4 + 2, 
        v: Math.random() * 1 + 0.5,
        o: Math.random() * 0.6 + 0.4 
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      
      particles.forEach((p) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.o})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.floor(p.s), Math.floor(p.s));
        p.y += p.v;
        p.x += Math.sin(p.y * 0.005) * 0.3; 

        if (p.y > h) {
          p.y = -5;
          p.x = Math.random() * w;
        }
        if (p.x > w) p.x = 0;
        if (p.x < 0) p.x = w;
      });
      requestAnimationFrame(draw);
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    draw();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-40" />;
};

// --- Helper Component: Pixel Icons ---
const PixelIcon = ({ id }: { id: number }) => {
  const iconStyle: React.CSSProperties = {
     width: '20px',
     height: '20px',
     shapeRendering: 'crispEdges' 
  };

  const type = id % 5; 

  switch (type) {
    case 0: // Santa Hat
      return (
        <svg viewBox="0 0 16 16" style={iconStyle}>
          <path d="M2 11h12v3H2z" fill="#fff" />
          <path d="M4 11L8 3L12 11H4" fill="#c1121f" />
          <rect x="12" y="9" width="3" height="3" fill="#fff" />
        </svg>
      );
    case 1: // Christmas Tree
      return (
        <svg viewBox="0 0 16 16" style={iconStyle}>
           <path d="M8 2L3 11h3v3h4v-3h3L8 2z" fill="#2d6a4f" />
           <rect x="7" y="14" width="2" height="2" fill="#5C4033" />
        </svg>
      );
    case 2: // Reindeer Head
      return (
        <svg viewBox="0 0 16 16" style={iconStyle}>
           <rect x="5" y="6" width="6" height="6" fill="#8B4513" />
           <path d="M4 3h2v4H4z M10 3h2v4h-2z" fill="#5D4037" />
           <rect x="7" y="10" width="2" height="2" fill="#c1121f" />
        </svg>
      );
    case 3: // Pinecone / Acorn
       return (
         <svg viewBox="0 0 16 16" style={iconStyle}>
            <ellipse cx="8" cy="9" rx="4" ry="5" fill="#6F4E37" />
            <path d="M6 6l4 4 M10 6l-4 4" stroke="#4A3728" strokeWidth="1" />
            <rect x="7" y="3" width="2" height="2" fill="#4A3728" />
         </svg>
       );
    case 4: // Gift / Letter
       return (
        <svg viewBox="0 0 16 16" style={iconStyle}>
           <rect x="3" y="5" width="10" height="8" fill="#e9c46a" />
           <rect x="7" y="5" width="2" height="8" fill="#c1121f" />
           <rect x="3" y="8" width="10" height="2" fill="#c1121f" />
        </svg>
       );
    default:
      return null;
  }
};

// --- Helper Component: Envelope Icon ---
interface EnvelopeProps {
  data: EnvelopeData;
  isRead: boolean;
  onClick: (id: number) => void;
  onHover: () => void;
  gameState: GameState;
  index: number;
  style?: React.CSSProperties; 
}

const Envelope: React.FC<EnvelopeProps> = ({ data, isRead, onClick, onHover, gameState, index, style }) => {
  const isInteractable = gameState === GameState.COLLECTING || gameState === GameState.COMPLETED;
  const shouldAnimate = gameState === GameState.COLLECTING || gameState === GameState.READY_TO_ASSEMBLE;

  // Added scale transition for hover effect
  const customStyle = {
    ...style,
    '--scale': data.scale,
    animation: shouldAnimate ? `float 3s ease-in-out infinite` : 'none',
    animationDelay: `${index * 0.15}s`,
    cursor: isInteractable ? 'pointer' : 'default',
  } as React.CSSProperties;

  const borderColor = COLORS.wood; 

  return (
    <div
      id={`envelope-${data.id}`}
      onClick={() => isInteractable && onClick(data.id)}
      onMouseEnter={() => isInteractable && onHover()}
      className={`
        relative w-24 h-16 sm:w-28 sm:h-20
        flex items-center justify-center 
        transition-all duration-200
        ${isInteractable ? 'hover:scale-110 hover:-rotate-3 hover:brightness-110 active:scale-95' : ''}
        ${isRead && gameState === GameState.COLLECTING ? 'opacity-80 grayscale-[0.3]' : 'opacity-100'}
        ${gameState === GameState.ASSEMBLING ? 'transition-none' : ''}
      `}
      style={{
         backgroundColor: COLORS.cream, 
         border: `3px solid ${borderColor}`,
         boxShadow: `3px 3px 0 0 rgba(0,0,0,0.25)`, 
         ...customStyle,
      }}
    >
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
         <line x1="0" y1="0" x2="50%" y2="60%" stroke={borderColor} strokeWidth="2" />
         <line x1="100%" y1="0" x2="50%" y2="60%" stroke={borderColor} strokeWidth="2" />
      </svg>
      
      <div className="z-10 mt-3 transform scale-110">
         <PixelIcon id={data.id} />
      </div>

      <div 
        className="absolute bottom-1 right-2 text-[10px] sm:text-xs font-bold z-20"
        style={{ color: borderColor }}
      >
        {data.id}
      </div>
    </div>
  );
};

// --- Helper Component: Retro Modal (IMPROVED POLAROID STYLE) ---
interface ModalProps {
  data: EnvelopeData | null;
  onClose: () => void;
  playBlip: () => void;
}

const Modal: React.FC<ModalProps> = ({ data, onClose, playBlip }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textIndex = useRef(0);

  useEffect(() => {
    if (!data) return;
    setDisplayedText('');
    textIndex.current = 0;
    setIsTyping(true);

    const fullText = data.message;
    const interval = setInterval(() => {
      if (textIndex.current < fullText.length) {
        setDisplayedText((prev) => prev + fullText.charAt(textIndex.current));
        textIndex.current++;
        if (textIndex.current % 2 === 0) playBlip();
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [data, playBlip]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-[fadeIn_0.2s_ease-out]">
      <style>{`
        @keyframes popIn {
            0% { transform: scale(0) rotate(-10deg); opacity: 0; }
            60% { transform: scale(1.05) rotate(2deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
      `}</style>
      <div 
        className="relative w-full max-w-lg origin-center transform"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          // Vintage Paper Style: Cream BG, Wood Borders
          boxShadow: `0 0 0 4px ${COLORS.wood}, 0 0 0 8px ${COLORS.cream}, 0 15px 30px rgba(0,0,0,0.5)`,
          backgroundColor: COLORS.cream,
          animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' 
        }}
      >
        <div className="p-5 flex flex-col gap-5">
            {/* PHOTO SECTION - 3:2 Aspect Ratio + Polaroid Styling */}
            <div className="relative">
                {/* Washi Tape Effect via CSS class */}
                <div className="washi-tape"></div>
                
                <div 
                    className="w-full aspect-[3/2] relative border-4 border-white shadow-lg transform -rotate-1"
                    style={{ backgroundColor: '#fff' }}
                >
                    <img 
                        src={data.imageUrl} 
                        alt="Memory" 
                        className="w-full h-full object-cover p-1"
                        style={{ imageRendering: 'auto' }} // Smooth for photos, not pixelated
                    />
                </div>
            </div>

            {/* Dark Text on Cream Background */}
            <div className="min-h-[80px] bg-transparent p-2 text-xs sm:text-sm leading-relaxed tracking-wider font-medium font-mono" style={{ color: COLORS.wood }}>
                <p className="mb-2 font-bold uppercase drop-shadow-sm text-[10px] tracking-widest border-b-2 inline-block pb-1" style={{ color: COLORS.deepPineGreen, borderColor: COLORS.wood }}>
                    Memory Log #{String(data.id).padStart(2,'0')}
                </p>
                <p className="">{displayedText}<span className="inline-block w-2 h-4 ml-1 animate-pulse" style={{ backgroundColor: COLORS.wood }}></span></p>
            </div>
            
            <button 
                onClick={onClose}
                className="self-end px-4 py-2 text-xs uppercase animate-pulse border-2 border-transparent hover:border-[#5C4033] transition-colors"
                style={{ color: COLORS.wood, fontWeight: 'bold' }}
            >
                ▼ CLOSE
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Helper Component: Cover Screen UI ---
interface CoverScreenProps {
  onStart: () => void;
  playBlip: () => void;
}

const CoverScreen: React.FC<CoverScreenProps> = ({ onStart, playBlip }) => {
  const [textFinished, setTextFinished] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = "Save point reached.\nMemories ready to replay.";
  const indexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (indexRef.current < fullText.length) {
        setDisplayedText(prev => prev + fullText.charAt(indexRef.current));
        indexRef.current++;
        if (indexRef.current % 3 === 0) playBlip(); 
      } else {
        setTextFinished(true);
        clearInterval(interval);
      }
    }, 60); 
    return () => clearInterval(interval);
  }, [playBlip]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end">
        <div 
            className="w-full h-[30vh] border-t-4 p-6 sm:p-8 flex flex-col items-start justify-between relative shadow-[0_-4px_0_rgba(0,0,0,0.3)]"
            style={{ backgroundColor: COLORS.deepPineGreen, borderColor: COLORS.cream }}
        >
            <p className="pixel-text-glow text-sm sm:text-xl leading-relaxed tracking-wider font-mono whitespace-pre-line drop-shadow-md" style={{ color: COLORS.cream }}>
                {displayedText}
                <span className={`inline-block w-3 h-5 ml-2 align-middle ${textFinished ? 'opacity-0' : 'animate-pulse'}`} style={{ backgroundColor: COLORS.cream }}></span>
            </p>
            <div className={`self-end transition-opacity duration-500 ${textFinished ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <button 
                    onClick={onStart}
                    className="
                        group relative px-6 py-2 
                        text-lg sm:text-xl uppercase font-bold tracking-widest
                        transition-colors animate-pulse
                    "
                    style={{ color: COLORS.sunsetOrange }}
                 >
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 transition-all">▶</span>
                    Start Game
                 </button>
            </div>
        </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [readEnvelopes, setReadEnvelopes] = useState<Set<number>>(new Set());
  const [activeEnvelope, setActiveEnvelope] = useState<EnvelopeData | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.COVER);
  const [showSnow, setShowSnow] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(1); // For fading out the background image
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  
  const { playBlip, startBGM, playHover, playOpen, isMuted, toggleMute } = useAudio();

  // 🖼️ PRELOAD IMAGES ON MOUNT
  useEffect(() => {
    ENVELOPES.forEach((env) => {
      const img = new Image();
      img.src = env.imageUrl;
    });
    new Image().src = COVER_BG_IMAGE;
    new Image().src = GAME_BG_IMAGE;
  }, []);

  // 🌌 PARALLAX EFFECT
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        // Calculate offset from center, divided for subtlety
        const x = (e.clientX / window.innerWidth - 0.5) * 20; 
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        setParallaxOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleStartGame = () => {
    startBGM();
    setGameState(GameState.COLLECTING);
  };

  const handleResetGame = () => {
      setGameState(GameState.COVER);
      setReadEnvelopes(new Set());
      setShowSnow(false);
      setBgOpacity(1);
  };

  const handleEnvelopeClick = (id: number) => {
    const env = ENVELOPES.find(e => e.id === id);
    if (env) {
      playOpen(); // Play "Open Item" sound
      setActiveEnvelope(env);
    }
  };

  const handleModalClose = () => {
    if (activeEnvelope) {
      if (gameState === GameState.COLLECTING) {
          const newSet = new Set(readEnvelopes);
          newSet.add(activeEnvelope.id);
          setReadEnvelopes(newSet);
          
          if (newSet.size === ENVELOPES.length) {
            setGameState(GameState.READY_TO_ASSEMBLE);
          }
      }
      setActiveEnvelope(null);
    }
  };

  const startAssembly = () => {
    setGameState(GameState.ASSEMBLING);
    
    if (window.gsap) {
      const tl = window.gsap.timeline({
        onComplete: () => {
          setGameState(GameState.COMPLETED);
          setShowSnow(true);
        }
      });

      // 1. Hide Button & Fade Background to Solid Color
      tl.to('#start-btn', { scale: 0, duration: 0.3, ease: 'back.in' }, 0);
      tl.to({}, { 
          duration: 1.0, 
          onUpdate: function() { setBgOpacity(1 - this.progress()); } 
      }, 0);

      // 2. "Energy Gathering" - Spiral In / Anticipation
      ENVELOPES.forEach((env, i) => {
         tl.to(`#envelope-${env.id}`, {
             rotation: 360,
             scale: 0.5,
             x: 0, 
             y: 0, 
             duration: 0.8,
             ease: "power2.in"
         }, 0);
      });

      // 3. "Explosion" into Tree Shape
      ENVELOPES.forEach((env, i) => {
         const target = TREE_COORDINATES.find(t => t.id === env.id);
         if (target) {
            const xPercent = target.x; 
            const yPercent = target.y;

            tl.to(`#envelope-${env.id}`, {
              position: 'fixed',
              left: `${xPercent}%`,
              top: `${yPercent}%`,
              xPercent: -50, 
              yPercent: -50,
              rotation: 0,
              scale: 1, 
              filter: 'brightness(1.2)', 
              duration: 1.5,
              ease: 'elastic.out(1, 0.5)', 
              delay: 0.8 + (Math.random() * 0.2) 
            }, 0.8); 
         }
      });

      // 4. Glow Pulse
      tl.to('.envelope-container', {
         filter: 'drop-shadow(0 0 15px #FFAD66)', 
         duration: 0.5,
         yoyo: true,
         repeat: 3
      }, 2.0);
    }
  };

  const renderEnvelopes = () => {
    return (
      <div className="relative w-full h-[80vh] flex items-center justify-center mt-4">
         <div className="relative w-full h-full">
           {ENVELOPES.map((env, index) => {
             // Use Scatter Coordinates for collecting phase
             const scatter = SCATTER_COORDINATES.find(s => s.id === env.id) || { x: 50, y: 50 };

             const scatterStyle: React.CSSProperties = {
                position: 'absolute',
                left: `${scatter.x}%`,
                top: `${scatter.y}%`,
                transform: 'translate(-50%, -50%)', 
             };
             
             const isStaticTree = gameState === GameState.COMPLETED;
             
             return (
                <Envelope 
                  key={env.id} 
                  data={env} 
                  index={index}
                  isRead={readEnvelopes.has(env.id)} 
                  onClick={handleEnvelopeClick}
                  onHover={playHover}
                  gameState={gameState}
                  style={(!isStaticTree && gameState !== GameState.ASSEMBLING) ? scatterStyle : undefined}
                />
             );
           })}
         </div>
      </div>
    );
  };

  return (
    <div 
        className="relative w-screen h-screen overflow-hidden text-white selection:bg-[#8BB6BF] selection:text-[#2F4858]"
        style={{ backgroundColor: COLORS.nightBlue }} 
    >
      <CursorTrail />
      
      {/* Sound Toggle Button (Top Right) */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={toggleMute}
          className="p-2 border-2 border-white bg-black/50 hover:bg-black/70 active:scale-95 transition-all text-xs sm:text-sm"
          style={{ fontFamily: '"Press Start 2P", cursive' }}
        >
          {isMuted ? '🔇 MUTE' : '🔊 ON'}
        </button>
      </div>

      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-100 ease-out"
        style={{ 
            backgroundImage: `url(${gameState === GameState.COVER ? COVER_BG_IMAGE : GAME_BG_IMAGE})`,
            filter: gameState === GameState.COVER ? 'brightness(0.9)' : 'brightness(1)',
            opacity: bgOpacity, 
            pointerEvents: 'none',
            // Apply parallax transform inversely
            transform: `translate(${-parallaxOffset.x}px, ${-parallaxOffset.y}px) scale(1.05)` 
        }}
      />
      
      {gameState === GameState.COVER && (
          <CoverScreen onStart={handleStartGame} playBlip={playBlip} />
      )}

      {gameState !== GameState.COVER && (
        <main className="relative z-10 w-full h-full flex flex-col items-center">
            
            <header className="w-full h-16 sm:h-24 pointer-events-none"></header>

            <div className="flex-grow w-full flex items-center justify-center envelope-container">
                {renderEnvelopes()}
            </div>

            <footer className="mb-16 sm:mb-24 h-20 flex items-center justify-center absolute bottom-0 z-20 pointer-events-auto">
            {gameState === GameState.READY_TO_ASSEMBLE && (
                <button
                    id="start-btn"
                    onClick={startAssembly}
                    className="
                    text-white 
                    px-8 py-3 sm:px-10 sm:py-4
                    text-sm sm:text-lg font-bold uppercase tracking-widest
                    animate-bounce
                    transition-transform
                    pixel-text-glow
                    "
                    style={{
                        backgroundColor: COLORS.scarfRed, 
                        border: `2px solid ${COLORS.wood}`,
                        boxShadow: `inset 0 4px 0 rgba(255,255,255,0.2), 0 4px 0 ${COLORS.wood}, 0 8px 10px rgba(0,0,0,0.5)`,
                        textShadow: '1px 1px 0 #3E2723'
                    }}
                >
                Start Assembly!
                </button>
            )}
            
            {gameState === GameState.COMPLETED && (
                 <button
                 onClick={handleResetGame}
                 className="
                    fixed bottom-6 right-6
                    px-4 py-2
                    text-xs font-bold uppercase tracking-widest
                    transition-colors
                 "
                 style={{
                   backgroundColor: COLORS.cream,
                   color: COLORS.deepPineGreen,
                   boxShadow: `4px 4px 0 ${COLORS.deepPineGreen}`
                 }}
              >
                 ◀ Return
              </button>
            )}
            </footer>
        </main>
      )}

      {gameState === GameState.COMPLETED && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
            <div className="p-6 backdrop-blur-sm animate-[pulse_3s_infinite] mb-48 sm:mb-64"
                 style={{
                   backgroundColor: `${COLORS.deepPineGreen}CC`, 
                   boxShadow: `0 0 0 4px ${COLORS.cream}, 0 8px 0 rgba(0,0,0,0.4)`
                 }}>
                <h2 className="pixel-text-glow text-xl sm:text-3xl text-center leading-normal drop-shadow-[2px_2px_0_#2F4858]" style={{ color: COLORS.cream }}>
                    Merry Christmas <br/> <span style={{ color: COLORS.sunsetOrange }}>Player 2!</span>
                </h2>
            </div>
        </div>
      )}

      {activeEnvelope && (
        <Modal 
          data={activeEnvelope} 
          onClose={handleModalClose} 
          playBlip={playBlip}
        />
      )}
      
      {showSnow && <Snowfall />}
    </div>
  );
}
