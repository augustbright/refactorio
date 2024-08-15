import { Box, Spacer, Text, useApp, useInput } from 'ink';
import React from 'react';

import { useStdoutDimensions } from '../hooks/useStdoutDimensions.js';
import { useTabs } from '../hooks/useTabs.js';
import { AppTabs } from './AppTabs.js';

export const Application = () => {
  const { exit } = useApp();
  const [width, height] = useStdoutDimensions();
  const { newTab, nextTab, prevTab } = useTabs();
  useInput((input, key) => {
    if (input === 'q') {
      // console.log('Exiting');
      exit();
    } else if (input === 'n') {
      newTab();
    } else if (key.leftArrow) {
      prevTab();
    } else if (key.rightArrow) {
      nextTab();
    }
  });
  return (
    <Box
      flexDirection='column'
      height={height}
      width={width}
      borderStyle={'bold'}
    >
      <AppTabs />
      <Spacer />
      <Box
        gap={1}
        borderTop
        borderStyle={'single'}
        borderBottom={false}
        borderLeft={false}
        borderRight={false}
      >
        <Box>
          <Text backgroundColor='cyan'> q </Text>
          <Text color='gray'> - Quit</Text>
        </Box>
        <Box>
          <Text backgroundColor='cyan'> n </Text>
          <Text color='gray'> - New Tab</Text>
        </Box>
        <Box>
          <Text backgroundColor='cyan'> ←/→ </Text>
          <Text color='gray'> - Change Tab</Text>
        </Box>
      </Box>
    </Box>
  );
};
