import { useGameState } from './useGameState';

export function useThemeText() {
  const { state } = useGameState();
  
  const formatText = (text: string) => {
    if (state.theme === 'poetry') {
      return text.replace(/النظام/g, 'الشعر');
    }
    return text;
  };

  return { formatText };
}
