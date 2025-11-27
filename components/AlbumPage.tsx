
import React from 'react';
import { Department, CardData } from '../types';
import Card from './Card';

interface AlbumPageProps {
  department: Department;
  cards: CardData[];
  ownedIds: number[];
  duplicates: Record<number, number>;
}

const AlbumPage: React.FC<AlbumPageProps> = ({ department, cards, ownedIds, duplicates }) => {
  const deptCards = cards.filter(c => c.department === department).sort((a, b) => a.id - b.id);
  const ownedCount = deptCards.filter(c => ownedIds.includes(c.id)).length;
  const progress = Math.round((ownedCount / deptCards.length) * 100);

  const deptIcon = 
        department === Department.DIRECTION ? '👔' :
        department === Department.SALES ? '💼' :
        department === Department.MARKETING ? '🎨' :
        department === Department.HR ? '🤝' : 
        department === Department.FINANCE ? '💰' :
        department === Department.OPERATIONS ? '⚙️' :
        department === Department.IT ? '💻' :
        department === Department.LOGISTICS ? '🚚' :
        '🏢';

  return (
    <div className="mb-12 border-b border-white/5 pb-12 last:border-0">
      {/* Department Header */}
      <div className="sticky top-[60px] z-30 bg-brand-dark/95 backdrop-blur py-4 mb-6 border-b border-white/10 flex justify-between items-center px-4 md:px-0">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 flex items-center justify-center rounded-full text-xl bg-white/10 border border-white/20 shadow-inner`}>
                {deptIcon}
            </div>
            <div>
                <h2 className="text-2xl font-header font-bold text-white uppercase">{department}</h2>
                <div className="text-xs text-gray-400 font-mono">Team Size: {deptCards.length}</div>
            </div>
        </div>
        
        {/* Progress Bar */}
        <div className="flex flex-col items-end w-1/3 max-w-[200px]">
            <span className="text-xs font-bold text-brand-accent mb-1">{progress}% Complete</span>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-brand-accent to-purple-600 transition-all duration-1000" 
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 px-2 md:px-0">
          {/* Team Shield (Cosmetic First Slot) */}
          <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex flex-col items-center justify-center text-center p-4">
             <div className="text-4xl opacity-50 mb-2">🛡️</div>
             <h3 className="font-header font-bold text-white/50 uppercase">{department}</h3>
             <span className="text-[10px] text-white/30 uppercase mt-1">Team Emblem</span>
          </div>

          {/* Employee Cards */}
          {deptCards.map(card => (
              <Card 
                key={card.id} 
                data={card} 
                isOwned={ownedIds.includes(card.id)} 
                count={duplicates[card.id] ? duplicates[card.id] + 1 : 1}
              />
          ))}
      </div>
    </div>
  );
};

export default AlbumPage;