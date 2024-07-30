import { TScriptDefinition } from '../transformation/types';

import { parse } from 'src/parser';

export const parseScript = (script: TScriptDefinition) => {
  return typeof script === 'string' ? parse(script) : script;
};
