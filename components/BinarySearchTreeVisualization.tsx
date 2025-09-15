import React, { useState, useCallback, useMemo } from 'react';

// --- Type Definitions ---
interface TreeNode {
  id: number;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  // Positioning properties
  x: number;
  y: number;
  parentId: number | null;
}

const NODE_RADIUS = 20;
const X_SPACING = 50;
const Y_SPACING = 70;
const ANIMATION_SPEED = 400;

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Main Component ---
export const BinarySearchTreeVisualization: React.FC = () => {
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState('Insert a number to build the tree.');

  // Animation state
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [foundNodeId, setFoundNodeId] = useState<number | null>(null);

  let nextId = 1;
  const assignPositions = (node: TreeNode | null, depth = 0, xOffset = 0, parent: TreeNode | null = null): { nodes: TreeNode[], edges: { from: number, to: number }[] } => {
    if (!node) return { nodes: [], edges: [] };
    
    const leftResult = assignPositions(node.left, depth + 1, xOffset, node);
    const currentX = (leftResult.nodes.length > 0 ? Math.max(...leftResult.nodes.map(n => n.x)) + X_SPACING : xOffset);
    
    node.x = currentX;
    node.y = depth * Y_SPACING + Y_SPACING / 2;
    node.parentId = parent ? parent.id : null;

    const rightResult = assignPositions(node.right, depth + 1, currentX + X_SPACING, node);

    const nodes = [...leftResult.nodes, node, ...rightResult.nodes];
    const edges = [...leftResult.edges, ...rightResult.edges];
    if (node.left) edges.push({ from: node.id, to: node.left.id });
    if (node.right) edges.push({ from: node.id, to: node.right.id });
    
    return { nodes, edges };
  };

  const flattenedTree = useMemo(() => {
    if (!root) return { nodes: [], edges: [], width: 0, height: 0 };
    const result = assignPositions(JSON.parse(JSON.stringify(root)));
    const width = result.nodes.length > 0 ? Math.max(...result.nodes.map(n => n.x)) + NODE_RADIUS * 2 : 0;
    const height = result.nodes.length > 0 ? Math.max(...result.nodes.map(n => n.y)) + NODE_RADIUS * 2 : 0;
    return { ...result, width, height };
  }, [root]);


  const resetAnimationState = () => {
    setActiveNodeId(null);
    setFoundNodeId(null);
  }

  const handleInsert = useCallback(async () => {
    const value = parseInt(inputValue, 10);
    if (isNaN(value)) {
        setMessage('Please enter a valid number.');
        return;
    }
    setIsAnimating(true);
    resetAnimationState();
    setMessage(`Inserting ${value}...`);

    const newNode: Omit<TreeNode, 'x' | 'y' | 'parentId'> = { id: nextId++, value, left: null, right: null };

    if (!root) {
        setRoot(newNode as TreeNode);
        setIsAnimating(false);
        setMessage(`Inserted ${value} as the root.`);
        setInputValue('');
        return;
    }

    let current: TreeNode | null = root;
    while (current) {
        setActiveNodeId(current.id);
        await sleep(ANIMATION_SPEED);

        if (value < current.value) {
            if (!current.left) {
                current.left = newNode as TreeNode;
                setMessage(`Inserted ${value} to the left of ${current.value}.`);
                break;
            }
            current = current.left;
        } else if (value > current.value) {
            if (!current.right) {
                current.right = newNode as TreeNode;
                setMessage(`Inserted ${value} to the right of ${current.value}.`);
                break;
            }
            current = current.right;
        } else {
            setMessage(`${value} already exists in the tree.`);
            setIsAnimating(false);
            resetAnimationState();
            return;
        }
    }
    
    setRoot({ ...root }); // Trigger re-render
    setInputValue('');
    setIsAnimating(false);
    resetAnimationState();
  }, [inputValue, root]);

  const handleSearch = useCallback(async () => {
     const value = parseInt(inputValue, 10);
    if (isNaN(value)) {
        setMessage('Please enter a valid number.');
        return;
    }
    setIsAnimating(true);
    resetAnimationState();
    setMessage(`Searching for ${value}...`);

    let current = root;
    while (current) {
        setActiveNodeId(current.id);
        await sleep(ANIMATION_SPEED);
        if (value === current.value) {
            setFoundNodeId(current.id);
            setMessage(`Found ${value}!`);
            setIsAnimating(false);
            setInputValue('');
            return;
        }
        current = value < current.value ? current.left : current.right;
    }

    setMessage(`${value} not found in the tree.`);
    setIsAnimating(false);
    resetAnimationState();
  }, [inputValue, root]);

  const handleDelete = async () => {
    // Note: Deletion is complex. This is a simplified placeholder.
    // A full implementation would handle leaf, one-child, and two-child cases.
    setMessage('Deletion is a complex operation and not fully implemented in this visualization.');
  };
  
  const handleReset = () => {
      setRoot(null);
      setInputValue('');
      setMessage('Tree reset. Insert a number to start.');
      resetAnimationState();
  }
  
  const getNodeColor = (node: TreeNode) => {
      if (node.id === foundNodeId) return 'bg-green-500 border-green-300';
      if (node.id === activeNodeId) return 'bg-yellow-500 border-yellow-300';
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
                    style={{ left: node.x - NODE_RADIUS, top: node.y - NODE_RADIUS, transform: 'translate(-50%, -50%)' }}
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
        <button onClick={handleSearch} disabled={isAnimating || !inputValue} className="px-3 py-1 text-sm bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50 transition-colors">Search</button>
        <button onClick={handleDelete} disabled={isAnimating || !root} className="px-3 py-1 text-sm bg-secondary rounded-md text-text-primary hover:bg-secondary/70 disabled:opacity-50 transition-colors">Delete</button>
        <button onClick={handleReset} disabled={isAnimating} className="px-3 py-1 text-sm bg-secondary rounded-md text-text-primary hover:bg-secondary/70">Reset</button>
      </div>
    </div>
  );
};