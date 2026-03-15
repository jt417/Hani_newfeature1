import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';

export default function ChatTab({
  chatMessages, setChatMessages, chatContextNode,
  showToast, handleDeduct, nodes, setNodes
}) {
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualSajuForm, setManualSajuForm] = useState({ name: '', date: '', gender: 'W' });
  const chatScrollRef = useRef(null);

  const handleSendChat = (textOrEvent) => {
    let textToSend = chatInput;
    if (typeof textOrEvent === 'string') textToSend = textOrEvent;
    if (!textToSend.trim()) return;

    setChatMessages(p => [...p, { id: Date.now(), sender: 'user', text: textToSend }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(p => [...p, {
        id: Date.now() + 1, sender: 'ai',
        text: `사주 흐름상 ${chatContextNode?.name || '상대방'}님의 고집이 조금 강해지는 시기라 부딪힘이 있었던 것 같네요. 당분간은 먼저 경청해주고 공감해주는 화법을 써보시는 걸 추천드려요.`
      }]);
    }, 1500);
  };

  const handleSubmitManualSaju = () => {
    if (!manualSajuForm.name) { showToast('이름을 입력해주세요'); return; }
    handleDeduct(10, 'orb', () => {
      setShowManualForm(false);
      const newNode = {
        id: `m_${Date.now()}`, name: manualSajuForm.name, groups: ['g3'], score: 88, status: 'checked',
        tags: ['수동입력', '새로운 인연'], summary: '직접 입력한 명식', detailSummary: '상세 분석을 위해 추가된 데이터입니다.',
        roleLabel: '상담대상', badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', isDetailUnlocked: true, x: 700, y: 500, isRecent: true
      };
      setNodes(p => [...p, newNode]);

      setChatMessages(p => [
        ...p,
        { id: Date.now(), sender: 'user', text: `${manualSajuForm.name}님의 사주 정보를 입력했어. 궁합을 분석해줘.` },
      ]);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(p => [...p, {
          id: Date.now() + 1, sender: 'ai',
          text: `입력해주신 ${manualSajuForm.name}님의 명식을 분석 완료했습니다! 당신과의 궁합 점수는 88점으로 매우 좋은 편이네요.\n이 분과의 관계에서 어떤 점이 가장 궁금하신가요?`
        }]);
      }, 1500);
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F9F9] relative pb-[80px] pt-2">
      <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-5">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3.5 max-w-[260px] text-[13px] leading-relaxed shadow-sm ${msg.sender === 'user'
                ? 'bg-[#F0EBF5] text-[#5E4078] rounded-2xl rounded-tr-sm font-medium'
                : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'}`}>
                {msg.text.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br /></React.Fragment>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-3 flex gap-2 items-center z-10 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <input
          type="text"
          placeholder="하니와 대화를 시작해보세요"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#5E4078] transition"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
        />
        <button
          onClick={() => handleSendChat()}
          disabled={!chatInput.trim() || isTyping}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${chatInput.trim() && !isTyping ? 'bg-[#5E4078] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
