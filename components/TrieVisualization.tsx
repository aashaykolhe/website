import React, { useState, useMemo, useCallback } from 'react';

// --- Type Definitions & Helpers ---
let nodeIdCounter = 0;
interface TrieNode {
  id: number;
  char: string;
  children: { [key: string]: TrieNode };
  isEndOfWord: boolean;
  x: number;
  y: number;
  width: number; // width of the subtree rooted at this node
}

const createTrieNode = (char: string = ''): TrieNode => ({
  id: nodeIdCounter++,
  char,
  children: {},
  isEndOfWord: false,
  x: 0,
  y: 0,
  width: 0,
});

const NODE_RADIUS = 18;
const X_SPACING = 50;
const Y_SPACING = 70;
const ANIMATION_SPEED = 300;
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));


// --- Main Component ---
export const TrieVisualization: React.FC = () => {
  const [root, setRoot] = useState<TrieNode>(createTrieNode('ROOT'));
  const [insertValue, setInsertValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState('Insert words into the Trie.');
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [activePath, setActivePath] = useState<number[]>([]);

  const assignPositions = useCallback((node: TrieNode, depth = 0) => {
    let childX = 0;
    Object.values(node.children)
      .sort((a, b) => a.char.localeCompare(b.char))
      .forEach(child => {
        assignPositions(child, depth + 1);
        child.x = childX + child.width / 2;
        childX += child.width;
      });
    
    node.width = Math.max(childX, X_SPACING);
    node.y = depth * Y_SPACING;
  }, []);

  const setAbsolutePositions = useCallback((node: TrieNode, parentX = 0, parentY = 0) => {
      node.x += parentX;
      node.y += parentY;
      
      const children = Object.values(node.children).sort((a,b) => a.char.localeCompare(b.char));
      let currentX = node.x - node.width/2;
      for(const child of children){
          setAbsolutePositions(child, currentX + child.width/2, node.y);
          currentX += child.width;
      }
  }, []);

  const flattenedTrie = useMemo(() => {
    const nodes: TrieNode[] = [];
    const edges: { from: number; to: number }[] = [];
    // FIX: Add type annotation to `tempRoot` after JSON operations to restore type information.
    const tempRoot: TrieNode = JSON.parse(JSON.stringify(root));

    assignPositions(tempRoot);
    setAbsolutePositions(tempRoot, 0, 0);

    const q: TrieNode[] = [tempRoot];
    tempRoot.x = 0; // Center the root initially
    
    let minX = 0, maxX = 0;
    while(q.length > 0){
        const node = q.shift()!;
        nodes.push(node);
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        for(const child of Object.values(node.children)){
            edges.push({from: node.id, to: child.id});
            q.push(child);
        }
    }
    
    // Recenter all nodes based on calculated bounds
    nodes.forEach(n => { n.x -= minX; });
    const width = maxX - minX + X_SPACING;
    const height = nodes.length > 0 ? Math.max(...nodes.map(n => n.y)) + Y_SPACING : 0;
    nodes[0].x = width/2; // Center root again after shift
    
    return { nodes, edges, width, height };
  }, [root, assignPositions, setAbsolutePositions]);
  
  const handleInsert = useCallback(async () => {
    const word = insertValue.toLowerCase().trim();
    if (!word) return;

    setIsAnimating(true);
    setMessage(`Inserting "${word}"...`);
    setActivePath([root.id]);
    setFoundWords([]);

    let current = root;
    for (const char of word) {
        if (!current.children[char]) {
            current.children[char] = createTrieNode(char);
        }
        current = current.children[char];
        setActivePath(prev => [...prev, current.id]);
        await sleep(ANIMATION_SPEED);
    }
    current.isEndOfWord = true;

    setRoot({ ...root }); // Trigger re-render
    setMessage(`"${word}" inserted.`);
    setIsAnimating(false);
    setInsertValue('');
    setTimeout(() => setActivePath([]), 1000);
  }, [insertValue, root]);
  
  const handleSearch = useCallback(async () => {
    const prefix = searchValue.toLowerCase().trim();
    if (!prefix) return;

    setIsAnimating(true);
    setMessage(`Searching for prefix "${prefix}"...`);
    setActivePath([root.id]);
    setFoundWords([]);
    
    let current = root;
    let found = true;
    for(const char of prefix) {
      if(current.children[char]){
        current = current.children[char];
        setActivePath(prev => [...prev, current.id]);
        await sleep(ANIMATION_SPEED);
      } else {
        found = false;
        break;
      }
    }
    
    if (found) {
        setMessage(`Prefix found. Finding all words...`);
        const words: string[] = [];
        const findWordsDfs = (node: TrieNode, currentWord: string) => {
            if (node.isEndOfWord) words.push(currentWord);
            for(const child of Object.values(node.children)){
                findWordsDfs(child, currentWord + child.char);
            }
        }
        findWordsDfs(current, prefix);
        setFoundWords(words);
        setMessage(words.length > 0 ? `Found ${words.length} word(s).` : 'Prefix exists, but no complete words found.');
    } else {
        setMessage(`Prefix "${prefix}" not found.`);
    }

    setIsAnimating(false);
     setTimeout(() => setActivePath([]), 2000);
  }, [searchValue, root]);
  
  const handleReset = () => {
      setRoot(createTrieNode('ROOT'));
      setInsertValue('');
      setSearchValue('');
      setMessage('Trie has been reset.');
      setFoundWords([]);
      setActivePath([]);
  }
  
  const getNodeColor = (node: TrieNode) => {
      if(activePath.includes(node.id)) return 'bg-yellow-500 border-yellow-300';
      if(node.isEndOfWord) return 'bg-accent border-sky-300';
      return 'bg-secondary border-secondary/50';
  }

  return (
    <div className="flex flex-col h-full w-full items-center justify-between p-2">
      <div className="relative flex-grow w-full overflow-auto border-b border-secondary">
          <svg className="absolute top-0 left-0" width={flattenedTrie.width} height={flattenedTrie.height} style={{ overflow: 'visible' }}>
              {flattenedTrie.edges.map(edge => {
                  const from = flattenedTrie.nodes.find(n => n.id === edge.from);
                  const to = flattenedTrie.nodes.find(n => n.id === edge.to);
                  if(!from || !to) return null;
                  return <line key={`${from.id}-${to.id}`} x1={from.x} y1={from.y+NODE_RADIUS} x2={to.x} y2={to.y-NODE_RADIUS} className="stroke-accent/70" strokeWidth="2" />
              })}
          </svg>
          <div className="relative" style={{width: flattenedTrie.width, height: flattenedTrie.height}}>
            {flattenedTrie.nodes.map(node => (
                 <div key={node.id} className={`absolute w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-200 ${getNodeColor(node)}`}
                    style={{left: node.x, top: node.y, transform: 'translate(-50%, -50%)'}}>
                    {node.char}
                 </div>
            ))}
          </div>
      </div>
      <div className="h-6 mt-2 text-accent font-mono text-center">{message}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <input type="text" value={insertValue} onChange={e => setInsertValue(e.target.value)} placeholder="Word to insert" disabled={isAnimating} className="w-32 px-2 py-1 bg-secondary rounded-md text-text-primary focus:ring-2 focus:ring-accent outline-none" />
            <button onClick={handleInsert} disabled={isAnimating || !insertValue} className="px-3 py-1 text-sm bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50">Insert</button>
          </div>
           <div className="flex flex-wrap items-center justify-center gap-2">
            <input type="text" value={searchValue} onChange={e => setSearchValue(e.target.value)} placeholder="Prefix to search" disabled={isAnimating} className="w-32 px-2 py-1 bg-secondary rounded-md text-text-primary focus:ring-2 focus:ring-accent outline-none" />
            <button onClick={handleSearch} disabled={isAnimating || !searchValue} className="px-3 py-1 text-sm bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50">Search</button>
          </div>
          <div className="md:col-span-2 flex flex-col items-center">
            <div className="bg-secondary/50 rounded-md p-2 w-full max-w-md min-h-[5rem]">
                <h4 className="text-sm text-text-secondary">Found Words:</h4>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-text-primary">
                    {foundWords.map(w => <span key={w}>{w}</span>)}
                    {searchValue && foundWords.length === 0 && <span className="text-text-secondary/70">None</span>}
                </div>
            </div>
            <button onClick={handleReset} disabled={isAnimating} className="mt-2 px-3 py-1 text-sm bg-secondary rounded-md text-text-primary hover:bg-secondary/70">Reset Trie</button>
          </div>
      </div>
    </div>
  );
};
