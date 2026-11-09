import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import Button from '@/components/ui/Button';

const NEXT = { system: 'light', light: 'dark', dark: 'system' };
const ICON = { system: Monitor, light: Sun, dark: Moon };
const LABEL = { system: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' };

export default function ThemeToggle({ className }) {
  const { mode, setMode } = useTheme();
  const Icon = ICON[mode] || Monitor;
  return (
    <Button variant="ghost" size="icon" className={className} onClick={() => setMode(NEXT[mode] || 'system')} aria-label={`${LABEL[mode]}. Click to change.`} title={LABEL[mode]}>
      <Icon className="size-4" />
    </Button>
  );
}
