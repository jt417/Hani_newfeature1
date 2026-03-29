import React from 'react';
import { Home, BookOpen, Users, MessageSquare, User } from 'lucide-react';

const TABS = [
  { key: 'home', label: '홈', Icon: Home, matchKeys: ['home'] },
  { key: 'diary', label: '사주일기', Icon: BookOpen, matchKeys: ['diary'] },
  { key: 'compat', label: '궁합', Icon: Users, matchKeys: ['compat'] },
  { key: 'chat', label: '채팅', Icon: MessageSquare, matchKeys: ['chat'] },
  { key: 'my', label: '마이', Icon: User, matchKeys: ['my'] },
];

export default function BottomNav({ activeTab, switchTab }) {
  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center h-[84px] pb-6 pt-3 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {TABS.map(({ key, label, Icon, matchKeys }) => {
        const isActive = matchKeys.includes(activeTab);
        return (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`flex flex-col items-center gap-1.5 w-1/5 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'fill-surface-line' : ''}`} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
