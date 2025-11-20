
import React, { useState } from 'react';
import { CardData, Rarity, Department } from '../types';

interface CardProps {
  data: CardData;
  isOwned: boolean;
  count: number;
  onClick?: () => void;
  showCount?: boolean;
}

const rarityColors = {
  [Rarity.COMMON]: 'border-gray-400 bg-gray-100',
  [Rarity.RARE]: 'border-blue-400 bg-blue-50',
  [Rarity.EPIC]: 'border-purple-500 bg-purple-50',
  [Rarity.LEGENDARY]: 'border-yellow-400 bg-yellow-50',
};

const deptColors = {
  [Department.ENGINEERING]: 'bg-blue-600',
  [Department.DESIGN]: 'bg-pink-500',
  [Department.SALES]: 'bg-green-500',
  [Department.HR]: 'bg-orange-400',
  [Department.EXECUTIVE]: 'bg-black',
};

const Card: React.FC<CardProps> = ({ data, isOwned, count, onClick, showCount = true }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent page clicks
    if (isOwned) {
        setIsFlipped(!isFlipped);
        if (onClick) onClick();
    }
  };

  // Empty Slot
  if (!isOwned) {
    return (
      <div className="aspect-[3/4] rounded border border-dashed border-gray-400 bg-gray-100/50 flex flex-col items-center justify-center p-2 relative group">
        <span className="text-2xl font-header text-gray-300 font-bold mb-1">{data.id}</span>
        <span className="text-[8px] text-center text-gray-400 uppercase tracking-wider leading-tight">{data.name}</span>
      </div>
    );
  }

  // Owned Card
  return (
    <div 
      className="group relative aspect-[3/4] cursor-pointer perspective-1000 select-none"
      onClick={handleCardClick}
    >
      {/* Hint overlay on hover */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
        Click to Flip ↻
      </div>

      <div className={`w-full h-full transition-all duration-500 transform-style-3d shadow-md hover:shadow-xl ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* FRONT */}
        <div className={`absolute w-full h-full backface-hidden rounded border-[2px] overflow-hidden ${rarityColors[data.rarity]} flex flex-col`}>
          
          {/* Header */}
          <div className="flex justify-between items-center px-1.5 py-1 bg-white/90 border-b border-gray-200 z-10 h-7">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-sm ${deptColors[data.department]}`}>
              {data.department[0]}
            </div>
            <span className="font-header font-bold text-brand-dark uppercase text-[10px] truncate ml-1 flex-1 text-right leading-none">
                {data.rarity === Rarity.LEGENDARY && '✨ '}
                {data.name}
            </span>
          </div>

          {/* Image Area */}
          <div className="relative flex-1 overflow-hidden bg-gray-200">
            <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" />
            
            {/* Shine Effect */}
            {(data.rarity === Rarity.EPIC || data.rarity === Rarity.LEGENDARY) && (
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay" style={{ backgroundSize: '200% 200%' }} />
            )}
            
            {/* Badge Number */}
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] px-1 rounded font-mono">
              #{data.id.toString().padStart(3, '0')}
            </div>
          </div>

          {/* Footer */}
          <div className={`h-4 ${deptColors[data.department]} flex items-center justify-center`}>
             <span className="text-white text-[8px] font-bold tracking-widest uppercase">{data.department}</span>
          </div>

          {/* Duplicates Badge */}
          {showCount && count > 1 && (
             <div className="absolute -top-1.5 -right-1.5 bg-brand-accent text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border border-white z-20 shadow-sm">
               {count}
             </div>
          )}
        </div>

        {/* BACK */}
        <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded border-[2px] bg-white overflow-hidden p-3 flex flex-col ${rarityColors[data.rarity]}`}>
           <div className="text-center mb-2">
               <h3 className="font-header text-sm font-bold text-brand-dark leading-tight">{data.name}</h3>
               <p className="text-[9px] text-gray-500 font-semibold uppercase">{data.role}</p>
           </div>

           <div className="flex-1 flex flex-col justify-center bg-white/50 rounded p-1">
             <p className="text-[9px] text-gray-700 italic text-center leading-tight">
                "{data.description}"
             </p>
           </div>

           <div className="mt-auto pt-2 border-t border-gray-300">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[8px] font-bold text-gray-400 uppercase">Power</span>
                <span className="text-lg font-header font-bold text-brand-accent leading-none">{data.power}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-brand-accent h-1 rounded-full" style={{ width: `${data.power}%` }}></div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Card;
