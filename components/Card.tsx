
import React, { useState } from 'react';
import { CardData, Rarity, Department } from '../types';

interface CardProps {
  data: CardData;
  isOwned: boolean;
  count: number;
  onClick?: () => void;
  showCount?: boolean;
  isNew?: boolean; // New Prop for highlighting
}

// Background tints based on Rarity (kept for inner ambiance)
const rarityBgs = {
  [Rarity.COMMON]: 'bg-gray-100',
  [Rarity.RARE]: 'bg-blue-50',
  [Rarity.EPIC]: 'bg-purple-50',
  [Rarity.LEGENDARY]: 'bg-yellow-50',
};

// Glows for special effects
const rarityGlows = {
  [Rarity.COMMON]: 'from-gray-200 via-white to-gray-200',
  [Rarity.RARE]: 'from-blue-300 via-cyan-200 to-blue-300',
  [Rarity.EPIC]: 'from-purple-400 via-pink-300 to-purple-400',
  [Rarity.LEGENDARY]: 'from-yellow-300 via-amber-100 to-yellow-500',
};

// Department Specific Styles (Border, Text, Backgrounds for badges)
const deptStyles = {
  [Department.DIRECTION]: { border: 'border-slate-900', text: 'text-slate-900', bg: 'bg-slate-900', light: 'bg-slate-100' },
  [Department.SALES]:     { border: 'border-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-600', light: 'bg-emerald-50' },
  [Department.MARKETING]: { border: 'border-rose-600', text: 'text-rose-600', bg: 'bg-rose-600', light: 'bg-rose-50' },
  [Department.HR]:        { border: 'border-blue-600', text: 'text-blue-600', bg: 'bg-blue-600', light: 'bg-blue-50' },
  [Department.FINANCE]:   { border: 'border-amber-500', text: 'text-amber-600', bg: 'bg-amber-500', light: 'bg-amber-50' },
  [Department.OPERATIONS]:{ border: 'border-orange-600', text: 'text-orange-600', bg: 'bg-orange-600', light: 'bg-orange-50' },
  [Department.IT]:        { border: 'border-cyan-600', text: 'text-cyan-600', bg: 'bg-cyan-600', light: 'bg-cyan-50' },
  [Department.LOGISTICS]: { border: 'border-stone-500', text: 'text-stone-600', bg: 'bg-stone-500', light: 'bg-stone-50' },
};

const Card: React.FC<CardProps> = ({ data, isOwned, count, onClick, showCount = true, isNew = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const styles = deptStyles[data.department] || deptStyles[Department.DIRECTION];

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isOwned) {
        setIsFlipped(!isFlipped);
        if (onClick) onClick();
    }
  };

  // Empty Slot
  if (!isOwned) {
    return (
      <div className={`aspect-[3/4] rounded border-2 border-dashed ${styles.border} border-opacity-30 ${styles.light} flex flex-col items-center justify-center p-2 relative group`}>
        <span className={`text-2xl font-header font-bold mb-1 opacity-20 ${styles.text}`}>{data.id}</span>
        <span className={`text-[8px] text-center uppercase tracking-wider leading-tight opacity-40 ${styles.text}`}>{data.name}</span>
      </div>
    );
  }

  // Owned Card
  return (
    <div 
      className="group relative aspect-[3/4] cursor-pointer perspective-1000 select-none transition-transform duration-300 ease-out hover:scale-[1.02]"
      onClick={handleCardClick}
      onMouseEnter={() => isOwned && !isFlipped} 
    >
      {/* Hint overlay on hover */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
        Clic para girar ↻
      </div>

      {/* SPECTACULAR NEW EFFECT: God Rays Background (Only visible if not flipped) */}
      {isNew && (
        <div className="absolute -inset-4 z-0 pointer-events-none opacity-70">
           <div className={`w-full h-full bg-gradient-to-tr ${rarityGlows[data.rarity]} blur-xl animate-pulse-fast`}></div>
           <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,transparent_50%,#fff_100%)] animate-spin-slow opacity-40 mix-blend-overlay rounded-full scale-150"></div>
        </div>
      )}

      {/* Flip Container */}
      <div className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-md hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-1 group-hover:rotate-y-6 ${isFlipped ? 'rotate-y-180' : ''} z-10`}>
        
        {/* FRONT */}
        {/* The Border now represents the Department Color */}
        <div className={`absolute w-full h-full backface-hidden rounded border-[3px] overflow-hidden ${styles.border} ${rarityBgs[data.rarity]} flex flex-col`}>
          
          {/* EFFECTS */}
          {!isFlipped && isNew && (
            <>
              <div className="absolute inset-0 bg-white animate-flash pointer-events-none z-50 mix-blend-overlay"></div>
              <div className="absolute top-0 left-0 z-30 pointer-events-none">
                 <div className="bg-gradient-to-r from-red-600 to-brand-accent text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg shadow-md border-b border-r border-white/20 animate-pulse">
                   NUEVA
                 </div>
              </div>
               <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
                   <div className="absolute bottom-2 left-2 text-yellow-300 text-[10px] animate-float-up" style={{ animationDelay: '0s' }}>✨</div>
                   <div className="absolute bottom-4 right-4 text-white text-[8px] animate-float-up" style={{ animationDelay: '0.5s' }}>✦</div>
                   <div className="absolute bottom-10 left-1/2 text-gold text-[12px] animate-float-up" style={{ animationDelay: '1s' }}>⋆</div>
               </div>
            </>
          )}

          {/* Header */}
          <div className="flex justify-between items-center px-1.5 py-1 bg-white border-b border-gray-100 z-10 h-7">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-sm ${styles.bg}`}>
              {data.department[0]}
            </div>
            {/* Name text colored by Department */}
            <span className={`font-header font-bold uppercase text-[10px] truncate ml-1 flex-1 text-right leading-none ${styles.text}`}>
                {data.rarity === Rarity.LEGENDARY && '✨ '}
                {data.name}
            </span>
          </div>

          {/* Image Area */}
          <div className="relative flex-1 overflow-hidden bg-gray-200">
            <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" />
            
            {/* Shine Effect - Enhanced for all cards on hover */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/${data.rarity === Rarity.LEGENDARY ? '60' : '30'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay`} style={{ backgroundSize: '200% 200%' }} />
            
            {/* Badge Number */}
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] px-1 rounded font-mono">
              #{data.id.toString().padStart(3, '0')}
            </div>
          </div>

          {/* Footer */}
          <div className={`h-4 ${styles.bg} flex items-center justify-center`}>
             <span className="text-white text-[8px] font-bold tracking-widest uppercase truncate px-1">{data.department}</span>
          </div>

          {/* Duplicates Badge */}
          {showCount && count > 1 && (
             <div className="absolute -top-1.5 -right-1.5 bg-brand-accent text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border border-white z-20 shadow-sm">
               {count}
             </div>
          )}
        </div>

        {/* BACK */}
        {/* Back Border also Department Color */}
        <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded border-[3px] bg-white overflow-hidden p-3 flex flex-col ${styles.border}`}>
           <div className="text-center mb-2">
               <h3 className={`font-header text-sm font-bold leading-tight ${styles.text}`}>{data.name}</h3>
               <p className="text-[9px] text-gray-500 font-semibold uppercase">{data.role}</p>
           </div>

           <div className={`flex-1 flex flex-col justify-center rounded p-1 ${styles.light}`}>
             <p className="text-[9px] text-gray-700 italic text-center leading-tight">
                "{data.description}"
             </p>
           </div>

           <div className="mt-auto pt-2 border-t border-gray-200">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[8px] font-bold text-gray-400 uppercase">Impacto</span>
                <span className={`text-lg font-header font-bold leading-none ${styles.text}`}>{data.power}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className={`h-1 rounded-full ${styles.bg}`} style={{ width: `${data.power}%` }}></div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Card;
