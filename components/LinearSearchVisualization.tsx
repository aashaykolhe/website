import React, { useState, useCallback, useRef } from 'react';

const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};
const INITIAL_ARRAY = generateRandomArray(15);


export const LinearSearchVisualization: React.FC = () => {
  const [target, setTarget] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const [message, setMessage] = useState('Enter a number to search for.');

  const isSearchingRef = useRef(isSearching);
  isSearchingRef.current = isSearching;

  const reset = useCallback(() => {
    setIsSearching(false);
    isSearchingRef.current = false;
    setCurrentIndex(null);
    setFoundIndex(null);
    setMessage('Enter a number to search for.');
  }, []);

  const linearSearch = useCallback(async () => {
    const numTarget = parseInt(target, 10);
    if (isNaN(numTarget)) {
      setMessage('Please enter a valid number.');
      return;
    }
    reset();
    setIsSearching(true);
    isSearchingRef.current = true;
    setMessage(`Searching for ${numTarget}...`);
    
    for (let i = 0; i < INITIAL_ARRAY.length; i++) {
        if (!isSearchingRef.current) return;
        setCurrentIndex(i);
        await new Promise(r => setTimeout(r, 150));
        if (INITIAL_ARRAY[i] === numTarget) {
            setFoundIndex(i);
            setMessage(`Found ${numTarget} at index ${i}.`);
            setIsSearching(false);
            isSearchingRef.current = false;
            return;
        }
    }

    setMessage(`${numTarget} not found in the array.`);
    setCurrentIndex(null);
    setIsSearching(false);
    isSearchingRef.current = false;
  }, [target, reset]);

  const getCellColor = (index: number) => {
    if (index === foundIndex) return 'bg-green-500';
    if (index === currentIndex) return 'bg-red-500';
    return 'bg-secondary';
  };
  
  const getTextColor = (index: number) => {
    if (index === foundIndex || index === currentIndex) return 'text-primary';
    return 'text-text-primary';
  }

  return (
    <div className="flex flex-col h-full w-full justify-between items-center p-4">
      <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-15 gap-2 w-full">
        {INITIAL_ARRAY.map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-10 h-10 flex items-center justify-center rounded transition-colors duration-300 ${getCellColor(index)} ${getTextColor(index)}`}>
              {value}
            </div>
            <div className="text-xs mt-1 text-text-secondary">{index}</div>
          </div>
        ))}
      </div>
      <div className="text-center text-text-primary mt-4 h-6">{message}</div>
      <div className="flex gap-4 pt-4">
        <input 
          type="number"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="e.g., 27"
          disabled={isSearching}
          className="w-24 px-2 py-1 bg-secondary border border-primary rounded-md text-text-primary focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <button onClick={linearSearch} disabled={isSearching || !target} className="px-4 py-2 bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        <button onClick={reset} className="px-4 py-2 bg-secondary rounded-md text-text-primary hover:bg-secondary/70 transition-colors">
          Reset
        </button>
      </div>
    </div>
  );
};
