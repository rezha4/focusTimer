import React, { useState, useEffect } from "react";
import BreakTimer from "./BreakTimer";

interface Session {
  id: string;
  date: string;
  duration: number;
  isCountingUp: boolean;
}

function App() {
  const THETIME = 60 * 25;
  const DEFAULT_BREAK_TIME = 60 * 5; // 5 minutes in seconds

  const [time, setTime] = useState(THETIME); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isCountingUp, setIsCountingUp] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isBreak, setIsBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(0);

  useEffect(() => {
    const updateTitle = () => {
      const { minutes, seconds } = formatTime(time);
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      if (isRunning) {
        document.title = `Focus: ${timeString}`;
      } else {
        document.title = 'focusTimer';
      }
    };

    updateTitle();

    // Update title every second when timer is running
    const titleInterval = setInterval(updateTitle, 1000);

    return () => clearInterval(titleInterval);
  }, [isRunning, isBreak, time]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const today = new Date().toLocaleDateString();
    const storedSessions = JSON.parse(
      localStorage.getItem("pomodoroSessions") || "{}"
    ) as Record<string, Session[]>;
    const todaySessions = storedSessions[today] || [];
    setSessions(todaySessions);
    setSessionCount(todaySessions.length);
  };

  useEffect(() => {
    // interval variable
    let interval: number | null = null;
    // if isRunning (not paused)
    if (isRunning) {
      // interval equals function?
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime === 0 && !isCountingUp) {
            setIsCountingUp(true);
            return 1;
          }
          return isCountingUp ? prevTime + 1 : prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning && time !== THETIME) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isCountingUp]);

  const toggleTimer = () => {
    if (!isRunning) {
      setTime((prevTime) => prevTime - 1);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsCountingUp(false);
    setTime(THETIME);
  };

  const handleFinish = () => {
    const today = new Date().toLocaleDateString();

    const duration = isCountingUp ? time : THETIME - time;

    const newSession = {
      id: Date.now().toString(),
      date: today,
      duration: duration,
      isCountingUp: isCountingUp,
    };

    const storedSessions = JSON.parse(
      localStorage.getItem("pomodoroSessions") || "{}"
    ) as Record<string, Session[]>;
    const todaySessions = storedSessions[today] || [];
    todaySessions.push(newSession);
    storedSessions[today] = todaySessions;

    localStorage.setItem(
      "pomodoroSessions",
      JSON.stringify(storedSessions)
    );

    setSessions(todaySessions);
    setSessionCount(todaySessions.length);

    console.log(
      `Session ${todaySessions.length} finished. Total time: ${
        formatTime(time).minutes
      }:${formatTime(time).seconds}`
    );
    
    resetTimer();
    const breaktime = calculateBreakTime(duration);
    setBreakTime(breaktime);
    setIsBreak(true);
  };

  const deleteSession = (sessionId: string) => {
    const today = new Date().toLocaleDateString();
    const storedSessions = JSON.parse(
      localStorage.getItem("pomodoroSessions") || "{}"
    ) as Record<string, Session[]>;
    const todaySessions = storedSessions[today] || [];

    const updatedSessions = todaySessions.filter(
      (session) => session.id !== sessionId
    );
    storedSessions[today] = updatedSessions;

    localStorage.setItem(
      "pomodoroSessions",
      JSON.stringify(storedSessions)
    );

    setSessions(updatedSessions);
    setSessionCount(updatedSessions.length);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { minutes: mins, seconds: secs };
  };

  const calculateBreakTime = (workTime: number) => {
    if (workTime < THETIME) {
      // If work time is less than 25 minutes
      const percentage = workTime / THETIME;
      return Math.floor(DEFAULT_BREAK_TIME * percentage);
    } else {
      // If work time is 25 minutes or more
      const extraTime = workTime - THETIME;
      const extraBreakTime = Math.floor(extraTime * 0.1); // 10% of extra time
      return DEFAULT_BREAK_TIME + extraBreakTime;
    }
  };

  const { minutes, seconds } = formatTime(time);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <div className="text-center">
        <h1 className="mb-8 text-4xl font-bold">
          focusTimer, Pomodoro + Flow Time Time Tracker
        </h1>
        <div>
          <BreakTimer isBreak={isBreak} breakTime={breakTime} setIsBreak={setIsBreak} />
        </div>
        <div className="flex justify-center">
          <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
            <div className="flex flex-col">
              <span className="font-mono text-5xl countdown">
                <span
                  style={{ "--value": minutes } as React.CSSProperties}
                ></span>
              </span>
              min
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-5xl countdown">
                <span
                  style={{ "--value": seconds } as React.CSSProperties}
                ></span>
              </span>
              sec
            </div>
          </div>
        </div>
        <div className="mt-8">
          <button
            className="mr-4 btn btn-primary"
            onClick={toggleTimer}
            disabled={isBreak}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleFinish}
            disabled={isBreak}
          >
            Finish
          </button>
        </div>
        {isCountingUp && (
          <p className="mt-4 text-info">
            Pomodoro finished! Now counting up.
          </p>
        )}
        <p className="mt-4">
          Completed sessions today: {sessionCount}
        </p>
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">
            Today's Sessions
          </h2>
          <ul className="list-disc list-inside">
            {sessions.map((session, index) => (
              <>
                <li key={index}>
                  {session.isCountingUp ? (
                    <span>
                      Session {index + 1}: {`25:00 + `}
                      {formatTime(session.duration).minutes}:
                      {formatTime(session.duration)
                        .seconds.toString()
                        .padStart(2, "0")}
                    </span>
                  ) : (
                    <span>
                      Session {index + 1}:{" "}
                      {formatTime(session.duration).minutes}:
                      {formatTime(session.duration)
                        .seconds.toString()
                        .padStart(2, "0")}
                    </span>
                  )}
                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => deleteSession(session.id)}
                  >
                    Delete
                  </button>
                </li>
              </>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

export default App;
