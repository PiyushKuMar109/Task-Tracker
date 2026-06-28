import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer, X, AlertCircle } from "lucide-react";

export default function Pomodoro() {
  const [isOpen, setIsOpen] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const timerRef = useRef(null);

  // Trigger web audio beep on completion
  const playAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, ctx.currentTime); // C5 note
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn("Web audio context blocked or not supported:", e);
    }
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds((s) => s - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            playAlertSound();
            setIsActive(false);
            if (!isBreak) {
              // Switch to Break
              setIsBreak(true);
              setMinutes(5);
              setSeconds(0);
              alert("Focus session finished! Time for a short break.");
            } else {
              // Switch to Work
              setIsBreak(false);
              setMinutes(25);
              setSeconds(0);
              alert("Break finished! Time to focus.");
            }
          } else {
            setMinutes((m) => m - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, seconds, minutes, isBreak]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  const handleManualMode = (mins, isBrk) => {
    setIsActive(false);
    setIsBreak(isBrk);
    setMinutes(mins);
    setSeconds(0);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#4f46e5] text-white p-3.5 rounded-full shadow-lg shadow-indigo-500/20 flex items-center justify-center hover:scale-105 active:scale-95 transition z-40"
        title="Pomodoro Focus Timer"
      >
        <Timer size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-5 z-50 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Timer size={18} className="text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {isBreak ? "Break Session" : "Focus Session"}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Clock display */}
      <div className="text-center py-5">
        <h2 className="text-5xl font-mono font-bold text-slate-800 tracking-tight">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </h2>
        <p className="text-[10px] text-slate-500 font-semibold tracking-wide mt-2">
          {isBreak ? "Rest & stretch" : "Stay focused on tasks"}
        </p>
      </div>

      {/* Mode Switches */}
      <div className="flex justify-center gap-2 mb-5">
        <button
          onClick={() => handleManualMode(25, false)}
          className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
            !isBreak
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
              : "bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700"
          }`}
        >
          25m Work
        </button>
        <button
          onClick={() => handleManualMode(5, true)}
          className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
            isBreak
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
              : "bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700"
          }`}
        >
          5m Break
        </button>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={toggleTimer}
          className="primary-btn flex items-center justify-center gap-2 py-2 px-4 flex-1 text-xs"
        >
          {isActive ? <Pause size={14} /> : <Play size={14} />}
          {isActive ? "Pause" : "Start"}
        </button>

        <button
          onClick={resetTimer}
          className="secondary-btn flex items-center justify-center p-2 rounded-lg"
          title="Reset Timer"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}
