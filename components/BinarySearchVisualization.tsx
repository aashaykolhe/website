import React, { useState, useCallback, useRef } from 'react';

const SORTED_ARRAY = Array.from({ length: 15 }, (_, i) => (i + 1) * 3);

export const BinarySearchVisualization: React.FC = () => {
  const [target, setTarget] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [low, setLow] = useState<number | null>(null);
  const [high, setHigh] = useState<number | null>(null);
  const [mid, setMid] = useState<number | null>(null);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const [message, setMessage] = useState('Enter a number to search for.');

  const isSearchingRef = useRef(isSearching);
  isSearchingRef.current = isSearching;

  const reset = useCallback(() => {
    setIsSearching(false);
    isSearchingRef.current = false;
    setLow(null);
    setHigh(null);
    setMid(null);
    setFoundIndex(null);
    setMessage('Enter a number to search for.');
  }, []);

  const binarySearch = useCallback(async () => {
    const numTarget = parseInt(target, 10);
    if (isNaN(numTarget)) {
      setMessage('Please enter a valid number.');
      return;
    }
    reset();
    setIsSearching(true);
    isSearchingRef.current = true;
    setMessage(`Searching for ${numTarget}...`);

    let l = 0;
    let h = SORTED_ARRAY.length - 1;
    setLow(l);
    setHigh(h);
    
    await new Promise(r => setTimeout(r, 500));

    while (l <= h) {
        if (!isSearchingRef.current) return;
        let m = Math.floor(l + (h - l) / 2);
        setMid(m);
        await new Promise(r => setTimeout(r, 1000));

        if (SORTED_ARRAY[m] === numTarget) {
            setFoundIndex(m);
            setMessage(`Found ${numTarget} at index ${m}.`);
            setIsSearching(false);
            isSearchingRef.current = false;
            return;
        }

        if (SORTED_ARRAY[m] < numTarget) {
            l = m + 1;
            setLow(l);
        } else {
            h = m - 1;
            setHigh(h);
        }
        await new Promise(r => setTimeout(r, 1000));
    }

    setMessage(`${numTarget} not found in the array.`);
    setIsSearching(false);
    isSearchingRef.current = false;
  }, [target, reset]);

  const getCellColor = (index: number) => {
    if (index === foundIndex) return 'bg-green-500';
    if (index === mid) return 'bg-yellow-500';
    if (index === low || index === high) return 'bg-red-500';
    if (low !== null && high !== null && (index < low || index > high)) return 'bg-secondary/50';
    return 'bg-secondary';
  };
  
  const getTextColor = (index: number) => {
    if (index === foundIndex || index === mid || index === low || index === high) return 'text-primary';
    if (low !== null && high !== null && (index < low || index > high)) return 'text-text-secondary/50';
    return 'text-text-primary';
  }

  return (
    <div className="flex flex-col h-full w-full justify-between items-center p-4">
      <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-15 gap-2 w-full">
        {SORTED_ARRAY.map((value, index) => (
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
        <button onClick={binarySearch} disabled={isSearching || !target} className="px-4 py-2 bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        <button onClick={reset} className="px-4 py-2 bg-secondary rounded-md text-text-primary hover:bg-secondary/70 transition-colors">
          Reset
        </button>
      </div>
    </div>
  );
};
