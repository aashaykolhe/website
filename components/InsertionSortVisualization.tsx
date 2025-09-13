import React, { useState, useEffect, useCallback, useRef } from 'react';

const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

const INITIAL_ARRAY_SIZE = 12;
const ANIMATION_SPEED_MS = 100;

export const InsertionSortVisualization: React.FC = () => {
  const [array, setArray] = useState<number[]>(() => generateRandomArray(INITIAL_ARRAY_SIZE));
  const [isSorting, setIsSorting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [comparingIndex, setComparingIndex] = useState<number | null>(null);
  
  const isSortingRef = useRef(isSorting);
  isSortingRef.current = isSorting;

  const resetArray = useCallback(() => {
    setIsSorting(false);
    isSortingRef.current = false;
    setArray(generateRandomArray(INITIAL_ARRAY_SIZE));
    setCurrentIndex(null);
    setComparingIndex(null);
  }, []);

  const insertionSort = useCallback(async () => {
    if (isSorting) return;
    setIsSorting(true);
    isSortingRef.current = true;

    let localArray = [...array];
    let n = localArray.length;

    for (let i = 1; i < n; i++) {
        if (!isSortingRef.current) return;
        let key = localArray[i];
        let j = i - 1;
        setCurrentIndex(i);
        await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));

        while (j >= 0 && localArray[j] > key) {
            if (!isSortingRef.current) return;
            setComparingIndex(j);
            localArray[j + 1] = localArray[j];
            setArray([...localArray]);
            await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));
            j = j - 1;
        }
        localArray[j + 1] = key;
        setArray([...localArray]);
        await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));
    }

    setCurrentIndex(null);
    setComparingIndex(null);
    setIsSorting(false);
    isSortingRef.current = false;
  }, [array, isSorting]);
  
  useEffect(() => {
    return () => {
      isSortingRef.current = false;
    };
  }, []);

  const getBarColor = (index: number) => {
    if (index === currentIndex) return 'bg-yellow-500';
    if (index === comparingIndex) return 'bg-red-500';
    if (!isSorting || (currentIndex !== null && index < currentIndex)) return 'bg-green-500';
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
          onClick={insertionSort}
          disabled={isSorting}
          className="px-4 py-2 bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSorting ? 'Sorting...' : 'Start Sort'}
        </button>
      </div>
    </div>
  );
};
