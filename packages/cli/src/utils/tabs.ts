import path from 'path';

import { TTab } from '../types/index.js';

export const getTabName = (tab: TTab): string => {
  return tab.file ? path.basename(tab.file) : 'New Tab';
};
