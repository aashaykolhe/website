import React, { useState } from 'react';

const MAX_STACK_SIZE = 8;

export const StackVisualization: React.FC = () => {
  const [stack, setStack] = useState<number[]>([10, 25, 5]);
  const [inputValue, setInputValue] = useState('');

  const handlePush = () => {
    const value = parseInt(inputValue, 10);
    if (isNaN(value) || stack.length >= MAX_STACK_SIZE) return;
    setStack([...stack, value]);
    setInputValue('');
  };

  const handlePop = () => {
    if (stack.length === 0) return;
    setStack(stack.slice(0, -1));
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-between">
      <div className="flex-grow flex flex-col-reverse justify-start w-32 border-x-2 border-b-2 border-accent rounded-b-md">
        {stack.map((value, index) => (
          <div
            key={index}
            className="w-full h-10 bg-secondary flex items-center justify-center text-text-primary font-mono text-lg border-t-2 border-primary"
          >
            {value}
          </div>
        ))}
         {stack.length === 0 && <div className="flex-grow flex items-center justify-center text-text-secondary">Stack is empty</div>}
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
          onClick={handlePush}
          disabled={!inputValue || stack.length >= MAX_STACK_SIZE}
          className="px-4 py-2 bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 transition-colors"
        >
          Push
        </button>
        <button
          onClick={handlePop}
          disabled={stack.length === 0}
          className="px-4 py-2 bg-secondary rounded-md text-text-primary hover:bg-secondary/70 disabled:opacity-50 transition-colors"
        >
          Pop
        </button>
      </div>
    </div>
  );
};
