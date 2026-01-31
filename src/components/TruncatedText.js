import React from 'react';
import {Text} from 'ink';

const TruncatedText = ({text, maxLength = 15, color, dimColor = false}) => {
  if (!text) return null;

  const displayText =
    text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;

  return (
    <Text color={color} dimColor={dimColor}>
      {displayText}
    </Text>
  );
};

export default TruncatedText;
