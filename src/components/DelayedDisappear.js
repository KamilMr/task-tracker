import React, {useState, useEffect} from 'react';

const DelayedDisappear = ({children, delay = 2000}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (delay && delay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!isVisible) {
    return null;
  }

  return children;
};

export default DelayedDisappear;
