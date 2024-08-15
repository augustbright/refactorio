import { Tagged } from 'type-fest';

export type TTabId = Tagged<number, 'TabId'>;
export type TTab = {
  id: TTabId;
  file: string | null;
};

export type ProgramOptions = {
  defaultDir?: string;
};
