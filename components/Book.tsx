
import React, { useState, useMemo } from 'react';
import { CardData, Department, UserState, GlobalAssets } from '../types';
import Card from './Card';

interface BookProps {
  roster: CardData[];
  user: UserState;
  globalAssets: GlobalAssets;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

const CARDS_PER_PAGE = 8;
const DEFAULT_COVER = "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1000&auto=format&fit=crop"; 
// A fallback colored logo (Red) for paper background if the main one is white. 
// If the user uploads a logo via Admin, that one is used.
const DEFAULT_PAGE_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMTIwIj4KICA8ZyBmaWxsPSIjY2UwZTJkIiBmb250LWZhbWlseT0iJ0FyaWFsIEJsYWNrJywgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjkwMCI+CiAgICA8dGV4dCB4PSIxMCIgeT0iOTAiIGZvbnQtc2l6ZT0iMTAwIiBsZXR0ZXItc3BhY2luZz0iLTUiPkxJQ088L3RleHQ+CiAgICA8dGV4dCB4PSIyNjUiIHk9IjkwIiBmb250LXNpemU9IjEwMCI+bjwvdGV4dD4KICAgIDx0ZXh0IHg9IjMzNSIgeT0iNDAiIGZvbnQtc2l6ZT0iMjQiPsKuPC90ZXh0PgogIDwvZz4KPC9zdmc+";

// Map department to text/border colors for UI consistency (LICON Corporate)
const deptUIColors = {
  [Department.DIRECTION]: { text: 'text-slate-900', border: 'border-slate-900', bg: 'bg-slate-900', lightBg: 'bg-slate-100' },
  [Department.SALES]:     { text: 'text-emerald-600', border: 'border-emerald-600', bg: 'bg-emerald-600', lightBg: 'bg-emerald-50' },
  [Department.MARKETING]: { text: 'text-rose-600', border: 'border-rose-600', bg: 'bg-rose-600', lightBg: 'bg-rose-50' },
  [Department.HR]:        { text: 'text-blue-600', border: 'border-blue-600', bg: 'bg-blue-600', lightBg: 'bg-blue-50' },
  [Department.FINANCE]:   { text: 'text-amber-600', border: 'border-amber-500', bg: 'bg-amber-500', lightBg: 'bg-amber-50' },
  [Department.OPERATIONS]:{ text: 'text-orange-600', border: 'border-orange-600', bg: 'bg-orange-600', lightBg: 'bg-orange-50' },
  [Department.IT]:        { text: 'text-cyan-600', border: 'border-cyan-600', bg: 'bg-cyan-600', lightBg: 'bg-cyan-50' },
  [Department.LOGISTICS]: { text: 'text-stone-600', border: 'border-stone-500', bg: 'bg-stone-500', lightBg: 'bg-stone-50' },
};

const Book: React.FC<BookProps> = ({ roster, user, globalAssets }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [hoveredCorner, setHoveredCorner] = useState<string | null>(null);

  const coverImage = globalAssets.coverUrl || DEFAULT_COVER;
  // Use uploaded logo or fallback to the red one for paper pages
  const pageLogo = globalAssets.logoUrl || DEFAULT_PAGE_LOGO;

  const { pages, bookmarks, pageInfo } = useMemo(() => {
    const generatedPages: React.ReactNode[] = [];
    const sectionBookmarks: { label: string; pageIndex: number; dept: Department }[] = [];
    const pageToDeptMap: Record<number, Department> = {};

    // 0. Cover
    generatedPages.push(
      <div key="cover" className="w-full h-full flex flex-col items-center justify-end bg-white border-r-2 border-gray-300 relative overflow-hidden group cursor-pointer shadow-inner">
        {/* Background Image with Parallax/Zoom Effect */}
        <div className="absolute inset-0 z-0 bg-brand-dark overflow-hidden">
             <img 
                src={coverImage} 
                alt="LICON Legends Cover" 
                className="w-full h-full object-cover object-center transition-transform duration-[3000ms] ease-out group-hover:scale-110 group-hover:rotate-1"
             />
             <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-700"></div>
        </div>

        {/* Light Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent z-10 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
        
        {/* Footer Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

        {/* Text */}
        <div className="relative z-20 mb-12 text-center w-full px-4 transition-all duration-500 group-hover:-translate-y-2">
             <h2 className="text-sm md:text-base text-gray-600 font-bold tracking-[0.3em] uppercase mb-3 group-hover:text-brand-accent transition-colors">Colección Oficial 2026</h2>
             
             <div className="relative inline-block">
                <div className="text-4xl md:text-6xl font-legends text-black uppercase tracking-widest drop-shadow-sm transform transition-all duration-500 group-hover:scale-105 break-words leading-none">
                    {user.name}
                </div>
                <div className="absolute inset-0 blur-xl bg-gold/0 group-hover:bg-gold/30 transition-all duration-700 rounded-full"></div>
             </div>
        </div>
      </div>
    );
    
    let pageCounter = 1; 

    // Ensure order matches enum
    const depts = [
      Department.DIRECTION, Department.SALES, Department.MARKETING, 
      Department.HR, Department.FINANCE, Department.OPERATIONS, 
      Department.IT, Department.LOGISTICS
    ];

    depts.forEach((dept) => {
      const styles = deptUIColors[dept];

      sectionBookmarks.push({
        label: dept,
        pageIndex: pageCounter,
        dept: dept
      });

      const deptCards = roster.filter(c => c.department === dept).sort((a, b) => a.id - b.id);
      const chunks = chunkArray(deptCards, CARDS_PER_PAGE);

      chunks.forEach((chunk: CardData[], chunkIdx: number) => {
        // Map this page index to the current department for the scrubber
        pageToDeptMap[pageCounter] = dept;

        // Is Left Page? (Odd numbers in our 1-based counter, e.g., 1, 3, 5)
        // Book Array Index: 0=Cover, 1=Page1(Left), 2=Page2(Right)
        // So in the `pages` array, Odd indices are Left, Even are Right.
        const isLeftPage = pageCounter % 2 !== 0;

        generatedPages.push(
          <div key={`${dept}-${chunkIdx}`} className="w-full h-full bg-[#fdfbf7] flex flex-col relative shadow-[inset_0_0_40px_rgba(0,0,0,0.03)] border-r border-black/5 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 z-0"></div>
            
            {/* Header Area (Fixed Height) */}
            <div className="relative z-10 h-20 shrink-0 px-6 pt-6 flex items-start justify-between">
                {isLeftPage ? (
                    <>
                        {/* LEFT PAGE HEADER: Logo (TL) - Section (TR) */}
                        <img src={pageLogo} alt="Licon" className="h-8 object-contain opacity-80" />
                        <h3 className={`font-header text-xl font-bold uppercase tracking-wide text-right ${styles.text} border-b-2 ${styles.border}`}>{dept}</h3>
                    </>
                ) : (
                    <>
                        {/* RIGHT PAGE HEADER: Section (TL) */}
                        <h3 className={`font-header text-xl font-bold uppercase tracking-wide text-left ${styles.text} border-b-2 ${styles.border}`}>{dept}</h3>
                        <div className="w-8"></div> {/* Spacer */}
                    </>
                )}
            </div>

            {/* Content Area (Scrollable) */}
            <div className="relative z-10 flex-1 overflow-y-auto min-h-0 px-6 md:px-10 pb-4 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 xl:gap-5 content-start">
                    {chunk.map((card: CardData) => (
                        <div key={card.id} className="transform transition-transform hover:scale-105 hover:z-20">
                            <Card 
                                data={card} 
                                isOwned={user.collection.includes(card.id)} 
                                count={user.duplicates[card.id] ? user.duplicates[card.id] + 1 : 1}
                                showCount={true}
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Footer Area (Fixed Height) */}
            <div className="relative z-10 h-14 shrink-0 px-6 pb-4 flex items-end justify-between text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                {isLeftPage ? (
                     <>
                        {/* LEFT PAGE FOOTER: Logo (BL) - Page Num (Center) */}
                        <img src={pageLogo} alt="Licon" className="h-6 object-contain opacity-60 grayscale hover:grayscale-0 transition-all" />
                        <span>- {pageCounter} -</span>
                        <div className="w-6"></div> {/* Spacer */}
                     </>
                ) : (
                     <>
                        {/* RIGHT PAGE FOOTER: Page Num (Center) - Logo (BR) */}
                        <div className="w-6"></div> {/* Spacer */}
                        <span>- {pageCounter} -</span>
                        <img src={pageLogo} alt="Licon" className="h-6 object-contain opacity-60 grayscale hover:grayscale-0 transition-all" />
                     </>
                )}
            </div>
          </div>
        );
        pageCounter++;
      });
    });

    generatedPages.push(
        <div key="back-cover" className="w-full h-full flex flex-col items-center justify-center bg-brand-dark border-l-2 border-white/5 relative">
             <div className="text-white/20 font-header text-8xl font-bold">FIN</div>
             <div className="mt-8 text-white/40 text-sm">LICON Legends &copy; 2026</div>
        </div>
    );

    if (generatedPages.length % 2 !== 0) {
        generatedPages.push(<div key="blank-end" className="w-full h-full bg-white"></div>);
    }

    return { pages: generatedPages, bookmarks: sectionBookmarks, pageInfo: pageToDeptMap };
  }, [roster, user, coverImage, pageLogo]);

  const turnPage = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    
    if (direction === 'next' && currentPageIndex < pages.length - 1) {
        setFlipDirection('next');
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentPageIndex(prev => prev + 2);
            setIsFlipping(false);
            setFlipDirection(null);
            setHoveredCorner(null);
        }, 1200); 
    } else if (direction === 'prev' && currentPageIndex > 0) {
        setFlipDirection('prev');
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentPageIndex(prev => prev - 2);
            setIsFlipping(false);
            setFlipDirection(null);
            setHoveredCorner(null);
        }, 1200);
    }
  };

  const jumpToPage = (index: number) => {
      if (isFlipping) return;
      let targetIndex = index;
      if (targetIndex % 2 !== 0) {
          targetIndex = targetIndex + 1;
      }
      if (targetIndex >= pages.length) targetIndex = pages.length - 1;
      if (targetIndex === currentPageIndex) return;

      setFlipDirection(targetIndex > currentPageIndex ? 'next' : 'prev');
      setIsFlipping(true);
      setTimeout(() => {
          setCurrentPageIndex(targetIndex);
          setIsFlipping(false);
          setFlipDirection(null);
      }, 1200);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      jumpToPage(val);
  };

  const isCover = currentPageIndex === 0;
  
  // Current visible pages
  const currentLeftPage = pages[currentPageIndex - 1] || <div className="bg-white w-full h-full"/>;
  const currentRightPage = pages[currentPageIndex] || <div className="bg-white w-full h-full"/>;

  // Underlay Pages (Preview)
  const nextRightPage = pages[currentPageIndex + 2] || <div className="bg-white w-full h-full flex items-center justify-center text-gray-200"></div>;
  const prevLeftPage = pages[currentPageIndex - 3] || <div className="bg-white w-full h-full flex items-center justify-center text-gray-200"></div>;

  // Animation Pages
  const animNextFront = currentRightPage;
  const animNextBack = pages[currentPageIndex + 1] || <div className="bg-white w-full h-full"/>;
  const animPrevFront = pages[currentPageIndex - 1] || <div className="bg-white w-full h-full"/>; 
  const animPrevBack = pages[currentPageIndex - 2] || <div className="bg-white w-full h-full"/>;

  // Display info
  const displayPage = currentPageIndex === 0 ? 0 : Math.ceil(currentPageIndex / 2) * 2 - 1; 
  const currentDept = pageInfo[currentPageIndex] || pageInfo[currentPageIndex - 1]; 
  const currentDeptColor = currentDept ? deptUIColors[currentDept].text : 'text-gray-400';
  const currentDeptLabel = currentDept || (isCover ? 'PORTADA' : 'FINAL');

  const CornerClickArea = ({ position, onClick, onHover, onLeave }: { position: string, onClick: () => void, onHover: () => void, onLeave: () => void }) => (
      <div 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        className={`absolute w-32 h-32 z-50 cursor-pointer group overflow-hidden ${position}`}
      >
        <div className={`absolute w-full h-full transition-all duration-300 opacity-0 group-hover:opacity-100
            bg-gradient-to-br from-white/40 to-transparent
            ${position.includes('right') ? 'rounded-bl-[4rem]' : 'rounded-br-[4rem]'}
        `}></div>
      </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] py-4 overflow-hidden perspective-2000 relative z-10">
        
        {/* Section Navigation Buttons (Scrollable Row) */}
        <div className="w-full max-w-5xl px-4 mb-2 z-20 overflow-x-auto flex gap-2 pb-2 snap-x scroll-smooth no-scrollbar">
             {bookmarks.map((bm) => (
                 <button
                    key={bm.label}
                    onClick={() => jumpToPage(bm.pageIndex)}
                    className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border transition-all shrink-0 snap-start shadow-md
                        ${deptUIColors[bm.dept].bg} text-white border-white/20 hover:scale-105 hover:brightness-110 active:scale-95
                    `}
                 >
                    {bm.label}
                 </button>
             ))}
        </div>

        {/* Navbar */}
        <div className="flex items-center gap-4 mb-4 z-20 w-full max-w-4xl px-4 bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 shadow-lg">
             <button 
                onClick={() => jumpToPage(0)}
                className="px-4 py-2 bg-brand-purple hover:bg-brand-accent rounded-full text-xs font-bold uppercase text-white border border-white/10 transition-colors shadow-lg"
             >
                PORTADA
             </button>

             <div className="flex-1 flex flex-col justify-center px-4 relative">
                <div className="flex justify-between items-end mb-1 px-1">
                    <span className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${currentDeptColor}`}>
                        {currentDeptLabel}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                        PÁGINA {currentPageIndex > 0 ? currentPageIndex : '0'} / {pages.length - 1}
                    </span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max={pages.length - 1} 
                    value={currentPageIndex} 
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-accent hover:accent-red-400 transition-all"
                />
             </div>

             <div className="flex gap-2">
                <button 
                    onClick={() => turnPage('prev')}
                    disabled={currentPageIndex === 0 || isFlipping}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center text-white transition-all border border-white/10"
                >
                    ←
                </button>
                <button 
                    onClick={() => turnPage('next')}
                    disabled={currentPageIndex >= pages.length - 1 || isFlipping}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center text-white transition-all border border-white/10"
                >
                    →
                </button>
             </div>
        </div>

        {/* Book Container */}
        <div className={`relative transition-all duration-700 preserve-3d ${isCover ? 'w-[350px] md:w-[500px]' : 'w-[95vw]'} h-[650px] md:h-[80vh] max-h-[900px]`}>
            <div className={`absolute top-0 left-0 w-full h-full flex justify-center`}>
                
                {/* === LEFT STACK === */}
                {!isCover && (
                    <div className="w-1/2 h-full relative">
                        {/* UNDERLAY (What you see when peeling/flipping) */}
                        <div className="absolute inset-0 bg-white rounded-l-xl border-r border-gray-300 overflow-hidden z-0">
                             {prevLeftPage}
                        </div>

                        {/* ACTIVE PAGE (Top) */}
                        <div className={`absolute inset-0 bg-white rounded-l-xl border-r border-gray-300 shadow-xl overflow-hidden origin-right transform-style-3d transition-transform duration-300
                            ${hoveredCorner?.includes('left') ? 'peel-corner-tl' : ''}
                            ${isFlipping && flipDirection === 'prev' ? 'hidden' : 'z-10'}
                        `}>
                             {!isFlipping && (
                                <>
                                    <CornerClickArea position="top-0 left-0" onClick={() => turnPage('prev')} onHover={() => setHoveredCorner('top-left')} onLeave={() => setHoveredCorner(null)} />
                                    <CornerClickArea position="bottom-0 left-0" onClick={() => turnPage('prev')} onHover={() => setHoveredCorner('bottom-left')} onLeave={() => setHoveredCorner(null)} />
                                </>
                             )}
                             {currentLeftPage}
                             <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-black/5 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                )}

                {/* === RIGHT STACK === */}
                <div className={`${isCover ? 'w-full' : 'w-1/2'} h-full relative`}>
                     {/* UNDERLAY (Next Page Preview) */}
                     {!isCover && (
                        <div className="absolute inset-0 bg-white rounded-r-xl overflow-hidden z-0">
                             {nextRightPage}
                        </div>
                     )}

                     {/* ACTIVE PAGE (Top) */}
                     <div className={`absolute inset-0 bg-white shadow-xl overflow-hidden origin-left transform-style-3d transition-transform duration-300
                        ${isCover ? 'rounded-xl' : 'rounded-r-xl'}
                        ${hoveredCorner?.includes('right') && !isCover ? 'peel-corner-tr' : ''}
                        ${isFlipping && flipDirection === 'next' ? 'hidden' : 'z-10'}
                     `}>
                        {!isFlipping && currentPageIndex < pages.length - 1 && (
                            <>
                                <CornerClickArea position="top-0 right-0" onClick={() => turnPage('next')} onHover={() => setHoveredCorner('top-right')} onLeave={() => setHoveredCorner(null)} />
                                <CornerClickArea position="bottom-0 right-0" onClick={() => turnPage('next')} onHover={() => setHoveredCorner('bottom-right')} onLeave={() => setHoveredCorner(null)} />
                            </>
                        )}
                        
                        {currentRightPage}

                        {!isCover && (
                             <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-black/5 to-transparent pointer-events-none"></div>
                        )}
                     </div>
                </div>

                {/* === ANIMATION LAYER === */}
                
                {/* NEXT ANIMATION (Right flips to Left) */}
                {isFlipping && flipDirection === 'next' && (
                    <div className="absolute top-0 right-0 w-1/2 h-full origin-left z-50 animate-page-flip-next transform-style-3d">
                        {/* Front Face (Current Right) */}
                        <div className="absolute inset-0 backface-hidden bg-white rounded-r-xl overflow-hidden shadow-md">
                             {animNextFront}
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 pointer-events-none"></div>
                        </div>
                        {/* Back Face (Next Left) */}
                        <div className="absolute inset-0 rotate-y-180 backface-hidden bg-white rounded-l-xl overflow-hidden shadow-md border-r border-gray-300">
                             {animNextBack}
                             <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10 pointer-events-none"></div>
                        </div>
                    </div>
                )}

                {/* PREV ANIMATION (Left flips to Right) */}
                {isFlipping && flipDirection === 'prev' && (
                    <div className="absolute top-0 left-0 w-1/2 h-full origin-right z-50 animate-page-flip-prev transform-style-3d">
                        {/* Front Face (Current Left) */}
                        <div className="absolute inset-0 rotate-y-180 backface-hidden bg-white rounded-r-xl overflow-hidden shadow-md">
                             {animPrevBack} 
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 pointer-events-none"></div>
                        </div>
                        {/* Back Face (Prev Right) */}
                        <div className="absolute inset-0 backface-hidden bg-white rounded-l-xl overflow-hidden shadow-md border-r border-gray-300">
                             {animPrevFront}
                             <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10 pointer-events-none"></div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
};

export default Book;
