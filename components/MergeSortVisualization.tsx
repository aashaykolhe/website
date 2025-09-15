import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VisualizationControls } from './VisualizationControls';

const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

type MergeSortState = {
  array?: number[];
  activeRange?: [number, number] | null;
  sorted?: boolean;
  status?: 'sorted';
};

function* merge(arr: number[], l: number, m: number, r: number): Generator<MergeSortState, void, void> {
    yield { activeRange: [l, r] };

    const n1 = m - l + 1;
    const n2 = r - m;
    let L = new Array(n1);
    let R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = arr[l + i];
    for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
      if (L[i] <= R[j]) {
        arr[k] = L[i];
        i++;
      } else {
        arr[k] = R[j];
        j++;
      }
      yield { array: [...arr] };
      k++;
    }

    while (i < n1) {
      arr[k] = L[i];
      yield { array: [...arr] };
      i++;
      k++;
    }
    while (j < n2) {
      arr[k] = R[j];
      yield { array: [...arr] };
      j++;
      k++;
    }
}

function* mergeSortHelper(arr: number[], l: number, r: number): Generator<MergeSortState, void, void> {
    if (l >= r) {
      return;
    }
    const m = Math.floor(l + (r - l) / 2);
    yield* mergeSortHelper(arr, l, m);
    yield* mergeSortHelper(arr, m + 1, r);
    yield* merge(arr, l, m, r);
}

function* mergeSortGenerator(arr: number[]): Generator<MergeSortState, void, void> {
    let localArray = [...arr];
    yield* mergeSortHelper(localArray, 0, localArray.length - 1);
    yield { sorted: true, activeRange: null, status: 'sorted' };
}

export const MergeSortVisualization: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState(12);
  const [speed, setSpeed] = useState(50);
  const [status, setStatus] = useState<'idle' | 'sorting' | 'paused' | 'sorted'>('idle');

  const [activeRange, setActiveRange] = useState<[number, number] | null>(null);
  const [isSorted, setIsSorted] = useState(false);

  const generatorRef = useRef<Generator<MergeSortState, void, void> | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const resetArray = useCallback((size: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('idle');
    setArray(generateRandomArray(size));
    setActiveRange(null);
    setIsSorted(false);
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
    const { array: newArray, activeRange: ar, sorted: s, status: newStatus } = value;
    if (newArray) setArray(newArray);
    if (ar !== undefined) setActiveRange(ar);
    if (s) setIsSorted(true);
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
      if (status === 'idle') generatorRef.current = mergeSortGenerator(array);
      setStatus('sorting');
    }
  };

  const handleStep = () => {
    if (status === 'sorted') return;
    if (status === 'idle') {
      generatorRef.current = mergeSortGenerator(array);
      setStatus('paused');
    }
    stepForward();
  };
  
  const getBarColor = (index: number) => {
    if (isSorted) return 'bg-green-500';
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
