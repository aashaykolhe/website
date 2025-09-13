import React, { useState, useEffect, useCallback, useRef } from 'react';

const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

const INITIAL_ARRAY_SIZE = 12;
const ANIMATION_SPEED_MS = 150;

export const MergeSortVisualization: React.FC = () => {
  const [array, setArray] = useState<number[]>(() => generateRandomArray(INITIAL_ARRAY_SIZE));
  const [isSorting, setIsSorting] = useState(false);
  const [activeRange, setActiveRange] = useState<[number, number] | null>(null);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);

  const isSortingRef = useRef(isSorting);
  isSortingRef.current = isSorting;

  const resetArray = useCallback(() => {
    setIsSorting(false);
    isSortingRef.current = false;
    setArray(generateRandomArray(INITIAL_ARRAY_SIZE));
    setActiveRange(null);
    setSortedIndices([]);
  }, []);

  const mergeSort = useCallback(async () => {
    if (isSorting) return;
    setIsSorting(true);
    isSortingRef.current = true;
    
    const localArray = [...array];
    await mergeSortHelper(localArray, 0, localArray.length - 1);

    if (isSortingRef.current) {
        setSortedIndices(Array.from({length: array.length}, (_, i) => i));
    }
    
    setActiveRange(null);
    setIsSorting(false);
    isSortingRef.current = false;
  }, [array, isSorting]);

  async function mergeSortHelper(arr: number[], l: number, r: number) {
    if (l >= r || !isSortingRef.current) {
      return;
    }
    const m = Math.floor(l + (r - l) / 2);
    await mergeSortHelper(arr, l, m);
    await mergeSortHelper(arr, m + 1, r);
    await merge(arr, l, m, r);
  }

  async function merge(arr: number[], l: number, m: number, r: number) {
    if (!isSortingRef.current) return;
    setActiveRange([l, r]);
    await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));

    const n1 = m - l + 1;
    const n2 = r - m;
    let L = new Array(n1);
    let R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = arr[l + i];
    for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
      if (!isSortingRef.current) return;
      if (L[i] <= R[j]) {
        arr[k] = L[i];
        i++;
      } else {
        arr[k] = R[j];
        j++;
      }
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));
      k++;
    }

    while (i < n1) {
      if (!isSortingRef.current) return;
      arr[k] = L[i];
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));
      i++;
      k++;
    }
    while (j < n2) {
      if (!isSortingRef.current) return;
      arr[k] = R[j];
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));
      j++;
      k++;
    }
  }

  useEffect(() => {
    return () => { isSortingRef.current = false; };
  }, []);

  const getBarColor = (index: number) => {
    if (sortedIndices.includes(index)) return 'bg-green-500';
    if (activeRange && index >= activeRange[0] && index <= activeRange[1]) {
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
        <button onClick={resetArray} disabled={isSorting} className="px-4 py-2 bg-secondary rounded-md text-text-primary hover:bg-secondary/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Reset</button>
        <button onClick={mergeSort} disabled={isSorting} className="px-4 py-2 bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{isSorting ? 'Sorting...' : 'Start Sort'}</button>
      </div>
    </div>
  );
};
