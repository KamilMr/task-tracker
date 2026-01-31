import React from 'react';
import {Text} from 'ink';
import TruncatedText from '../TruncatedText.js';

const CATEGORY_COLORS = {
  integration: 'magenta',
  feature: 'green',
  ui: 'blue',
  fix: 'red',
  refactor: 'yellow',
  config: 'cyan',
};

const CATEGORY_SHORT = {
  integration: 'int',
  feature: 'feat',
  ui: 'ui',
  fix: 'fix',
  refactor: 'ref',
  config: 'cfg',
};

const SCOPE_SHORT = {
  small: 'S',
  medium: 'M',
  large: 'L',
};

const MetadataBadges = ({
  epic,
  category,
  isExploration,
  scope,
  dimmed = false,
}) => {
  const hasExploration = isExploration === true || isExploration === 1;
  const hasBadges = epic || category || hasExploration || scope;
  if (!hasBadges) return null;

  return (
    <Text dimColor={dimmed}>
      {category && (
        <Text color={dimmed ? undefined : CATEGORY_COLORS[category]}>
          {' '}
          [{CATEGORY_SHORT[category]}]
        </Text>
      )}
      {scope && <Text> [{SCOPE_SHORT[scope]}]</Text>}
      {hasExploration && (
        <Text color={dimmed ? undefined : 'yellow'}> [exp]</Text>
      )}
      {epic && (
        <Text color={dimmed ? undefined : 'cyan'}>
          {' '}
          [
          <TruncatedText
            text={epic}
            maxLength={12}
            color={dimmed ? undefined : 'cyan'}
          />
          ]
        </Text>
      )}
    </Text>
  );
};

export default MetadataBadges;
