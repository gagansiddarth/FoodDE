# Dark Mode Implementation

## Overview
The FoodDE application now includes a comprehensive dark mode implementation with smooth transitions and system preference detection.

## Features

### 🌙 Theme Options
- **Light Mode**: Clean, bright interface optimized for daytime use
- **Dark Mode**: Easy-on-the-eyes dark interface for low-light environments  
- **System Mode**: Automatically follows your device's system theme preference

### 🎨 Design System
- **CSS Variables**: All colors are defined using CSS custom properties for consistent theming
- **Tailwind Integration**: Dark mode classes are properly configured with `darkMode: ["class"]`
- **Smooth Transitions**: All theme changes include smooth 0.3s transitions

### 🔧 Implementation Details

#### Theme Context
- `ThemeContext.tsx`: React context for managing theme state
- Persistent storage using localStorage
- System preference detection with `prefers-color-scheme` media query

#### Theme Toggle
- `ThemeToggle.tsx`: Simple cycle-through toggle (Light → Dark → System)
- `ThemeToggleAdvanced.tsx`: Dropdown menu with all three options
- Located in the site header for easy access

#### Color System
All colors are defined in `src/index.css` using HSL values:

**Light Mode Colors:**
- Background: `hsl(0 0% 100%)` (white)
- Foreground: `hsl(222.2 84% 4.9%)` (dark gray)
- Primary: `hsl(160 60% 38%)` (teal)
- Accent: `hsl(186 55% 45%)` (blue-teal)

**Dark Mode Colors:**
- Background: `hsl(222.2 84% 4.9%)` (dark blue-gray)
- Foreground: `hsl(210 40% 98%)` (light gray)
- Primary: `hsl(160 60% 45%)` (brighter teal)
- Accent: `hsl(186 55% 50%)` (brighter blue-teal)

### 🚀 Usage

#### For Users
1. Click the theme toggle button in the header
2. Choose from Light, Dark, or System mode
3. Your preference is automatically saved

#### For Developers
```tsx
import { useTheme } from '@/shared/contexts/ThemeContext';

const MyComponent = () => {
  const { theme, setTheme, actualTheme } = useTheme();
  
  return (
    <div className="bg-background text-foreground">
      Current theme: {theme}
      Actual theme: {actualTheme}
    </div>
  );
};
```

### 🎯 Components Updated
- ✅ SiteHeader: Added theme toggle
- ✅ HealthScoreGauge: Updated hardcoded colors to use CSS variables
- ✅ All UI components: Use semantic color classes
- ✅ CSS animations: Enhanced for dark mode

### 🔮 Future Enhancements
- Theme-specific animations
- Custom theme colors
- Theme-aware images
- Accessibility improvements for high contrast mode

## Technical Notes
- Uses `class` strategy for Tailwind dark mode
- No flash of unstyled content (FOUC) on theme switch
- Respects user's system preferences by default
- All transitions are hardware-accelerated for smooth performance
