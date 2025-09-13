import React, { useState, useEffect, useCallback, useRef } from 'react';

const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

const INITIAL_ARRAY_SIZE = 12;
const ANIMATION_SPEED_MS = 150;

export const HeapSortVisualization: React.FC = () => {
  const [array, setArray] = useState<number[]>(() => generateRandomArray(INITIAL_ARRAY_SIZE));
  const [isSorting, setIsSorting] = useState(false);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);

  const isSortingRef = useRef(isSorting);
  isSortingRef.current = isSorting;

  const resetArray = useCallback(() => {
    setIsSorting(false);
    isSortingRef.current = false;
    setArray(generateRandomArray(INITIAL_ARRAY_SIZE));
    setActiveIndices([]);
    setSortedIndices([]);
  }, []);

  const heapSort = useCallback(async () => {
    if (isSorting) return;
    setIsSorting(true);
    isSortingRef.current = true;
    setSortedIndices([]);
    
    let arr = [...array];
    let n = arr.length;

    // Build heap (rearrange array)
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      if (!isSortingRef.current) return;
      await heapify(arr, n, i);
    }

    // One by one extract an element from heap
    for (let i = n - 1; i > 0; i--) {
      if (!isSortingRef.current) return;
      setActiveIndices([0, i]);
      [arr[0], arr[i]] = [arr[i], arr[0]];
      setArray([...arr]);
      setSortedIndices(prev => [...prev, i]);
      await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));
      
      await heapify(arr, i, 0);
    }
    
    if (isSortingRef.current) {
        setSortedIndices(Array.from({length: n}, (_, i) => i));
    }
    setActiveIndices([]);
    setIsSorting(false);
    isSortingRef.current = false;
  }, [array, isSorting]);
  
  async function heapify(arr: number[], n: number, i: number) {
    if (!isSortingRef.current) return;
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;

    setActiveIndices([i, l, r]);

    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));
      await heapify(arr, n, largest);
    }
  }

  useEffect(() => {
    return () => { isSortingRef.current = false; };
  }, []);

  const getBarColor = (index: number) => {
    if (sortedIndices.includes(index)) return 'bg-green-500';
    if (activeIndices.includes(index)) return 'bg-red-500';
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
        <button onClick={resetArray} disabled={isSorting} className="px-4 py-2 bg-secondary rounded-md text-text-primary hover:bg-secondary/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Reset</button>
        <button onClick={heapSort} disabled={isSorting} className="px-4 py-2 bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{isSorting ? 'Sorting...' : 'Start Sort'}</button>
      </div>
    </div>
  );
};
