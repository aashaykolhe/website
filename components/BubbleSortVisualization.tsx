
import React, { useState, useEffect, useCallback, useRef } from 'react';

const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

const INITIAL_ARRAY_SIZE = 12;
const ANIMATION_SPEED_MS = 150;

export const BubbleSortVisualization: React.FC = () => {
  const [array, setArray] = useState<number[]>(() => generateRandomArray(INITIAL_ARRAY_SIZE));
  const [isSorting, setIsSorting] = useState(false);
  const [comparingIndices, setComparingIndices] = useState<[number, number] | null>(null);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  
  // Use a ref to keep track of sorting state across re-renders without causing them
  const isSortingRef = useRef(isSorting);
  isSortingRef.current = isSorting;

  const resetArray = useCallback(() => {
    setIsSorting(false);
    setArray(generateRandomArray(INITIAL_ARRAY_SIZE));
    setComparingIndices(null);
    setSortedIndices([]);
  }, []);

  const bubbleSort = useCallback(async () => {
    if (isSorting) return;
    setIsSorting(true);
    isSortingRef.current = true; // Also update ref immediately

    let localArray = [...array];
    let n = localArray.length;
    let newSortedIndices: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!isSortingRef.current) return; // Check ref to allow immediate stop
        
        setComparingIndices([j, j + 1]);
        await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));

        if (localArray[j] > localArray[j + 1]) {
          [localArray[j], localArray[j + 1]] = [localArray[j + 1], localArray[j]];
          setArray([...localArray]);
          await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));
        }
      }
      newSortedIndices.push(n - 1 - i);
      setSortedIndices([...newSortedIndices]);
    }
    newSortedIndices.push(0); // The last remaining element is also sorted
    setSortedIndices([...newSortedIndices]);
    
    setComparingIndices(null);
    setIsSorting(false);
    isSortingRef.current = false;
  }, [array, isSorting]);
  
  // Effect to stop sorting if component unmounts
  useEffect(() => {
    return () => {
      isSortingRef.current = false;
    };
  }, []);


  const getBarColor = (index: number) => {
    if (sortedIndices.includes(index)) {
      return 'bg-green-500';
    }
    if (comparingIndices && comparingIndices.includes(index)) {
      return 'bg-red-500';
    }
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
          onClick={bubbleSort}
          disabled={isSorting}
          className="px-4 py-2 bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSorting ? 'Sorting...' : 'Start Sort'}
        </button>
      </div>
    </div>
  );
};
