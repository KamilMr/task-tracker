import {useState, useEffect} from 'react';

const useTerminalSize = () => {
  const [size, setSize] = useState([
    process.stdout.columns || 80,
    process.stdout.rows || 24,
  ]);

  useEffect(() => {
    const onResize = () =>
      setSize([process.stdout.columns, process.stdout.rows]);
    process.stdout.on('resize', onResize);
    return () => process.stdout.off('resize', onResize);
  }, []);

  return size;
};

export default useTerminalSize;
