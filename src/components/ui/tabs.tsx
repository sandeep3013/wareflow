import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center space-x-1 border-b border-border overflow-x-auto no-scrollbar', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'group inline-flex items-center gap-2 border-b-2 py-2.5 px-3.5 text-xs font-semibold tracking-wide uppercase transition-all duration-150 whitespace-nowrap',
              isActive
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-foreground-secondary hover:border-gray-300 hover:text-foreground'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
