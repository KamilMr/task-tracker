import React from 'react';
import {Box} from 'ink';

const ScrollBox = ({height, selectedIndex = 0, children}) => {
  const childArray = React.Children.toArray(children);
  const startIndex = Math.max(0, selectedIndex - height + 1);
  const visibleChildren = childArray.slice(startIndex, startIndex + height);

  return <Box flexDirection="column">{visibleChildren}</Box>;
};

export default ScrollBox;
