import { createContext, useContext } from 'react';

export const QuestContext = createContext(null);

export function useQuest() {
  const context = useContext(QuestContext);
  if (!context) throw new Error('SupplementQuest provider is missing.');
  return {
    ...context,
    t: (english, spanish) => context.language === 'Español' ? spanish : english,
  };
}
