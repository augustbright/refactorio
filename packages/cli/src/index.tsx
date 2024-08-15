import { Command } from 'commander';
import { render } from 'ink';
import React from 'react';

//get information from package.json
import { GlobalProviders } from './components/GlobalProviders.js';
import { Routing } from './components/Routing.js';
import { ProgramOptions } from './types/index.js';

const program = new Command();

program
  .name('Refactorio CLI')
  .version('1.0.0')
  .description('Refactorio CLI is a tool to refactor your codebase')
  .option('-dd, --default-dir <path>', 'Path to the file or directory to open');

program.parse();
const options = program.opts<ProgramOptions>();
render(
  <GlobalProviders programOptions={options}>
    <Routing />
  </GlobalProviders>
);
