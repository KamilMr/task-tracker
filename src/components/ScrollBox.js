import React from 'react';
import {Box} from 'ink';

const ScrollBox = ({height, selectedIndex = 0, children}) => {
  const childArray = React.Children.toArray(children);
  const totalItems = childArray.length;

  // Keep selection centered when possible
  const center = Math.floor(height / 2);
  const idealStart = selectedIndex - center;
  const maxStart = Math.max(0, totalItems - height);
  const startIndex = Math.max(0, Math.min(idealStart, maxStart));

  const visibleChildren = childArray.slice(startIndex, startIndex + height);

  return <Box flexDirection="column">{visibleChildren}</Box>;
};

export default ScrollBox;
