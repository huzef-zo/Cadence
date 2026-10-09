import { useI18n } from '../i18n';

export type Tab = 'today' | 'calendar' | 'history' | 'settings';

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export function TabBar({ active, onChange }: TabBarProps) {
  const { t } = useI18n();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'today', label: t.tabToday },
    { id: 'calendar', label: t.tabCalendar },
    { id: 'history', label: t.tabHistory },
    { id: 'settings', label: t.tabSettings },
  ];

  return (
    <nav className="tabbar" aria-label={t.appName}>
      {tabs.map((tab) => (
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
