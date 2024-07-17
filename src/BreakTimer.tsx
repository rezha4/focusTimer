import React, { useState, useEffect } from "react";

interface BreakTimerProps {
  isBreak: boolean;
  breakTime: number;
  setIsBreak: (arg: boolean) => void;
}

const BreakTimer: React.FC<BreakTimerProps> = ({
  isBreak,
  breakTime,
  setIsBreak
}) => {
  const [timeLeft, setTimeLeft] = useState(breakTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isBreak && !isRunning) {
      setTimeLeft(breakTime);
      // setIsRunning(true);
    }
  }, [isBreak, breakTime]);

  useEffect(() => {
    let interval: number | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }

    if (timeLeft === 0) setIsBreak(false);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const updateTitle = () => {
      if (isBreak && timeLeft > 0) {
        document.title = `Break: ${formatTime(timeLeft)}`;
      }
    };

    updateTitle();

    const titleInterval = setInterval(updateTitle, 1000);

    return () => clearInterval(titleInterval);
  }, [isBreak, isRunning, timeLeft]);

  if (!isBreak || timeLeft === 0 ) return null;

  return (
    <div className="break-timer">
      <h2>Break Time!</h2>
      <div className="timer">{formatTime(timeLeft)}</div>
      <p>Take a moment to relax...</p>
      <button
        className="btn btn-outline"
        onClick={() => setIsRunning(!isRunning)}
      >
        {isRunning ? "Pause Break" : "Start Break"}
      </button>
    </div>
  );
};

export default BreakTimer;
