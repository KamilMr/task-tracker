import {useState, useEffect, useRef, useCallback} from 'react';

const useTimer = (interval = 1000) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
    }
  }, [isRunning]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setCurrentValue(0);
    startTimeRef.current = null;
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (isRunning && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setCurrentValue(elapsed);
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, interval]);

  return {
    currentValue,
    isRunning,
    start,
    stop,
    pause,
  };
};

export default useTimer;