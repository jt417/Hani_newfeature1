import React from 'react';
import { MessageSquare, Map as MapIcon, BookOpen, Database, User } from 'lucide-react';

const TABS = [
  { key: 'chat', label: '채팅', Icon: MessageSquare, matchKeys: ['chat'] },
  { key: 'map', label: '관계 맵', Icon: MapIcon, matchKeys: ['map', 'room'] },
  { key: 'diary', label: '다이어리', Icon: BookOpen, matchKeys: ['diary'] },
  { key: 'points', label: '포인트', Icon: Database, matchKeys: ['points'] },
  { key: 'more', label: '더보기', Icon: User, matchKeys: ['more'] },
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
            className={`flex flex-col items-center gap-1.5 w-1/5 transition-colors ${isActive ? 'text-[#5E4078]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'fill-[#EBE5F2]' : ''}`} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
