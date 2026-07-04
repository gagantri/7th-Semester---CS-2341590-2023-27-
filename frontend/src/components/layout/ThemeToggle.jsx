import PropTypes from 'prop-types';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { TEST_IDS } from '@/constants/testIds';

export function ThemeToggle({ className }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      data-testid={TEST_IDS.layout.themeToggle}
      className={className}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

ThemeToggle.propTypes = { className: PropTypes.string };
