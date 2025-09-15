import React, { useState, useCallback, useMemo } from 'react';

// --- Type Definitions ---
interface HeapNode {
  id: number;
  value: number;
  x: number;
  y: number;
}

const NODE_RADIUS = 20;
const Y_SPACING = 70;
const ANIMATION_SPEED = 400;

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Main Component ---
export const HeapVisualization: React.FC = () => {
  const [heap, setHeap] = useState<number[]>([10, 30, 15, 45, 50, 25, 20]);
  const [inputValue, setInputValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState('A Min-Heap. Smallest values are higher.');

  // Animation state
  const [activeIndices, setActiveIndices] = useState<number[]>([]);

  const flattenedTree = useMemo(() => {
    if (heap.length === 0) return { nodes: [], edges: [], width: 0, height: 0 };

    const nodes: HeapNode[] = [];
    const edges: { from: number; to: number }[] = [];
    const levelWidths: number[] = [];
    let maxDepth = 0;

    heap.forEach((_, i) => {
        const depth = Math.floor(Math.log2(i + 1));
        maxDepth = Math.max(maxDepth, depth);
        levelWidths[depth] = (levelWidths[depth] || 0) + 1;
    });

    const maxWidth = Math.pow(2, maxDepth) * (NODE_RADIUS * 2.5);

    heap.forEach((value, i) => {
        const depth = Math.floor(Math.log2(i + 1));
        const nodesInLevel = Math.pow(2, depth);
        const positionInLevel = i + 1 - nodesInLevel;
        
        const x = (maxWidth / nodesInLevel) * (positionInLevel + 0.5);
        const y = depth * Y_SPACING + Y_SPACING / 2;
        nodes.push({ id: i, value, x, y });
        
        if (i > 0) {
            const parentIndex = Math.floor((i - 1) / 2);
            edges.push({ from: parentIndex, to: i });
        }
    });

    const width = maxWidth;
    const height = (maxDepth + 1) * Y_SPACING;
    return { nodes, edges, width, height };
  }, [heap]);
  
  const handleInsert = useCallback(async () => {
    const value = parseInt(inputValue, 10);
    if (isNaN(value)) {
      setMessage('Please enter a valid number.');
      return;
    }
    setIsAnimating(true);
    setMessage(`Inserting ${value}...`);

    let newHeap = [...heap, value];
    setHeap(newHeap);
    await sleep(ANIMATION_SPEED);

    // Bubble Up
    let currentIndex = newHeap.length - 1;
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      setActiveIndices([currentIndex, parentIndex]);
      await sleep(ANIMATION_SPEED);

      if (newHeap[currentIndex] < newHeap[parentIndex]) {
        setMessage('Value is smaller than parent, swapping up.');
        [newHeap[currentIndex], newHeap[parentIndex]] = [newHeap[parentIndex], newHeap[currentIndex]];
        setHeap([...newHeap]);
        currentIndex = parentIndex;
        await sleep(ANIMATION_SPEED);
      } else {
        setMessage('Heap property satisfied.');
        break;
      }
    }
    
    setActiveIndices([]);
    setIsAnimating(false);
    setInputValue('');
  }, [inputValue, heap]);

  const handleExtractMin = useCallback(async () => {
    if (heap.length === 0) {
      setMessage('Heap is empty.');
      return;
    }
    setIsAnimating(true);
    setMessage(`Extracting minimum value: ${heap[0]}`);
    
    let newHeap = [...heap];
    const min = newHeap[0];
    const last = newHeap.pop()!;
    
    if (newHeap.length > 0) {
        newHeap[0] = last;
    }

    setHeap(newHeap);
    await sleep(ANIMATION_SPEED * 1.5);
    
    if (newHeap.length <= 1) {
        setIsAnimating(false);
        setMessage(`Extracted ${min}. Heap is now sorted or empty.`);
        return;
    }

    // Bubble Down (Heapify)
    let currentIndex = 0;
    while (true) {
        let leftChildIdx = 2 * currentIndex + 1;
        let rightChildIdx = 2 * currentIndex + 2;
        let smallestChildIdx = -1;

        setActiveIndices([currentIndex, leftChildIdx, rightChildIdx].filter(i => i < newHeap.length));
        await sleep(ANIMATION_SPEED);

        if (leftChildIdx < newHeap.length) {
            smallestChildIdx = leftChildIdx;
        }
        
        if (rightChildIdx < newHeap.length && newHeap[rightChildIdx] < newHeap[leftChildIdx]) {
            smallestChildIdx = rightChildIdx;
        }

        if (smallestChildIdx !== -1 && newHeap[smallestChildIdx] < newHeap[currentIndex]) {
            setMessage('Parent is larger than child, swapping down.');
            [newHeap[currentIndex], newHeap[smallestChildIdx]] = [newHeap[smallestChildIdx], newHeap[currentIndex]];
            setHeap([...newHeap]);
            currentIndex = smallestChildIdx;
            await sleep(ANIMATION_SPEED);
        } else {
            setMessage('Heap property satisfied.');
            break;
        }
    }
    
    setActiveIndices([]);
    setIsAnimating(false);
    setMessage(`Extracted ${min}.`);

  }, [heap]);

  const handleReset = () => {
      setHeap([10, 30, 15, 45, 50, 25, 20]);
      setInputValue('');
      setMessage('A Min-Heap. Smallest values are higher.');
      setActiveIndices([]);
  }
  
  const getNodeColor = (node: HeapNode) => {
      if (activeIndices.includes(node.id)) return 'bg-yellow-500 border-yellow-300';
      return 'bg-secondary border-accent';
  }

  return (
    <div className="flex flex-col h-full w-full items-center justify-between p-2">
      <div className="relative flex-grow w-full overflow-auto">
        <svg className="absolute top-0 left-0" width={flattenedTree.width} height={flattenedTree.height} style={{ overflow: 'visible' }}>
          <g>
            {flattenedTree.edges.map(edge => {
              const fromNode = flattenedTree.nodes.find(n => n.id === edge.from);
              const toNode = flattenedTree.nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              return <line key={`${edge.from}-${edge.to}`} x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} className="stroke-accent/70" strokeWidth="2" />;
            })}
          </g>
        </svg>
        <div className="relative" style={{ width: flattenedTree.width, height: flattenedTree.height }}>
            {flattenedTree.nodes.map(node => (
                <div 
                    key={node.id} 
                    className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-200 ${getNodeColor(node)}`}
                    style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
                >
                    {node.value}
                </div>
            ))}
        </div>
      </div>
       <div className="h-6 mt-2 text-accent font-mono text-center">{message}</div>
       <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Value"
          disabled={isAnimating}
          className="w-24 px-2 py-1 bg-secondary border border-primary rounded-md text-text-primary focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <button onClick={handleInsert} disabled={isAnimating || !inputValue} className="px-3 py-1 text-sm bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 transition-colors">Insert</button>
        <button onClick={handleExtractMin} disabled={isAnimating || heap.length === 0} className="px-3 py-1 text-sm bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 transition-colors">Extract Min</button>
        <button onClick={handleReset} disabled={isAnimating} className="px-3 py-1 text-sm bg-secondary rounded-md text-text-primary hover:bg-secondary/70">Reset</button>
      </div>
    </div>
  );
};
