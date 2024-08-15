import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

import { TTab, TTabId } from '../types/index.js';

const tabsAtom = atom<TTab[]>([
  {
    id: 1 as TTabId,
    file: null
  }
]);
const activeTabIdAtom = atom<TTabId | null>(1 as TTabId);

export const useTabs = () => {
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [activeTabId, setActiveTabId] = useAtom(activeTabIdAtom);

  const getNewTabId = useCallback(() => {
    return (tabs.reduce((max, tab) => Math.max(max, tab.id), 0) + 1) as TTabId;
  }, [tabs]);

  const newTab = useCallback(() => {
    const id = getNewTabId();
    setTabs((tabs) => [
      ...tabs,
      {
        id,
        file: null
      }
    ]);
    setActiveTabId(id);
  }, [getNewTabId]);

  const nextTab = useCallback(() => {
    if (tabs.length === 0) {
      return;
    }
    const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTabId);
    const nextTabIndex = (activeTabIndex + 1) % tabs.length;
    setActiveTabId(tabs[nextTabIndex].id);
  }, [tabs, activeTabId]);

  const prevTab = useCallback(() => {
    if (tabs.length === 0) {
      return;
    }
    const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTabId);
    const prevTabIndex = (activeTabIndex - 1 + tabs.length) % tabs.length;
    setActiveTabId(tabs[prevTabIndex].id);
  }, [tabs, activeTabId]);

  const setFile = useCallback(
    (tabId: TTabId, file: string) => {
      setTabs((tabs) =>
        tabs.map((tab) => (tab.id === tabId ? { ...tab, file } : tab))
      );
    },
    [setTabs]
  );

  return { tabs, newTab, nextTab, prevTab, activeTabId, setFile };
};
