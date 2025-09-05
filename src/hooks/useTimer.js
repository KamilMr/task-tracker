import {useState, useEffect, useRef} from 'react';

const INTERVAL = 1e3;
const SEC_TO_ADD = 1;

const useTimer = () => {
  const [currentSecVal, setCurrentSecVal] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = () => 
    setIsRunning(true);
  

  const stop = () => {
    setCurrentSecVal(0);
    setIsRunning(false);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(
        () => setCurrentSecVal(sec => sec + SEC_TO_ADD),
        INTERVAL,
      );
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return {
    currentValue: currentSecVal,
    start,
    stop,
    initialValue: sec => {
      setCurrentSecVal(sec);
    },
  };
};

export default useTimer;
