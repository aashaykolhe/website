import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VisualizationControls } from './VisualizationControls';

const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

type QuickSortState = {
  array?: number[];
  pivotIndex?: number | null;
  partitionIndex?: number | null;
  comparingIndex?: number | null;
  sorted?: number[];
  status?: 'sorted';
};

function* partition(arr: number[], low: number, high: number): Generator<QuickSortState, number, void> {
    const pivot = arr[high];
    yield { pivotIndex: high };
    let i = low - 1;

    for (let j = low; j < high; j++) {
      yield { comparingIndex: j };
      if (arr[j] < pivot) {
        i++;
        yield { partitionIndex: i };
        [arr[i], arr[j]] = [arr[j], arr[i]];
        yield { array: [...arr] };
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    yield { array: [...arr], pivotIndex: null, comparingIndex: null, partitionIndex: null };
    return i + 1;
}

// FIX: Refactor quickSortHelper to remove the complex `onSort` callback and `this.yield` hack.
function* quickSortHelper(arr: number[], low: number, high: number): Generator<QuickSortState, void, void> {
    if (low < high) {
      const pi = yield* partition(arr, low, high);
      yield { sorted: [pi] };
      yield* quickSortHelper(arr, low, pi - 1);
      yield* quickSortHelper(arr, pi + 1, high);
    } else if (low >= 0 && low === high) {
        yield { sorted: [low] };
    }
}

// FIX: Refactor quickSortGenerator to use the simplified helper.
function* quickSortGenerator(arr: number[]): Generator<QuickSortState, void, void> {
    let localArray = [...arr];
    yield* quickSortHelper(localArray, 0, localArray.length - 1);
    
    // Explicitly yield the final sorted array to ensure UI updates
    yield { sorted: Array.from({length: arr.length}, (_, i) => i), status: 'sorted' };
}

export const QuickSortVisualization: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState(12);
  const [speed, setSpeed] = useState(50);
  const [status, setStatus] = useState<'idle' | 'sorting' | 'paused' | 'sorted'>('idle');

  const [pivotIndex, setPivotIndex] = useState<number | null>(null);
  const [partitionIndex, setPartitionIndex] = useState<number | null>(null);
  const [comparingIndex, setComparingIndex] = useState<number | null>(null);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);

  const generatorRef = useRef<Generator<QuickSortState, void, void> | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const resetArray = useCallback((size: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('idle');
    setArray(generateRandomArray(size));
    setPivotIndex(null);
    setPartitionIndex(null);
    setComparingIndex(null);
    setSortedIndices([]);
    generatorRef.current = null;
  }, []);

  useEffect(() => {
    resetArray(arraySize);
  }, [arraySize, resetArray]);

  // FIX: Update stepForward to handle the new generator logic and to fix property access errors.
  const stepForward = useCallback(() => {
    if (!generatorRef.current) return;
    const { done, value } = generatorRef.current.next();
    if (done || !value) {
      setStatus('sorted');
      setSortedIndices(Array.from({length: array.length}, (_, i) => i));
      return;
    }
    const { array: newArray, pivotIndex: pi, partitionIndex: pti, comparingIndex: ci, sorted: s, status: newStatus } = value;
    if (newArray) setArray(newArray);
    if (pi !== undefined) setPivotIndex(pi);
    if (pti !== undefined) setPartitionIndex(pti);
    if (ci !== undefined) setComparingIndex(ci);
    if (newStatus === 'sorted') {
        setStatus('sorted');
        if (s) setSortedIndices(s);
    } else if (s) {
        setSortedIndices(prev => [...prev, ...s.filter(i => !prev.includes(i))]);
    }
  }, [array.length]);
  
  useEffect(() => {
    if (status === 'sorting') {
      const delay = 350 - speed * 3;
      timeoutRef.current = window.setTimeout(stepForward, delay);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [status, speed, stepForward]);

  // FIX: Simplify handler to remove generator hacking.
  const handlePlayPause = () => {
    if (status === 'sorted') return;
    if (status === 'sorting') setStatus('paused');
    else {
      if (status === 'idle') {
        generatorRef.current = quickSortGenerator(array);
      }
      setStatus('sorting');
    }
  };

  // FIX: Simplify handler to remove generator hacking.
  const handleStep = () => {
    if (status === 'sorted') return;
    if (status === 'idle') {
        generatorRef.current = quickSortGenerator(array);
        setStatus('paused');
    }
    stepForward();
  };
  
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
      <VisualizationControls
        status={status}
        onPlayPause={handlePlayPause}
        onStep={handleStep}
        onReset={() => resetArray(arraySize)}
        arraySize={arraySize}
        onArraySizeChange={setArraySize}
        maxSize={30}
        speed={speed}
        onSpeedChange={setSpeed}
      />
    </div>
  );
};
