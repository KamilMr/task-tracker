import {useState, useEffect, useCallback} from 'react';

const useScrollableList = (items, options = {}) => {
  const {wrap = true} = options;
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Adjust index if items array shrinks
  useEffect(() => {
    if (items.length === 0) {
      setSelectedIndex(0);
    } else if (selectedIndex >= items.length) {
      setSelectedIndex(items.length - 1);
    }
  }, [items.length, selectedIndex]);

  const selectNext = useCallback(() => {
    if (items.length === 0) return;
    setSelectedIndex(prev => {
      if (prev >= items.length - 1) return wrap ? 0 : prev;
      return prev + 1;
    });
  }, [items.length, wrap]);

  const selectPrevious = useCallback(() => {
    if (items.length === 0) return;
    setSelectedIndex(prev => {
      if (prev <= 0) return wrap ? items.length - 1 : prev;
      return prev - 1;
    });
  }, [items.length, wrap]);

  const selectFirst = useCallback(() => {
    setSelectedIndex(0);
  }, []);

  const selectLast = useCallback(() => {
    if (items.length === 0) return;
    setSelectedIndex(items.length - 1);
  }, [items.length]);

  return {
    selectedIndex,
    setSelectedIndex,
    selectNext,
    selectPrevious,
    selectFirst,
    selectLast,
    selectedItem: items[selectedIndex] || null,
  };
};

export default useScrollableList;
