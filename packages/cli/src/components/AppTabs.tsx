import { Box, Text } from 'ink';
import React from 'react';

import { useTabs } from '../hooks/useTabs.js';
import { AppTab } from './AppTab.js';
import { AppTabContent } from './AppTabContent.js';

export const AppTabs = () => {
  const { tabs, activeTabId } = useTabs();
  return (
    <Box
      flexDirection='column'
      alignItems='stretch'
    >
      <Box
        gap={2}
        borderStyle='single'
        borderColor='gray'
        borderTop={false}
        borderLeft={false}
        borderRight={false}
        paddingX={1}
      >
        <Box>
          <Text
            bold
            color='magenta'
          >
            Refactorio
          </Text>
        </Box>
        <Box>
          {tabs.map((tab, index) => (
            <React.Fragment key={tab.id}>
              <AppTab tab={tab} />
              {index < tabs.length - 1 && <Text color='gray'> * </Text>}
            </React.Fragment>
          ))}
        </Box>
      </Box>
      <Box paddingX={1}>
        {tabs.map((tab) => (
          <Box
            key={tab.id}
            display={tab.id === activeTabId ? 'flex' : 'none'}
            flexDirection='column'
            overflowY='hidden'
            alignItems='stretch'
            flexGrow={1}
          >
            <AppTabContent tab={tab} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
