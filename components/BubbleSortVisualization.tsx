import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VisualizationControls } from './VisualizationControls';

// Function to generate a new random array
const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

// Define the type for the yielded state from the generator
type BubbleSortState = {
  array?: number[];
  comparing?: [number, number] | null;
  sorted?: number[];
  status?: 'sorted';
};

// The Bubble Sort generator function
function* bubbleSortGenerator(arr: number[]): Generator<BubbleSortState, void, void> {
  let localArray = [...arr];
  let n = localArray.length;
  let newSortedIndices: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield { comparing: [j, j + 1] };

      if (localArray[j] > localArray[j + 1]) {
        [localArray[j], localArray[j + 1]] = [localArray[j + 1], localArray[j]];
        yield { array: [...localArray], comparing: [j, j + 1] };
      }
    }
    newSortedIndices.push(n - 1 - i);
    yield { sorted: [...newSortedIndices], comparing: null };
  }
  newSortedIndices.push(0);
  yield { sorted: [...newSortedIndices], comparing: null, status: 'sorted' };
}

export const BubbleSortVisualization: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState(12);
  const [speed, setSpeed] = useState(50);
  const [status, setStatus] = useState<'idle' | 'sorting' | 'paused' | 'sorted'>('idle');
  
  // Visualization-specific state
  const [comparingIndices, setComparingIndices] = useState<[number, number] | null>(null);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);

  const generatorRef = useRef<Generator<BubbleSortState, void, void> | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const resetArray = useCallback((size: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('idle');
    setArray(generateRandomArray(size));
    setComparingIndices(null);
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
      setComparingIndices(null);
      return;
    }

    const { array: newArray, comparing, sorted, status: newStatus } = value;

    if (newArray) setArray(newArray);
    if (comparing !== undefined) setComparingIndices(comparing);
    if (sorted) setSortedIndices(s => [...s, ...sorted.filter(i => !s.includes(i))]);
    if (newStatus === 'sorted') {
        setStatus('sorted');
        setComparingIndices(null);
    }
  }, []);

  useEffect(() => {
    if (status === 'sorting') {
      const delay = 350 - speed * 3;
      timeoutRef.current = window.setTimeout(stepForward, delay);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [status, speed, stepForward]);

  const handlePlayPause = () => {
    if (status === 'sorted') return;
    if (status === 'sorting') {
      setStatus('paused');
    } else {
      if (status === 'idle') {
        generatorRef.current = bubbleSortGenerator(array);
      }
      setStatus('sorting');
    }
  };

  const handleStep = () => {
    if (status === 'sorted') return;
    if (status === 'idle') {
      generatorRef.current = bubbleSortGenerator(array);
      setStatus('paused');
    }
    stepForward();
  };
  
  const getBarColor = (index: number) => {
    if (sortedIndices.includes(index)) return 'bg-green-500';
    if (comparingIndices && comparingIndices.includes(index)) return 'bg-red-500';
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
