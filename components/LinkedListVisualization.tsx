import React, { useState } from 'react';

interface Node {
  id: number;
  value: number;
}

export const LinkedListVisualization: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 1, value: 12 },
    { id: 2, value: 99 },
    { id: 3, value: 37 },
  ]);
  const [inputValue, setInputValue] = useState('');
  let nextId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 1;

  const handleAdd = (position: 'head' | 'tail') => {
    const value = parseInt(inputValue, 10);
    if (isNaN(value)) return;

    const newNode: Node = { id: nextId++, value };
    if (position === 'head') {
      setNodes([newNode, ...nodes]);
    } else {
      setNodes([...nodes, newNode]);
    }
    setInputValue('');
  };

  const handleRemove = (position: 'head' | 'tail') => {
    if (nodes.length === 0) return;
    if (position === 'head') {
      setNodes(nodes.slice(1));
    } else {
      setNodes(nodes.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-between">
      <div className="flex-grow flex items-center justify-center flex-wrap gap-x-8 gap-y-4 p-4 overflow-y-auto">
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-secondary rounded-md flex items-center justify-center text-text-primary font-mono text-lg shadow-md">
                {node.value}
              </div>
              <div className="w-8 h-16 border-r-2 border-accent" />
            </div>
            {index < nodes.length - 1 && (
               <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
               </svg>
            )}
            {index === nodes.length - 1 && (
                <div className="text-accent font-mono text-2xl">NULL</div>
            )}
          </React.Fragment>
        ))}
        {nodes.length === 0 && <div className="text-text-secondary">List is empty</div>}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Value"
          className="w-24 px-2 py-1 bg-secondary border border-primary rounded-md text-text-primary focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <button onClick={() => handleAdd('head')} disabled={!inputValue} className="px-3 py-1 text-sm bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 transition-colors">Add Head</button>
        <button onClick={() => handleAdd('tail')} disabled={!inputValue} className="px-3 py-1 text-sm bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 transition-colors">Add Tail</button>
        <button onClick={() => handleRemove('head')} disabled={nodes.length === 0} className="px-3 py-1 text-sm bg-secondary rounded-md text-text-primary hover:bg-secondary/70 disabled:opacity-50 transition-colors">Remove Head</button>
        <button onClick={() => handleRemove('tail')} disabled={nodes.length === 0} className="px-3 py-1 text-sm bg-secondary rounded-md text-text-primary hover:bg-secondary/70 disabled:opacity-50 transition-colors">Remove Tail</button>
      </div>
    </div>
  );
};
