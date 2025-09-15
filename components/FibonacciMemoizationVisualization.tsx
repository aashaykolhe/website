import React, { useState, useCallback } from 'react';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
const ANIMATION_SPEED = 500;

type MemoCache = { [key: number]: number };

export const FibonacciMemoizationVisualization: React.FC = () => {
  const [n, setN] = useState(7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [callStack, setCallStack] = useState<number[]>([]);
  const [memoCache, setMemoCache] = useState<MemoCache>({});
  const [message, setMessage] = useState('Click Start to visualize fib(n).');
  const [finalResult, setFinalResult] = useState<number | null>(null);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCallStack([]);
    setMemoCache({});
    setFinalResult(null);
    setMessage('Click Start to visualize fib(n).');
  }, []);

  const visualizeFib = useCallback(async (k: number): Promise<number> => {
    setCallStack(prev => [...prev, k]);
    setMessage(`Calling fib(${k})...`);
    await sleep(ANIMATION_SPEED);

    if (k in memoCache) {
      setMessage(`fib(${k}) found in cache. Returning ${memoCache[k]}.`);
      await sleep(ANIMATION_SPEED);
      setCallStack(prev => prev.slice(0, -1));
      return memoCache[k];
    }

    if (k <= 1) {
      setMessage(`Base case: fib(${k}) is ${k}.`);
      setMemoCache(prev => ({ ...prev, [k]: k }));
      await sleep(ANIMATION_SPEED);
      setCallStack(prev => prev.slice(0, -1));
      return k;
    }

    setMessage(`fib(${k}) not in cache. Calculating fib(${k - 1}) + fib(${k - 2}).`);
    await sleep(ANIMATION_SPEED);

    const fib1 = await visualizeFib(k - 1);
    setCallStack(prev => [...prev, k]); // Re-add current context to stack
    setMessage(`fib(${k - 1}) returned ${fib1}. Now calling fib(${k - 2}).`);
    await sleep(ANIMATION_SPEED);

    const fib2 = await visualizeFib(k - 2);
    setCallStack(prev => [...prev, k]); // Re-add current context
    
    const result = fib1 + fib2;
    setMessage(`fib(${k - 2}) returned ${fib2}. Result for fib(${k}) is ${fib1} + ${fib2} = ${result}.`);
    setMemoCache(prev => ({ ...prev, [k]: result }));
    await sleep(ANIMATION_SPEED);

    setCallStack(prev => prev.slice(0, -1));
    return result;
  }, [memoCache]);

  const handleStart = async () => {
    reset();
    if (n < 0 || n > 15) {
      setMessage("Please enter n between 0 and 15.");
      return;
    }
    setIsPlaying(true);
    const result = await visualizeFib(n);
    setFinalResult(result);
    setMessage(`Final result for fib(${n}) is ${result}.`);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-between p-4 gap-4 font-mono">
      <div className="flex w-full gap-4">
        {/* Call Stack */}
        <div className="w-1/2 flex flex-col items-center">
          <h3 className="text-text-secondary mb-2">Call Stack</h3>
          <div className="w-48 border-x-2 border-b-2 border-accent rounded-b-md min-h-[250px] flex flex-col-reverse justify-start p-1">
            {callStack.map((val, index) => (
              <div key={index} className="w-full bg-secondary flex items-center justify-center text-text-primary p-1 mt-1 rounded-sm">
                {`fib(${val})`}
              </div>
            ))}
          </div>
        </div>
        {/* Memoization Cache */}
        <div className="w-1/2 flex flex-col items-center">
          <h3 className="text-text-secondary mb-2">Memoization Cache</h3>
          <div className="w-full bg-secondary/50 rounded p-2 min-h-[250px] text-sm">
            {Object.entries(memoCache).map(([key, val]) => (
              <div key={key} className="flex justify-between">
                <span>fib({key}):</span>
                <span>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-6 text-accent text-center">
        {message}
      </div>
       {finalResult !== null && <div className="text-lg font-bold">Final Result: {finalResult}</div>}
      <div className="flex items-center gap-4">
         <label htmlFor="fib-n" className="text-sm">n =</label>
         <input 
            id="fib-n"
            type="number" 
            value={n} 
            onChange={e => setN(parseInt(e.target.value, 10))} 
            disabled={isPlaying}
            min="0"
            max="15"
            className="w-20 px-2 py-1 bg-secondary rounded-md"
         />
        <button onClick={handleStart} disabled={isPlaying} className="px-4 py-2 bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50">
          {isPlaying ? 'Visualizing...' : 'Start'}
        </button>
        <button onClick={reset} disabled={isPlaying} className="px-4 py-2 bg-secondary rounded-md text-text-primary hover:bg-secondary/70">
          Reset
        </button>
      </div>
    </div>
  );
};
