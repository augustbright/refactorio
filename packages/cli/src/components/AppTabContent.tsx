import { parse, preprocessInput } from '@refactorio/engine';

import fs from 'fs/promises';
import { Box } from 'ink';
import path from 'path';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-query';

import { useTabs } from '../hooks/useTabs.js';
import { TTab } from '../types/index.js';
import { Browser } from './Browser.js';
import { ProgramEvaluator } from './ProgramEvaluator.js';
import { ProgramOptionsContext } from './ProgramOptionsContext.js';

export const AppTabContent = ({ tab }: { tab: TTab }) => {
  const { setFile, activeTabId } = useTabs();
  const handleSelectFile = useCallback((file: string) => {
    setFile(tab.id, file);
  }, []);
  const { defaultDir } = useContext(ProgramOptionsContext);
  const tabFile = tab.file;
  const { data } = useQuery(
    ['file', tab.file],
    async () => {
      const fileContents = await fs.readFile(tabFile!, 'utf-8');
      const preprocessed = preprocessInput(fileContents);
      return {
        program: parse(preprocessed),
        code: preprocessed
      };
    },
    {
      enabled: !!tabFile
    }
  );

  if (!tabFile) {
    return (
      <Box
        flexDirection='column'
        alignItems='center'
      >
        <Browser
          onSelect={handleSelectFile}
          initialDir={path.resolve(process.cwd(), defaultDir ?? process.cwd())}
          enabled={tab.id === activeTabId}
        />
      </Box>
    );
  }

  return data ? (
    <ProgramEvaluator
      code={data.code}
      program={data.program}
    />
  ) : null;
};
