import React, { useState, useEffect } from 'react';
import { CardData } from '../types';
import Card from './Card';

interface PackOpeningProps {
  newCards: CardData[];
  onClose: () => void;
}

const PackOpening: React.FC<PackOpeningProps> = ({ newCards, onClose }) => {
  const [phase, setPhase] = useState<'idle' | 'shaking' | 'revealing' | 'summary'>('idle');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    // Auto start the shake
    const timer = setTimeout(() => setPhase('shaking'), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'shaking') {
        const timer = setTimeout(() => setPhase('revealing'), 1000);
        return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleNextCard = () => {
    if (currentCardIndex < newCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setPhase('summary');
    }
  };

  if (phase === 'idle' || phase === 'shaking') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
         <div className={`relative w-64 h-80 bg-gradient-to-b from-brand-accent to-brand-dark rounded-xl border-4 border-gold shadow-[0_0_50px_rgba(233,69,96,0.6)] flex items-center justify-center cursor-pointer ${phase === 'shaking' ? 'animate-shake' : ''}`}>
            <div className="text-center">
                <div className="text-6xl mb-4">⚡️</div>
                <h2 className="font-header text-3xl font-bold text-white uppercase tracking-wider">Daily<br/>Pack</h2>
                <p className="text-white/60 text-sm mt-2">Tap to Open</p>
            </div>
         </div>
      </div>
    );
  }

  if (phase === 'revealing') {
      const card = newCards[currentCardIndex];
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95" onClick={handleNextCard}>
            <h2 className="text-white/50 text-xl mb-8 font-header uppercase tracking-widest animate-pulse">
                Card {currentCardIndex + 1} / {newCards.length}
            </h2>
            <div className="w-64 h-auto animate-pop">
                <Card data={card} isOwned={true} count={1} />
            </div>
            <p className="mt-8 text-white/40 text-sm">Tap anywhere to continue</p>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
        <div className="bg-brand-purple border border-white/10 rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-header font-bold text-white mb-2">Pack Opened!</h2>
                <p className="text-gray-400">These cards have been added to your collection.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {newCards.map((card, idx) => (
                    <div key={idx} className="transform hover:scale-105 transition-transform duration-200">
                        <Card data={card} isOwned={true} count={1} showCount={false} />
                    </div>
                ))}
            </div>

            <button 
                onClick={onClose}
                className="w-full py-4 bg-brand-accent hover:bg-red-600 text-white font-bold rounded-lg uppercase tracking-wider transition-colors"
            >
                Add to Album
            </button>
        </div>
    </div>
  );
};

export default PackOpening;
