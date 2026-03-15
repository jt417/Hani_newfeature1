import { useState } from 'react';

export function useCurrency(showToast) {
  const [haniCoin, setHaniCoin] = useState(1500);
  const [orb, setOrb] = useState(30);

  const handleDeduct = (amount, type, onSuccess) => {
    if (type === 'orb') {
      if (orb >= amount) { setOrb(p => p - amount); onSuccess(); }
      else { showToast('Orb가 부족합니다. 포인트 탭에서 획득해주세요.'); }
    } else if (type === 'hani') {
      if (haniCoin >= amount) { setHaniCoin(p => p - amount); onSuccess(); }
      else { showToast('HANI가 부족합니다. 충전해주세요.'); }
    }
  };

  return { haniCoin, orb, handleDeduct };
}
