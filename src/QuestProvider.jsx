import { useEffect, useState } from 'react';
import { QuestContext } from './quest-context';
import { toggleChecklistItem } from './family-checklist';

export default function QuestProvider({ children }) {
  const [language, setLanguageState] = useState('English');
  const [query, setQuery] = useState('');
  const [card, setCard] = useState(null);
  const [notebook, setNotebook] = useState([]);
  const [reflection, setReflectionState] = useState(null);
  const [saved, setSaved] = useState(false);
  const [cardViewed, setCardViewed] = useState(false);
  const [checklist, setChecklist] = useState({});
  useEffect(() => {
    document.documentElement.lang = language === 'Español' ? 'es' : 'en';
  }, [language]);

  function prepareReview(value) {
    setQuery(value.trim());
    setCard(null);
    setReflectionState(null);
    setSaved(false);
    setCardViewed(false);
    setChecklist({});
  }

  function setLanguage(value) {
    if (value === language) return;
    setLanguageState(value);
    setCard(null);
    setReflectionState(null);
    setSaved(false);
    setCardViewed(false);
    setChecklist({});
  }

  function saveCard() {
    if (!card || saved) return;
    setNotebook(items => [...items, {
      id: `${Date.now()}-${items.length}`,
      card,
      language,
      reflection,
      checklist,
      savedAt: new Date().toISOString(),
    }]);
    setSaved(true);
  }

  function reopenCard(entry) {
    setLanguageState(entry.language);
    setQuery(entry.card.claim_reviewed);
    setCard(entry.card);
    setReflectionState(entry.reflection);
    setSaved(true);
    setCardViewed(false);
    setChecklist(entry.checklist ?? {});
  }

  function setReflection(value) {
    setReflectionState(value);
    setNotebook(items => items.map(entry => entry.card === card
      ? { ...entry, reflection: value } : entry));
  }

  function clearNotebook() {
    setNotebook([]);
    setSaved(false);
  }

  function updateChecklist(value) {
    setChecklist(value);
    setNotebook(items => items.map(entry => entry.card === card
      ? { ...entry, checklist: value } : entry));
  }

  function toggleChecklist(id) {
    updateChecklist(toggleChecklistItem(checklist, id));
  }

  function resetChecklist() {
    updateChecklist({});
  }

  return (
    <QuestContext.Provider value={{
      language, setLanguage, query, prepareReview, card, setCard,
      notebook, saveCard, saved, reopenCard, clearNotebook, reflection, setReflection,
      cardViewed, setCardViewed,
      checklist, toggleChecklist, resetChecklist,
    }}>
      {children}
    </QuestContext.Provider>
  );
}
