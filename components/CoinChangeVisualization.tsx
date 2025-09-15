import React, { useState, useCallback } from 'react';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
const ANIMATION_SPEED = 300;

export const CoinChangeVisualization: React.FC = () => {
  const [amount, setAmount] = useState(11);
  const [coins, setCoins] = useState([1, 2, 5]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dpTable, setDpTable] = useState<(number | string)[]>([]);
  const [message, setMessage] = useState('Set amount and coins, then start.');
  
  // Animation state
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [currentCoinIndex, setCurrentCoinIndex] = useState<number | null>(null);
  const [compareIndex, setCompareIndex] = useState<number | null>(null);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setDpTable([]);
    setMessage('Set amount and coins, then start.');
    setCurrentIndex(null);
    setCurrentCoinIndex(null);
    setCompareIndex(null);
  }, []);

  const handleStart = useCallback(async () => {
    reset();
    if (amount <= 0 || coins.length === 0) {
        setMessage("Invalid amount or coins.");
        return;
    }
    setIsPlaying(true);
    
    let table = new Array(amount + 1).fill(Infinity);
    table[0] = 0;
    setDpTable([...table]);
    await sleep(ANIMATION_SPEED);

    for (let i = 1; i <= amount; i++) {
        setCurrentIndex(i);
        setMessage(`Calculating minimum coins for amount ${i}.`);
        await sleep(ANIMATION_SPEED);

        for (let j = 0; j < coins.length; j++) {
            const coin = coins[j];
            setCurrentCoinIndex(j);
            setMessage(`Considering coin ${coin}...`);
            await sleep(ANIMATION_SPEED);

            if (i - coin >= 0) {
                setCompareIndex(i - coin);
                setMessage(`Checking dp[${i - coin}] = ${table[i - coin]}. Possible new total: 1 + ${table[i-coin]}`);
                await sleep(ANIMATION_SPEED * 1.5);

                if (table[i - coin] !== Infinity) {
                    table[i] = Math.min(table[i], 1 + table[i - coin]);
                    setDpTable([...table]);
                    setMessage(`Updated dp[${i}] to ${table[i]}.`);
                    await sleep(ANIMATION_SPEED);
                }
            } else {
                 setMessage(`Coin ${coin} is too large.`);
                 await sleep(ANIMATION_SPEED);
            }
             setCompareIndex(null);
        }
        setCurrentCoinIndex(null);
    }
    
    setCurrentIndex(null);
    const result = table[amount];
    if(result === Infinity) {
        setMessage(`Cannot make amount ${amount} with given coins.`);
        let finalTable = [...dpTable];
        finalTable[amount] = 'N/A';
        setDpTable(finalTable);
    } else {
        setMessage(`Minimum coins for amount ${amount} is ${result}.`);
    }
    setIsPlaying(false);

  }, [amount, coins, reset, dpTable]);
  
  const getCellColor = (index: number) => {
      if (index === currentIndex) return 'bg-yellow-500 border-yellow-300';
      if (index === compareIndex) return 'bg-red-500 border-red-400';
      if (dpTable[index] !== Infinity && dpTable.length > 0) return 'bg-green-500/50 border-green-400';
      return 'bg-secondary border-secondary/50';
  }

  return (
    <div className="flex flex-col h-full w-full items-center justify-between p-2">
        <div className="w-full flex-grow flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
                {coins.map((coin, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-200 ${i === currentCoinIndex ? 'bg-red-500 border-red-300' : 'bg-secondary border-accent'}`}>
                        {coin}
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap justify-center gap-1 w-full">
                {dpTable.map((val, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded flex items-center justify-center border transition-colors duration-200 ${getCellColor(i)}`}>
                            {val === Infinity ? '∞' : val}
                        </div>
                        <div className="text-xs mt-1">{i}</div>
                    </div>
                ))}
            </div>
        </div>

        <div className="h-6 mt-2 text-accent font-mono text-center">{message}</div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <div>
                <label className="text-xs">Amount: </label>
                <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} disabled={isPlaying} className="w-20 bg-secondary rounded p-1" />
            </div>
            <div>
                <label className="text-xs">Coins: </label>
                <input type="text" value={coins.join(',')} onChange={e => setCoins(e.target.value.split(',').map(Number).filter(n => !isNaN(n)))} disabled={isPlaying} className="w-28 bg-secondary rounded p-1" />
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
