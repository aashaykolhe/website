import React, { useState, useEffect, useCallback, useRef } from 'react';

const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

const INITIAL_ARRAY_SIZE = 12;
const ANIMATION_SPEED_MS = 200;

export const QuickSortVisualization: React.FC = () => {
  const [array, setArray] = useState<number[]>(() => generateRandomArray(INITIAL_ARRAY_SIZE));
  const [isSorting, setIsSorting] = useState(false);
  const [pivotIndex, setPivotIndex] = useState<number | null>(null);
  const [partitionIndex, setPartitionIndex] = useState<number | null>(null);
  const [comparingIndex, setComparingIndex] = useState<number | null>(null);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);

  const isSortingRef = useRef(isSorting);
  isSortingRef.current = isSorting;

  const resetArray = useCallback(() => {
    setIsSorting(false);
    isSortingRef.current = false;
    setArray(generateRandomArray(INITIAL_ARRAY_SIZE));
    setPivotIndex(null);
    setPartitionIndex(null);
    setComparingIndex(null);
    setSortedIndices([]);
  }, []);

  const quickSort = useCallback(async () => {
    if (isSorting) return;
    setIsSorting(true);
    isSortingRef.current = true;
    
    let localArray = [...array];
    await quickSortHelper(localArray, 0, localArray.length - 1);
    
    if (isSortingRef.current) {
      setSortedIndices(Array.from({ length: array.length }, (_, i) => i));
    }
    
    setPivotIndex(null);
    setPartitionIndex(null);
    setComparingIndex(null);
    setIsSorting(false);
    isSortingRef.current = false;
  }, [array, isSorting]);

  async function partition(arr: number[], low: number, high: number): Promise<number> {
    const pivot = arr[high];
    setPivotIndex(high);
    let i = low - 1;
    setPartitionIndex(i);

    for (let j = low; j < high; j++) {
      if (!isSortingRef.current) return -1;
      setComparingIndex(j);
      await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));
      
      if (arr[j] < pivot) {
        i++;
        setPartitionIndex(i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArray([...arr]);
        await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setArray([...arr]);
    await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED_MS));
    return i + 1;
  }

  async function quickSortHelper(arr: number[], low: number, high: number) {
    if (low < high && isSortingRef.current) {
      const pi = await partition(arr, low, high);
      if (pi === -1) return;

      setSortedIndices(prev => [...prev, pi]);

      await Promise.all([
        quickSortHelper(arr, low, pi - 1),
        quickSortHelper(arr, pi + 1, high)
      ]);
    } else if (low === high) {
        setSortedIndices(prev => [...prev, low]);
    }
  }

  useEffect(() => {
    return () => { isSortingRef.current = false; };
  }, []);

  const getBarColor = (index: number) => {
    if (sortedIndices.includes(index)) return 'bg-green-500';
    if (index === pivotIndex) return 'bg-yellow-500';
    if (index === partitionIndex) return 'bg-purple-500';
    if (index === comparingIndex) return 'bg-red-500';
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
        <button onClick={quickSort} disabled={isSorting} className="px-4 py-2 bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{isSorting ? 'Sorting...' : 'Start Sort'}</button>
      </div>
    </div>
  );
};
