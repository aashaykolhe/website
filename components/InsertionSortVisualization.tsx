import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VisualizationControls } from './VisualizationControls';

const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

type InsertionSortState = {
  array?: number[];
  currentIndex?: number | null;
  comparingIndex?: number | null;
  sortedUpto?: number;
  status?: 'sorted';
};

function* insertionSortGenerator(arr: number[]): Generator<InsertionSortState, void, void> {
  let localArray = [...arr];
  let n = localArray.length;

  for (let i = 1; i < n; i++) {
    let key = localArray[i];
    let j = i - 1;
    yield { currentIndex: i, sortedUpto: i };
    
    while (j >= 0 && localArray[j] > key) {
      yield { comparingIndex: j };
      localArray[j + 1] = localArray[j];
      yield { array: [...localArray] };
      j = j - 1;
    }
    localArray[j + 1] = key;
    yield { array: [...localArray], comparingIndex: null };
  }
  
  yield { currentIndex: null, comparingIndex: null, status: 'sorted' };
}

export const InsertionSortVisualization: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState(12);
  const [speed, setSpeed] = useState(50);
  const [status, setStatus] = useState<'idle' | 'sorting' | 'paused' | 'sorted'>('idle');

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [comparingIndex, setComparingIndex] = useState<number | null>(null);
  const [sortedUpto, setSortedUpto] = useState<number>(0);
  
  const generatorRef = useRef<Generator<InsertionSortState, void, void> | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const resetArray = useCallback((size: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('idle');
    setArray(generateRandomArray(size));
    setCurrentIndex(null);
    setComparingIndex(null);
    setSortedUpto(0);
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
      setSortedUpto(arraySize);
      return;
    }
    const { array: newArray, currentIndex: ci, comparingIndex: cpi, sortedUpto: su, status: newStatus } = value;
    if (newArray) setArray(newArray);
    if (ci !== undefined) setCurrentIndex(ci);
    if (cpi !== undefined) setComparingIndex(cpi);
    if (su !== undefined) setSortedUpto(su);
    if (newStatus === 'sorted') {
      setStatus('sorted');
      setSortedUpto(arraySize);
    }
  }, [arraySize]);

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
      if (status === 'idle') generatorRef.current = insertionSortGenerator(array);
      setStatus('sorting');
    }
  };

  const handleStep = () => {
    if (status === 'sorted') return;
    if (status === 'idle') {
      generatorRef.current = insertionSortGenerator(array);
      setStatus('paused');
    }
    stepForward();
  };

  const getBarColor = (index: number) => {
    if (status === 'sorted' || index < sortedUpto) return 'bg-green-500';
    if (index === currentIndex) return 'bg-yellow-500';
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
