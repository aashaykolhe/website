import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VisualizationControls } from './VisualizationControls';

const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

type SelectionSortState = {
  array?: number[];
  currentIndex?: number | null;
  comparingIndex?: number | null;
  minIndex?: number | null;
  sorted?: number[];
  status?: 'sorted';
};

function* selectionSortGenerator(arr: number[]): Generator<SelectionSortState, void, void> {
  let localArray = [...arr];
  let n = localArray.length;
  let newSortedIndices: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    yield { currentIndex: i };
    let minIdx = i;
    yield { minIndex: minIdx };

    for (let j = i + 1; j < n; j++) {
      yield { comparingIndex: j };
      if (localArray[j] < localArray[minIdx]) {
        minIdx = j;
        yield { minIndex: minIdx };
      }
    }

    [localArray[i], localArray[minIdx]] = [localArray[minIdx], localArray[i]];
    newSortedIndices.push(i);
    yield {
      array: [...localArray],
      sorted: [...newSortedIndices],
      comparingIndex: null,
      minIndex: null,
    };
  }
  
  newSortedIndices.push(n - 1);
  yield { sorted: newSortedIndices, currentIndex: null, status: 'sorted' };
}

export const SelectionSortVisualization: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState(12);
  const [speed, setSpeed] = useState(50);
  const [status, setStatus] = useState<'idle' | 'sorting' | 'paused' | 'sorted'>('idle');
  
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [comparingIndex, setComparingIndex] = useState<number | null>(null);
  const [minIndex, setMinIndex] = useState<number | null>(null);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  
  const generatorRef = useRef<Generator<SelectionSortState, void, void> | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const resetArray = useCallback((size: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('idle');
    setArray(generateRandomArray(size));
    setCurrentIndex(null);
    setComparingIndex(null);
    setMinIndex(null);
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
    const { array: newArray, currentIndex: ci, comparingIndex: cpi, minIndex: mi, sorted: s, status: newStatus } = value;
    if (newArray) setArray(newArray);
    if (ci !== undefined) setCurrentIndex(ci);
    if (cpi !== undefined) setComparingIndex(cpi);
    if (mi !== undefined) setMinIndex(mi);
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
      if (status === 'idle') generatorRef.current = selectionSortGenerator(array);
      setStatus('sorting');
    }
  };

  const handleStep = () => {
    if (status === 'sorted') return;
    if (status === 'idle') {
      generatorRef.current = selectionSortGenerator(array);
      setStatus('paused');
    }
    stepForward();
  };

  const getBarColor = (index: number) => {
    if (sortedIndices.includes(index)) return 'bg-green-500';
    if (index === minIndex) return 'bg-yellow-500';
    if (index === currentIndex || index === comparingIndex) return 'bg-red-500';
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
