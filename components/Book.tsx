
import React, { useState, useMemo } from 'react';
import { CardData, Department, UserState } from '../types';
import Card from './Card';

interface BookProps {
  roster: CardData[];
  user: UserState;
}

// Helper to split array into chunks
function chunkArray<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

const CARDS_PER_PAGE = 6;

const Book: React.FC<BookProps> = ({ roster, user }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Generate Pages Data Structure
  const pages = useMemo(() => {
    const generatedPages: React.ReactNode[] = [];

    // 0. Cover
    generatedPages.push(
      <div key="cover" className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-dark to-black border-4 border-gold text-center p-8 shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-20 mix-blend-overlay"></div>
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-brand-accent to-purple-600 flex items-center justify-center text-4xl font-bold text-white mb-6 shadow-lg border-4 border-white/10">
            CL
        </div>
        <h1 className="text-4xl font-header font-bold text-gold uppercase tracking-widest mb-2 drop-shadow-lg">NebulaCorp</h1>
        <h2 className="text-xl text-white/60 font-serif tracking-widest uppercase mb-12">Official 2025 Collection</h2>
        <div className="absolute bottom-8 text-white/30 text-xs uppercase">Property of {user.name}</div>
      </div>
    );

    // 1. Generate Pages per Department
    Object.values(Department).forEach((dept) => {
      const deptCards = roster.filter(c => c.department === dept).sort((a, b) => a.id - b.id);
      const chunks = chunkArray(deptCards, CARDS_PER_PAGE);

      chunks.forEach((chunk: CardData[], pageIdx: number) => {
        const isFirstPage = pageIdx === 0;
        
        generatedPages.push(
          <div key={`${dept}-${pageIdx}`} className="w-full h-full bg-[#fdfbf7] p-4 md:p-6 flex flex-col relative shadow-[inset_0_0_30px_rgba(0,0,0,0.05)]">
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50"></div>
            
            {/* Header only on first page of dept */}
            {isFirstPage && (
              <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-brand-dark/10 z-10">
                 <div className="text-2xl opacity-80">
                    {dept === Department.ENGINEERING && '🛠️'}
                    {dept === Department.DESIGN && '🎨'}
                    {dept === Department.SALES && '💼'}
                    {dept === Department.HR && '👥'}
                    {dept === Department.EXECUTIVE && '👑'}
                 </div>
                 <h3 className="font-header text-xl font-bold text-brand-dark uppercase">{dept}</h3>
              </div>
            )}

            {!isFirstPage && <div className="h-4"></div>}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 z-10 flex-1 content-start">
              {/* Shield Sticker Slot on First Page */}
              {isFirstPage && (
                <div className="aspect-[3/4] rounded bg-gray-200/50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-2 opacity-60">
                    <div className="text-4xl mb-1 grayscale opacity-30">🛡️</div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">{dept}<br/>Emblem</span>
                </div>
              )}

              {chunk.map((card: CardData) => (
                <div key={card.id} className="transform scale-95 hover:scale-100 transition-transform">
                    <Card 
                        data={card} 
                        isOwned={user.collection.includes(card.id)} 
                        count={user.duplicates[card.id] ? user.duplicates[card.id] + 1 : 1}
                        showCount={true}
                    />
                </div>
              ))}
            </div>
            
            <div className="mt-auto text-center z-10">
                 <span className="text-[10px] text-gray-400 font-mono">{pageIdx + 1} / {chunks.length}</span>
            </div>
          </div>
        );
      });
    });

    // Last Page: Back Cover
    generatedPages.push(
        <div key="back-cover" className="w-full h-full flex flex-col items-center justify-center bg-brand-dark border-l-2 border-white/5 relative">
             <div className="text-white/20 font-header text-6xl font-bold">END</div>
             <div className="mt-4 text-white/40 text-xs">Corporate Legends &copy; 2025</div>
        </div>
    );

    // Ensure even number of pages for spread view (Right page could be blank)
    if (generatedPages.length % 2 !== 0) {
        generatedPages.push(<div key="blank-end" className="w-full h-full bg-white"></div>);
    }

    return generatedPages;
  }, [roster, user]);

  // Navigation
  const turnPage = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    
    if (direction === 'next' && currentPageIndex < pages.length - 1) {
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentPageIndex(prev => prev + 2);
            setIsFlipping(false);
        }, 600);
    } else if (direction === 'prev' && currentPageIndex > 0) {
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentPageIndex(prev => prev - 2);
            setIsFlipping(false);
        }, 600);
    }
  };

  // Determine what to show
  const isCover = currentPageIndex === 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] py-8 overflow-hidden perspective-2000">
        
        {/* Controls */}
        <div className="flex items-center gap-8 mb-6 z-20">
             <button 
                onClick={() => turnPage('prev')}
                disabled={currentPageIndex === 0 || isFlipping}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center text-white transition-all"
             >
                ←
             </button>
             <span className="text-white/50 text-sm font-mono">
                {isCover ? "Cover" : `Page ${currentPageIndex} - ${currentPageIndex + 1}`}
             </span>
             <button 
                onClick={() => turnPage('next')}
                disabled={currentPageIndex >= pages.length - 1 || isFlipping}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center text-white transition-all"
             >
                →
             </button>
        </div>

        {/* The Book Container */}
        <div className={`relative transition-transform duration-700 preserve-3d ${isCover ? 'w-[350px] md:w-[450px]' : 'w-[95vw] md:w-[900px]'} h-[600px] md:h-[650px]`}>
            
            {/* Render Helper: Center Pivot */}
            <div className={`absolute top-0 left-0 w-full h-full flex transition-all duration-500 ${isCover ? 'justify-center' : 'justify-center'}`}>
                
                {/* LEFT SIDE (Hidden if Cover) */}
                {!isCover && (
                    <div className="w-1/2 h-full bg-white rounded-l-lg shadow-2xl origin-right transform-style-3d relative z-0 overflow-hidden border-r border-gray-300">
                         {/* Render Previous Page or Current Left Page */}
                         {pages[currentPageIndex - 1] || <div className="bg-white w-full h-full"/>}
                         
                         {/* Shadow Gradient near spine */}
                         <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none"></div>
                    </div>
                )}

                {/* RIGHT SIDE (The Cover, or Right Page) */}
                <div className={`h-full bg-white shadow-2xl origin-left transform-style-3d relative z-10 overflow-hidden ${isCover ? 'w-full rounded-r-lg rounded-l-lg' : 'w-1/2 rounded-r-lg'}`}>
                     {/* Animation Layer for Page Turn */}
                     {isFlipping ? (
                        <div className="absolute inset-0 z-50 bg-[#fdfbf7] animate-page-flip origin-left shadow-2xl">
                            <div className="w-full h-full bg-black/5"></div>
                        </div>
                     ) : null}

                     {/* Content */}
                     {pages[currentPageIndex]}

                     {/* Spine Shadow */}
                     {!isCover && (
                        <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
                     )}
                </div>

            </div>
        </div>
    </div>
  );
};

export default Book;
