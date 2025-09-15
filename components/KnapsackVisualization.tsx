import React, { useState, useCallback } from 'react';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
const ANIMATION_SPEED = 200;

const initialItems = [
    { value: 60, weight: 10 },
    { value: 100, weight: 20 },
    { value: 120, weight: 30 },
];

export const KnapsackVisualization: React.FC = () => {
  const [capacity, setCapacity] = useState(50);
  const [items] = useState(initialItems);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dpTable, setDpTable] = useState<number[][]>([]);
  const [message, setMessage] = useState('Ready to solve 0/1 Knapsack.');
  
  // Animation state
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [compareCells, setCompareCells] = useState<{ r: number, c: number }[]>([]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setDpTable([]);
    setMessage('Ready to solve 0/1 Knapsack.');
    setCurrentItemIndex(null);
    setCurrentWeight(null);
    setCompareCells([]);
  }, []);

  const handleStart = useCallback(async () => {
    reset();
    setIsPlaying(true);
    
    const n = items.length;
    let table = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));
    setDpTable([...table]);
    await sleep(ANIMATION_SPEED);

    for (let i = 1; i <= n; i++) {
        const item = items[i - 1];
        setCurrentItemIndex(i - 1);
        for (let w = 1; w <= capacity; w++) {
            setCurrentWeight(w);
            setMessage(`Item ${i} (v:${item.value}, w:${item.weight}), Capacity ${w}`);
            await sleep(ANIMATION_SPEED);

            // Option 1: Don't include the item
            const dontIncludeValue = table[i - 1][w];
            setCompareCells([{ r: i - 1, c: w }]);
            setMessage(`Option 1 (Exclude): Value is ${dontIncludeValue}`);
            await sleep(ANIMATION_SPEED * 2);

            if (item.weight <= w) {
                // Option 2: Include the item
                const includeValue = item.value + table[i - 1][w - item.weight];
                setCompareCells([{ r: i - 1, c: w }, { r: i - 1, c: w - item.weight }]);
                setMessage(`Option 2 (Include): Value is ${item.value} + ${table[i - 1][w - item.weight]} = ${includeValue}`);
                await sleep(ANIMATION_SPEED * 2);

                table[i][w] = Math.max(dontIncludeValue, includeValue);
                 setMessage(`Max value is ${table[i][w]}`);
            } else {
                table[i][w] = dontIncludeValue;
                 setMessage(`Item is too heavy. Value is ${table[i][w]}`);
            }
            setDpTable([...table]);
            await sleep(ANIMATION_SPEED);
            setCompareCells([]);
        }
    }
    
    setCurrentItemIndex(null);
    setCurrentWeight(null);
    const finalValue = table[n][capacity];
    setMessage(`Finished. Maximum value is ${finalValue}.`);
    setIsPlaying(false);

  }, [capacity, items, reset]);
  
  const getCellColor = (r: number, c: number) => {
      const isCurrent = r === currentItemIndex! + 1 && c === currentWeight;
      const isCompare = compareCells.some(cell => cell.r === r && cell.c === c);
      if (isCurrent) return 'bg-yellow-500';
      if (isCompare) return 'bg-red-500';
      if(dpTable.length > 0 && r > 0 && c > 0 && dpTable[r][c] > 0) return 'bg-secondary/80';
      return 'bg-secondary/30';
  }

  return (
    <div className="flex flex-col h-full w-full items-center justify-between p-2">
        <div className="w-full flex-grow flex gap-4">
            <div className="flex flex-col gap-2 w-48">
                <h3 className="font-semibold">Items</h3>
                {items.map((item, i) => (
                    <div key={i} className={`p-2 rounded ${currentItemIndex === i ? 'bg-yellow-500/50' : 'bg-secondary'}`}>
                        <p>Item {i+1}</p>
                        <p className="text-xs">Value: {item.value}, Weight: {item.weight}</p>
                    </div>
                ))}
            </div>
            <div className="flex-grow overflow-auto">
                <table className="table-fixed border-collapse">
                    <thead>
                        <tr>
                            <th className="sticky top-0 left-0 bg-primary p-1 border border-secondary w-10">i\w</th>
                            {Array.from({length: capacity + 1}, (_, w) => <th key={w} className={`sticky top-0 p-1 border border-secondary font-mono text-xs ${w === currentWeight ? 'bg-yellow-500/50' : ''}`}>{w}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {dpTable.map((row, i) => (
                            <tr key={i}>
                                <th className={`sticky left-0 p-1 border border-secondary font-mono text-xs ${(i - 1) === currentItemIndex ? 'bg-yellow-500/50' : 'bg-primary'}`}>{i}</th>
                                {row.map((val, w) => (
                                    <td key={w} className={`p-1 border border-secondary text-center text-xs transition-colors duration-200 ${getCellColor(i, w)}`}>
                                        {val}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="h-6 mt-2 text-accent font-mono text-center">{message}</div>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <div>
                <label className="text-xs">Capacity: </label>
                <input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} disabled={isPlaying} className="w-20 bg-secondary rounded p-1" />
            </div>
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
