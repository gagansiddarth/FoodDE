import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/shared/contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme, actualTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    if (theme === 'system') return <Monitor className="w-4 h-4" />;
    return actualTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />;
  };

  const getTooltip = () => {
    switch (theme) {
      case 'light': return 'Switch to dark mode';
      case 'dark': return 'Switch to system theme';
      case 'system': return 'Switch to light mode';
      default: return 'Toggle theme';
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="transition-all duration-200 hover:scale-105"
      title={getTooltip()}
      aria-label={getTooltip()}
    >
      {getIcon()}
    </Button>
  );
};

export default ThemeToggle;
