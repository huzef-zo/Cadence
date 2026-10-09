import { strings } from '../i18n/en';

export type Tab = 'today' | 'calendar' | 'history' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: strings.tabToday },
  { id: 'calendar', label: strings.tabCalendar },
  { id: 'history', label: strings.tabHistory },
  { id: 'settings', label: strings.tabSettings },
];

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="tabbar" aria-label={strings.appName}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tabbar__tab${active === tab.id ? ' tabbar__tab--active' : ''}`}
          aria-current={active === tab.id ? 'page' : undefined}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
