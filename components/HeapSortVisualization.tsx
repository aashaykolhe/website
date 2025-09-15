import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VisualizationControls } from './VisualizationControls';

const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

type HeapSortState = {
  array?: number[];
  activeIndices?: number[];
  sorted?: number[];
  status?: 'sorted';
};

function* heapify(arr: number[], n: number, i: number): Generator<HeapSortState, void, void> {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;

    yield { activeIndices: [i, l, r].filter(idx => idx < n) };

    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      yield { array: [...arr] };
      yield* heapify(arr, n, largest);
    }
}

function* heapSortGenerator(arr: number[]): Generator<HeapSortState, void, void> {
    let localArray = [...arr];
    let n = localArray.length;
    let newSorted: number[] = [];

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      yield* heapify(localArray, n, i);
    }

    for (let i = n - 1; i > 0; i--) {
      yield { activeIndices: [0, i] };
      [localArray[0], localArray[i]] = [localArray[i], localArray[0]];
      newSorted.push(i);
      yield { array: [...localArray], sorted: [...newSorted] };
      
      yield* heapify(localArray, i, 0);
    }
    
    newSorted.push(0);
    yield { sorted: newSorted, activeIndices: [], status: 'sorted' };
}

export const HeapSortVisualization: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState(12);
  const [speed, setSpeed] = useState(50);
  const [status, setStatus] = useState<'idle' | 'sorting' | 'paused' | 'sorted'>('idle');
  
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);

  const generatorRef = useRef<Generator<HeapSortState, void, void> | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const resetArray = useCallback((size: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('idle');
    setArray(generateRandomArray(size));
    setActiveIndices([]);
    setSortedIndices([]);
    generatorRef.current = null;
  }, []);

  useEffect(() => {
    resetArray(arraySize);
  }, [arraySize, resetArray]);

  const stepForward = useCallback(() => {
    if (!generatorRef.current) return;
    // FIX: Destructure done and value from generator result to satisfy TypeScript's control flow analysis.
    const { done, value } = generatorRef.current.next();
    if (done || !value) {
      setStatus('sorted');
      return;
    }
    const { array: newArray, activeIndices: ai, sorted: s, status: newStatus } = value;
    if (newArray) setArray(newArray);
    if (ai !== undefined) setActiveIndices(ai);
    if (s) setSortedIndices(s);
    if (newStatus === 'sorted') setStatus('sorted');
  }, []);

  useEffect(() => {
    if (status === 'sorting') {
      const delay = 350 - speed * 3;
      timeoutRef.current = window.setTimeout(stepForward, delay);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [status, speed, stepForward]);

  const handlePlayPause = () => {
    if (status === 'sorted') return;
    if (status === 'sorting') setStatus('paused');
    else {
      if (status === 'idle') generatorRef.current = heapSortGenerator(array);
      setStatus('sorting');
    }
  };

  const handleStep = () => {
    if (status === 'sorted') return;
    if (status === 'idle') {
      generatorRef.current = heapSortGenerator(array);
      setStatus('paused');
    }
    stepForward();
  };

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
