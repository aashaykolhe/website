import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AddCircleIcon } from './icons/AddCircleIcon';
import { AddEdgeIcon } from './icons/AddEdgeIcon';
import { MousePointerIcon } from './icons/MousePointerIcon';

// --- Type Definitions ---
interface Node {
  id: number;
  x: number;
  y: number;
}

interface Edge {
  from: number;
  to: number;
}

type EditorMode = 'select' | 'addNode' | 'addEdge';
type Algorithm = 'bfs' | 'dfs';
type TraversalState = {
    currentNode?: number;
    visited?: number[];
    queue?: number[];
    stack?: number[];
    path?: number[];
};


const NODE_RADIUS = 20;

// --- Main Component ---
export const GraphTraversalVisualization: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>([
        { id: 1, x: 100, y: 150 },
        { id: 2, x: 250, y: 100 },
        { id: 3, x: 250, y: 200 },
        { id: 4, x: 400, y: 150 },
    ]);
    const [edges, setEdges] = useState<Edge[]>([
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
        { from: 2, to: 4 },
        { from: 3, to: 4 },
    ]);
    const [editorMode, setEditorMode] = useState<EditorMode>('select');
    const [addEdgeStart, setAddEdgeStart] = useState<number | null>(null);
    const [message, setMessage] = useState('Build a graph or run a traversal.');

    const [startNode, setStartNode] = useState<number | null>(1);
    const [algorithm, setAlgorithm] = useState<Algorithm>('bfs');
    const [isPlaying, setIsPlaying] = useState(false);

    // Visualization State
    const [visited, setVisited] = useState<number[]>([]);
    const [currentNode, setCurrentNode] = useState<number | null>(null);
    const [queue, setQueue] = useState<number[]>([]);
    const [stack, setStack] = useState<number[]>([]);
    
    const generatorRef = useRef<Generator<TraversalState, void, void> | null>(null);
    const timeoutRef = useRef<number | null>(null);
    
    // --- Dragging Logic ---
    const [draggingNode, setDraggingNode] = useState<number | null>(null);
    const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);

    const getSVGPoint = (e: React.MouseEvent) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const screenCTM = svgRef.current.getScreenCTM();
        if (!screenCTM) return { x: 0, y: 0 };
        return pt.matrixTransform(screenCTM.inverse());
    };

    const handleMouseDown = (e: React.MouseEvent, id: number) => {
        if (editorMode === 'select') {
            setDraggingNode(id);
            const node = nodes.find(n => n.id === id)!;
            const point = getSVGPoint(e);
            dragOffset.current = { x: point.x - node.x, y: point.y - node.y };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingNode !== null) {
            const point = getSVGPoint(e);
            setNodes(nodes.map(n => 
                n.id === draggingNode 
                ? { ...n, x: point.x - dragOffset.current.x, y: point.y - dragOffset.current.y } 
                : n
            ));
        }
    };
    
    const handleMouseUp = () => {
        setDraggingNode(null);
    };
    
    // --- Editor Logic ---
    const handleSvgClick = (e: React.MouseEvent) => {
        if (editorMode === 'addNode') {
            const point = getSVGPoint(e);
            const newNodeId = (nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) : 0) + 1;
            setNodes([...nodes, { id: newNodeId, x: point.x, y: point.y }]);
        }
    };
    
    const handleNodeClick = (nodeId: number) => {
        if (editorMode === 'addEdge') {
            if (addEdgeStart === null) {
                setAddEdgeStart(nodeId);
                setMessage(`Selected node ${nodeId}, click another to create an edge.`);
            } else {
                if(addEdgeStart !== nodeId && !edges.some(e => (e.from === addEdgeStart && e.to === nodeId) || (e.from === nodeId && e.to === addEdgeStart))) {
                    setEdges([...edges, { from: addEdgeStart, to: nodeId }]);
                }
                setAddEdgeStart(null);
                setMessage('Edge created. Select another start node.');
            }
        }
    };
    
    const resetTraversal = useCallback(() => {
        setIsPlaying(false);
        if(timeoutRef.current) clearTimeout(timeoutRef.current);
        generatorRef.current = null;
        setCurrentNode(null);
        setVisited([]);
        setQueue([]);
        setStack([]);
    }, []);
    
    // --- Algorithm Generators ---
    function* bfsGenerator(startId: number): Generator<TraversalState, void, void> {
        const adj: Record<number, number[]> = {};
        nodes.forEach(n => adj[n.id] = []);
        edges.forEach(e => {
            adj[e.from].push(e.to);
            adj[e.to].push(e.from);
        });

        let q = [startId];
        let visitedSet = new Set([startId]);
        yield { queue: [...q], visited: Array.from(visitedSet) };

        while (q.length > 0) {
            const u = q.shift()!;
            yield { currentNode: u, queue: [...q] };

            for (const v of adj[u]) {
                if (!visitedSet.has(v)) {
                    visitedSet.add(v);
                    q.push(v);
                    yield { queue: [...q], visited: Array.from(visitedSet) };
                }
            }
        }
    }
    
    function* dfsGenerator(startId: number): Generator<TraversalState, void, void> {
        const adj: Record<number, number[]> = {};
        nodes.forEach(n => adj[n.id] = []);
        edges.forEach(e => {
            adj[e.from].push(e.to);
            adj[e.to].push(e.from);
        });

        let s = [startId];
        let visitedSet = new Set<number>();
        
        while(s.length > 0) {
            const u = s.pop()!;
            yield { stack: [...s] };
            
            if(!visitedSet.has(u)) {
                visitedSet.add(u);
                yield { currentNode: u, visited: Array.from(visitedSet) };
                
                // Add neighbors in reverse to explore them in natural order
                for(let i = adj[u].length - 1; i >= 0; i--) {
                    const v = adj[u][i];
                    if(!visitedSet.has(v)) {
                        s.push(v);
                    }
                }
                yield { stack: [...s] };
            }
        }
    }

    const stepForward = useCallback(() => {
        if (!generatorRef.current) return;
        // FIX: Check for `done` and an undefined `value` from the generator to satisfy TypeScript's control flow analysis.
        const { done, value } = generatorRef.current.next();
        if (done || !value) {
            setIsPlaying(false);
            setCurrentNode(null);
            setMessage('Traversal complete.');
            return;
        }
        if (value.currentNode !== undefined) setCurrentNode(value.currentNode);
        if (value.visited !== undefined) setVisited(value.visited);
        if (value.queue !== undefined) setQueue(value.queue);
        if (value.stack !== undefined) setStack(value.stack);
    }, []);

    useEffect(() => {
        if (isPlaying) {
            timeoutRef.current = window.setTimeout(stepForward, 600);
        }
        return () => { if(timeoutRef.current) clearTimeout(timeoutRef.current) };
    }, [isPlaying, stepForward]);
    
    const handlePlayPause = () => {
        if (isPlaying) {
            setIsPlaying(false);
        } else {
            if (!startNode) {
                setMessage('Please select a start node.');
                return;
            }
            resetTraversal();
            generatorRef.current = algorithm === 'bfs' ? bfsGenerator(startNode) : dfsGenerator(startNode);
            setIsPlaying(true);
        }
    };
    
    const getNodeColor = (id: number) => {
        if (id === currentNode) return 'fill-yellow-500 stroke-yellow-300';
        if (visited.includes(id)) return 'fill-green-500 stroke-green-400';
        if (id === addEdgeStart) return 'fill-accent stroke-sky-300';
        return 'fill-secondary stroke-accent';
    };

  return (
    <div className="flex flex-col h-full w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 p-2 border-b border-secondary">
           <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Mode:</span>
                <button onClick={() => setEditorMode('select')} className={`p-2 rounded-md ${editorMode === 'select' ? 'bg-accent text-primary' : 'bg-secondary'}`}><MousePointerIcon className="w-5 h-5"/></button>
                <button onClick={() => setEditorMode('addNode')} className={`p-2 rounded-md ${editorMode === 'addNode' ? 'bg-accent text-primary' : 'bg-secondary'}`}><AddCircleIcon className="w-5 h-5"/></button>
                <button onClick={() => setEditorMode('addEdge')} className={`p-2 rounded-md ${editorMode === 'addEdge' ? 'bg-accent text-primary' : 'bg-secondary'}`}><AddEdgeIcon className="w-5 h-5"/></button>
           </div>
           <div className="flex items-center gap-2">
                <select value={algorithm} onChange={e => setAlgorithm(e.target.value as Algorithm)} disabled={isPlaying} className="bg-secondary p-2 rounded-md text-sm">
                    <option value="bfs">BFS</option>
                    <option value="dfs">DFS</option>
                </select>
                <select value={startNode ?? ''} onChange={e => setStartNode(Number(e.target.value))} disabled={isPlaying} className="bg-secondary p-2 rounded-md text-sm w-28">
                     <option value="" disabled>Start Node</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>Node {n.id}</option>)}
                </select>
                <button onClick={handlePlayPause} disabled={!startNode} className="px-4 py-2 bg-accent rounded-md text-primary font-semibold disabled:opacity-50">{isPlaying ? 'Pause' : 'Start'}</button>
                <button onClick={resetTraversal} className="px-4 py-2 bg-secondary rounded-md">Reset</button>
            </div>
        </div>
        <div className="flex-grow flex">
            <div className="flex-grow relative bg-primary/50" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <svg ref={svgRef} width="100%" height="100%" onClick={handleSvgClick} className={editorMode === 'addNode' ? 'cursor-crosshair' : ''}>
                    {edges.map((edge, i) => {
                        const fromNode = nodes.find(n => n.id === edge.from);
                        const toNode = nodes.find(n => n.id === edge.to);
                        if (!fromNode || !toNode) return null;
                        return <line key={i} x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} className="stroke-accent/50" strokeWidth="2"/>
                    })}
                    {nodes.map(node => (
                        <g key={node.id} onMouseDown={e => handleMouseDown(e, node.id)} onClick={() => handleNodeClick(node.id)} className={editorMode === 'select' ? 'cursor-grab' : 'cursor-pointer'}>
                           <circle cx={node.x} cy={node.y} r={NODE_RADIUS} className={`transition-colors duration-300 ${getNodeColor(node.id)}`} strokeWidth="2"/>
                           <text x={node.x} y={node.y} textAnchor="middle" dy=".3em" className="fill-text-primary font-semibold select-none">{node.id}</text>
                        </g>
                    ))}
                </svg>
            </div>
            <div className="w-48 border-l border-secondary p-2 font-mono text-sm">
                <h4 className="font-semibold mb-2">{algorithm.toUpperCase()} State</h4>
                {algorithm === 'bfs' ? (
                    <div>
                        <p>Queue:</p>
                        <div className="bg-secondary/50 rounded p-1 min-h-[100px] flex flex-wrap gap-1">
                            {queue.map(id => <span key={id} className="bg-primary px-2 py-1 rounded">{id}</span>)}
                        </div>
                    </div>
                ) : (
                    <div>
                        <p>Stack:</p>
                        <div className="bg-secondary/50 rounded p-1 min-h-[100px] flex flex-col-reverse items-center gap-1">
                            {stack.map(id => <span key={id} className="bg-primary px-4 py-1 rounded w-full text-center">{id}</span>)}
                        </div>
                    </div>
                )}
                 <p className="mt-4">Visited:</p>
                 <div className="bg-secondary/50 rounded p-1 flex flex-wrap gap-1">
                    {visited.map(id => <span key={id} className="bg-green-500/20 text-green-300 px-2 py-1 rounded">{id}</span>)}
                </div>
            </div>
        </div>
        <div className="text-center p-2 border-t border-secondary text-accent text-sm h-8">{message}</div>
    </div>
  );
};