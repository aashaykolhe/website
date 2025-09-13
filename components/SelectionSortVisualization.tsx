import React, { useState, useEffect, useCallback, useRef } from 'react';

const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

const INITIAL_ARRAY_SIZE = 12;
const ANIMATION_SPEED_MS = 100;

export const SelectionSortVisualization: React.FC = () => {
  const [array, setArray] = useState<number[]>(() => generateRandomArray(INITIAL_ARRAY_SIZE));
  const [isSorting, setIsSorting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [comparingIndex, setComparingIndex] = useState<number | null>(null);
  const [minIndex, setMinIndex] = useState<number | null>(null);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  
  const isSortingRef = useRef(isSorting);
  isSortingRef.current = isSorting;

  const resetArray = useCallback(() => {
    setIsSorting(false);
    isSortingRef.current = false;
    setArray(generateRandomArray(INITIAL_ARRAY_SIZE));
    setCurrentIndex(null);
    setComparingIndex(null);
    setMinIndex(null);
    setSortedIndices([]);
  }, []);

  const selectionSort = useCallback(async () => {
    if (isSorting) return;
    setIsSorting(true);
    isSortingRef.current = true;

    let localArray = [...array];
    let n = localArray.length;
    let newSortedIndices: number[] = [];

    for (let i = 0; i < n - 1; i++) {
        if (!isSortingRef.current) return;
        setCurrentIndex(i);
        let minIdx = i;
        setMinIndex(minIdx);
        
        for (let j = i + 1; j < n; j++) {
            if (!isSortingRef.current) return;
            setComparingIndex(j);
            await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));
            
            if (localArray[j] < localArray[minIdx]) {
                minIdx = j;
                setMinIndex(minIdx);
            }
        }

        [localArray[i], localArray[minIdx]] = [localArray[minIdx], localArray[i]];
        setArray([...localArray]);
        
        newSortedIndices.push(i);
        setSortedIndices([...newSortedIndices]);
        
        setComparingIndex(null);
        setMinIndex(null);
        await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS * 2));
    }
    
    // Mark all as sorted
    setSortedIndices(Array.from({length: n}, (_, i) => i));
    setCurrentIndex(null);
    setIsSorting(false);
    isSortingRef.current = false;
  }, [array, isSorting]);
  
  useEffect(() => {
    return () => {
      isSortingRef.current = false;
    };
  }, []);

  const getBarColor = (index: number) => {
    if (sortedIndices.includes(index)) return 'bg-green-500';
    if (index === minIndex) return 'bg-yellow-500';
    if (index === currentIndex || index === comparingIndex) return 'bg-red-500';
    return 'bg-accent';
  };

  return (
    <div className="flex flex-col h-full w-full justify-between items-center">
      <div className="flex-grow flex items-end justify-center gap-1 w-full">
        {array.map((value, index) => (
          <div
            key={index}
            className={`w-full rounded-t-sm transition-all duration-200 ease-in-out ${getBarColor(index)}`}
            style={{ height: `${value}%` }}
            title={`${value}`}
          ></div>
        ))}
      </div>
      <div className="flex gap-4 pt-4">
        <button
          onClick={resetArray}
          disabled={isSorting}
          className="px-4 py-2 bg-secondary rounded-md text-text-primary hover:bg-secondary/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Reset
        </button>
        <button
          onClick={selectionSort}
          disabled={isSorting}
          className="px-4 py-2 bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSorting ? 'Sorting...' : 'Start Sort'}
        </button>
      </div>
    </div>
  );
};
