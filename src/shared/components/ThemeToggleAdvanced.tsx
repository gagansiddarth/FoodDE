import React from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { useTheme } from '@/shared/contexts/ThemeContext';

const ThemeToggleAdvanced: React.FC = () => {
  const { theme, setTheme, actualTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  const getCurrentIcon = () => {
    if (theme === 'system') return <Monitor className="w-4 h-4" />;
    return actualTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="transition-all duration-200 hover:scale-105"
          aria-label="Toggle theme"
        >
          {getCurrentIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </div>
            {theme === value && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggleAdvanced;
