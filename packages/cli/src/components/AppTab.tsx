import { Box, Text } from 'ink';
import React from 'react';

import { useTabs } from '../hooks/useTabs.js';
import { TTab } from '../types/index.js';
import { getTabName } from '../utils/tabs.js';

export const AppTab = ({ tab }: { tab: TTab }) => {
  const { activeTabId } = useTabs();
  return (
    <Box>
      <Text
        underline
        color={tab.id === activeTabId ? 'green' : 'gray'}
      >
        {getTabName(tab)}
      </Text>
    </Box>
  );
};
