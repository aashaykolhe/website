import React, { useState } from 'react';

const MAX_QUEUE_SIZE = 8;

export const QueueVisualization: React.FC = () => {
  const [queue, setQueue] = useState<number[]>([10, 25, 5]);
  const [inputValue, setInputValue] = useState('');

  const handleEnqueue = () => {
    const value = parseInt(inputValue, 10);
    if (isNaN(value) || queue.length >= MAX_QUEUE_SIZE) return;
    setQueue([...queue, value]);
    setInputValue('');
  };

  const handleDequeue = () => {
    if (queue.length === 0) return;
    setQueue(queue.slice(1));
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-between">
       <div className="flex-grow flex items-center">
        <div className="flex justify-start w-full h-12 border-y-2 border-l-2 border-accent rounded-l-md px-2">
            {queue.map((value, index) => (
            <div
                key={index}
                className="w-12 h-full bg-secondary flex items-center justify-center text-text-primary font-mono text-lg border-r-2 border-primary"
            >
                {value}
            </div>
            ))}
            {queue.length === 0 && <div className="flex-grow flex items-center justify-center text-text-secondary">Queue is empty</div>}
        </div>
      </div>
      <div className="flex items-center gap-4 pt-4">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Value"
          className="w-24 px-2 py-1 bg-secondary border border-primary rounded-md text-text-primary focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <button
          onClick={handleEnqueue}
          disabled={!inputValue || queue.length >= MAX_QUEUE_SIZE}
          className="px-4 py-2 bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 transition-colors"
        >
          Enqueue
        </button>
        <button
          onClick={handleDequeue}
          disabled={queue.length === 0}
          className="px-4 py-2 bg-secondary rounded-md text-text-primary hover:bg-secondary/70 disabled:opacity-50 transition-colors"
        >
          Dequeue
        </button>
      </div>
    </div>
  );
};
