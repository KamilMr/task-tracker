import React from 'react';
import {Box} from 'ink';

const Frame = ({borderColor, minHeight, children, height, ...rest}) => {
  const childrenArray = React.Children.toArray(children);
  const header = childrenArray.find(child => child.type === Header);
  const body = childrenArray.find(child => child.type === Body);
  const footer = childrenArray.find(child => child.type === Footer);

  return (
    <Box
      borderColor={borderColor}
      borderStyle={'round'}
      minHeight={minHeight}
      flexDirection="column"
      justifyContent="space-between"
      height={height}
      {...rest}
    >
      <Box flexDirection="column">
        {header}
        {body}
      </Box>
      {footer}
    </Box>
  );
};

const Header = ({children}) => {
  return <Box marginY={-1}>{children}</Box>;
};

const Body = ({children}) => {
  return <Box flexDirection="column" marginY={1}>{children}</Box>;
};

const Footer = ({children}) => {
  return <>{children}</>;
};

Frame.Header = Header;
Frame.Body = Body;
Frame.Footer = Footer;

export default Frame;
