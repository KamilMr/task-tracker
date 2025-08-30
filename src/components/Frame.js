import React from 'react';
import {Box} from 'ink';

const Frame = ({borderColor, minHeight, children}) => {
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
  return <>{children}</>;
};

const Body = ({children}) => {
  return <Box flexDirection="column">{children}</Box>;
};

const Footer = ({children}) => {
  return <>{children}</>;
};

Frame.Header = Header;
Frame.Body = Body;
Frame.Footer = Footer;

export default Frame;
