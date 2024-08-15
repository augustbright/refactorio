import { Text } from 'ink';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ProgramOptions } from '../types/index.js';
import { ProgramOptionsContext } from './ProgramOptionsContext.js';

const queryClient = new QueryClient();

export const GlobalProviders = ({
  children,
  programOptions
}: {
  children: React.ReactNode;
  programOptions: ProgramOptions;
}) => (
  <ProgramOptionsContext.Provider value={programOptions}>
    <Text>{programOptions.defaultDir}</Text>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </ProgramOptionsContext.Provider>
);
