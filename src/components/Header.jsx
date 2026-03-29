import React from 'react';

const TAB_TITLES = {
  home: '홈',
  diary: '사주일기',
  compat: '궁합',
  chat: '하니와의 상담',
  my: '마이'
};

export default function Header({ activeTab, haniCoin, orb }) {
  const isMy = activeTab === 'my';

  return (
    <div className={`pt-12 pb-3 px-5 z-30 flex justify-between items-center relative transition-colors ${isMy ? 'bg-[#654479]' : 'bg-white border-b border-gray-100'}`}>
      <h1 className={`text-xl font-extrabold ${isMy ? 'text-white' : 'text-gray-900'}`}>
        {TAB_TITLES[activeTab] || ''}
      </h1>
      <div className="flex items-center gap-1.5">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isMy ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500'}`}>
          💰 {haniCoin} HANI
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isMy ? 'bg-white/10 text-white' : 'bg-[#F0EBF5] text-[#5E4078]'}`}>
          🔮 {orb} Orb
        </div>
      </div>
    </div>
  );
}
