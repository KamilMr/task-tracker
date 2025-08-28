import {useState, useEffect, useRef, useCallback} from 'react';

const interval = 1000;

const useTimer = () => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = () => {
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentValue(val => (val += interval));
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        setCurrentValue(0);
      }
    };
  }, [isRunning]);

  return {
    currentValue: Math.floor(currentValue / 1000),
    start,
    stop,
    initialValue: arg => {
      setCurrentValue(arg);
    },
  };
};

export default useTimer;
