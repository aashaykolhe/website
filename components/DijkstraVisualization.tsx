import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VisualizationControls } from './VisualizationControls';
import { MousePointerIcon } from './icons/MousePointerIcon';
import { AddCircleIcon } from './icons/AddCircleIcon';
import { AddEdgeIcon } from './icons/AddEdgeIcon';

// --- Type Definitions ---
interface Node { id: number; x: number; y: number; }
interface Edge { from: number; to: number; weight: number; }
type EditorMode = 'select' | 'addNode' | 'addEdge';
type Status = 'idle' | 'running' | 'paused' | 'finished';
type Distances = Record<number, number>;
type PQItem = { id: number; distance: number };

type DijkstraState = {
    currentNode?: number | null;
    neighbor?: number | null;
    distances?: Distances;
    pq?: PQItem[];
    visited?: number[];
};

const NODE_RADIUS = 20;

// Simple Priority Queue implementation
class PriorityQueue {
    private elements: PQItem[] = [];
    enqueue(item: PQItem) { this.elements.push(item); this.elements.sort((a, b) => a.distance - b.distance); }
    dequeue(): PQItem | undefined { return this.elements.shift(); }
    isEmpty(): boolean { return this.elements.length === 0; }
    getSnapshot(): PQItem[] { return [...this.elements]; }
}

// --- Main Component ---
export const DijkstraVisualization: React.FC = () => {
    // Graph state
    const [nodes, setNodes] = useState<Node[]>([
        { id: 1, x: 100, y: 50 }, { id: 2, x: 250, y: 150 }, { id: 3, x: 100, y: 250 },
        { id: 4, x: 400, y: 50 }, { id: 5, x: 400, y: 250 },
    ]);
    const [edges, setEdges] = useState<Edge[]>([
        { from: 1, to: 2, weight: 10 }, { from: 1, to: 3, weight: 3 }, { from: 2, to: 3, weight: 1 },
        { from: 2, to: 4, weight: 2 }, { from: 3, to: 5, weight: 8 }, { from: 2, to: 5, weight: 4 }, {from: 4, to: 5, weight: 5}
    ]);
    
    // Editor state
    const [editorMode, setEditorMode] = useState<EditorMode>('select');
    const [addEdgeStart, setAddEdgeStart] = useState<number | null>(null);
    const [edgeWeight, setEdgeWeight] = useState(1);

    // Algorithm state
    const [startNode, setStartNode] = useState<number | null>(1);
    const [endNode, setEndNode] = useState<number | null>(5);
    const [status, setStatus] = useState<Status>('idle');
    const [speed, setSpeed] = useState(50);
    const [message, setMessage] = useState("Build a graph or run Dijkstra's.");

    // Visualization state
    const [distances, setDistances] = useState<Distances>({});
    const [pq, setPq] = useState<PQItem[]>([]);
    const [visited, setVisited] = useState<number[]>([]);
    const [previousNodes, setPreviousNodes] = useState<Record<number, number | null>>({});
    const [currentNode, setCurrentNode] = useState<number | null>(null);
    const [currentNeighbor, setCurrentNeighbor] = useState<number | null>(null);
    const [shortestPath, setShortestPath] = useState<number[]>([]);

    const generatorRef = useRef<Generator<DijkstraState, void, void> | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    
    // --- Graph Editing & Dragging ---
    const [draggingNode, setDraggingNode] = useState<number | null>(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const getSVGPoint = (e: React.MouseEvent) => {
        const pt = svgRef.current!.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        return pt.matrixTransform(svgRef.current!.getScreenCTM()!.inverse());
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
        if (draggingNode === null) return;
        const point = getSVGPoint(e);
        setNodes(nodes.map(n => n.id === draggingNode ? { ...n, x: point.x - dragOffset.current.x, y: point.y - dragOffset.current.y } : n));
    };
    
    const handleMouseUp = () => setDraggingNode(null);

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
            } else {
                if(addEdgeStart !== nodeId && !edges.some(e => [e.from, e.to].sort().join(',') === [addEdgeStart, nodeId].sort().join(','))) {
                    setEdges([...edges, { from: addEdgeStart, to: nodeId, weight: edgeWeight }]);
                }
                setAddEdgeStart(null);
            }
        }
    };

    // --- Algorithm Logic ---
    function* dijkstraGenerator(startId: number): Generator<DijkstraState, void, void> {
        const adj: Record<number, { to: number; weight: number }[]> = {};
        nodes.forEach(n => adj[n.id] = []);
        edges.forEach(e => {
            adj[e.from].push({ to: e.to, weight: e.weight });
            adj[e.to].push({ to: e.from, weight: e.weight });
        });

        const dist: Distances = {};
        const prev: Record<number, number | null> = {};
        const visitedSet = new Set<number>();
        const pq = new PriorityQueue();
        
        nodes.forEach(n => {
            dist[n.id] = Infinity;
            prev[n.id] = null;
        });
        dist[startId] = 0;
        
        yield { distances: { ...dist } };
        
        pq.enqueue({ id: startId, distance: 0 });
        yield { pq: pq.getSnapshot() };

        while (!pq.isEmpty()) {
            const { id: u } = pq.dequeue()!;
            yield { pq: pq.getSnapshot(), currentNode: u };

            if (visitedSet.has(u)) continue;
            
            visitedSet.add(u);
            yield { visited: Array.from(visitedSet) };

            for (const { to: v, weight } of adj[u]) {
                if (visitedSet.has(v)) continue;
                yield { neighbor: v };

                const newDist = dist[u] + weight;
                if (newDist < dist[v]) {
                    dist[v] = newDist;
                    prev[v] = u;
                    pq.enqueue({ id: v, distance: newDist });
                    yield { distances: { ...dist }, pq: pq.getSnapshot() };
                }
            }
            yield { currentNode: u, neighbor: null };
        }
        setPreviousNodes(prev);
    }
    
    // --- Control & Visualization ---
    const reset = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setStatus('idle');
        generatorRef.current = null;
        setDistances({}); setPq([]); setVisited([]); setCurrentNode(null);
        setCurrentNeighbor(null); setShortestPath([]); setPreviousNodes({});
        setMessage("Build a graph or run Dijkstra's.");
    }, []);

    const stepForward = useCallback(() => {
        if (!generatorRef.current) return;
        const { done, value } = generatorRef.current.next();

        if (done || !value) {
            setStatus('finished');
            setMessage('Algorithm finished. Select an end node to see the path.');
            return;
        }
        if (value.distances) setDistances(value.distances);
        if (value.pq) setPq(value.pq);
        if (value.visited) setVisited(value.visited);
        if (value.currentNode !== undefined) setCurrentNode(value.currentNode);
        if (value.neighbor !== undefined) setCurrentNeighbor(value.neighbor);
    }, []);
    
    useEffect(() => {
        if (status === 'running') {
            const delay = 350 - speed * 3;
            timeoutRef.current = window.setTimeout(stepForward, delay);
        }
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [status, speed, stepForward]);

    const handlePlayPause = () => {
        if (status === 'running') setStatus('paused');
        else {
            if (status === 'idle' || status === 'finished') {
                if (!startNode) { setMessage("Select a start node first."); return; }
                reset();
                generatorRef.current = dijkstraGenerator(startNode);
            }
            setStatus('running');
        }
    };
    
    const handleStep = () => {
        if (status === 'finished') return;
        if (status === 'idle') {
            if (!startNode) { setMessage("Select a start node first."); return; }
            reset();
            generatorRef.current = dijkstraGenerator(startNode);
        }
        setStatus('paused');
        stepForward();
    }
    
    useEffect(() => {
        if (status === 'finished' && endNode && startNode) {
            const path = [];
            let current = endNode;
            while(current !== null && previousNodes[current] !== undefined) {
                path.unshift(current);
                if (current === startNode) break;
                current = previousNodes[current]!;
            }
            if(path[0] === startNode) {
                setShortestPath(path);
                setMessage(`Shortest path cost: ${distances[endNode!]}`);
            } else {
                setShortestPath([]);
                setMessage(`No path found from ${startNode} to ${endNode}.`);
            }
        }
    }, [endNode, status, previousNodes, startNode, distances]);

    const getEdgeMidpoint = (edge: Edge) => {
        const from = nodes.find(n => n.id === edge.from)!;
        const to = nodes.find(n => n.id === edge.to)!;
        return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    };

    const isEdgeInPath = (edge: Edge) => {
        for(let i=0; i < shortestPath.length - 1; i++) {
            if((shortestPath[i] === edge.from && shortestPath[i+1] === edge.to) || (shortestPath[i] === edge.to && shortestPath[i+1] === edge.from)) return true;
        }
        return false;
    }
    
  return (
    <div className="flex flex-col h-full w-full">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b border-secondary">
           <div className="flex items-center gap-1">
                <span className="text-xs font-semibold mr-1">Mode:</span>
                <button onClick={() => setEditorMode('select')} title="Select/Drag" className={`p-1.5 rounded ${editorMode === 'select' ? 'bg-accent text-primary' : 'bg-secondary'}`}><MousePointerIcon className="w-4 h-4"/></button>
                <button onClick={() => setEditorMode('addNode')} title="Add Node" className={`p-1.5 rounded ${editorMode === 'addNode' ? 'bg-accent text-primary' : 'bg-secondary'}`}><AddCircleIcon className="w-4 h-4"/></button>
                <button onClick={() => setEditorMode('addEdge')} title="Add Edge" className={`p-1.5 rounded ${editorMode === 'addEdge' ? 'bg-accent text-primary' : 'bg-secondary'}`}><AddEdgeIcon className="w-4 h-4"/></button>
                {editorMode === 'addEdge' && <input type="number" value={edgeWeight} onChange={e => setEdgeWeight(Math.max(1, Number(e.target.value)))} className="w-12 bg-secondary rounded p-1 text-xs" />}
           </div>
           <div className="flex items-center gap-1">
                <select value={startNode ?? ''} onChange={e => setStartNode(Number(e.target.value))} disabled={status === 'running'} className="bg-secondary p-1 rounded text-xs w-24">
                     <option value="" disabled>Start Node</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>Start: {n.id}</option>)}
                </select>
                 <select value={endNode ?? ''} onChange={e => setEndNode(Number(e.target.value))} className="bg-secondary p-1 rounded text-xs w-24">
                     <option value="" disabled>End Node</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>End: {n.id}</option>)}
                </select>
            </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-grow flex min-h-0">
            {/* Visualization */}
            <div className="flex-grow relative bg-primary/50" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <svg ref={svgRef} width="100%" height="100%" onClick={handleSvgClick} className={editorMode === 'addNode' ? 'cursor-crosshair' : 'select-none'}>
                    {edges.map((edge, i) => {
                        const fromNode = nodes.find(n => n.id === edge.from)!;
                        const toNode = nodes.find(n => n.id === edge.to)!;
                        const mid = getEdgeMidpoint(edge);
                        const inPath = isEdgeInPath(edge);
                        return <g key={i}>
                           <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} className={inPath ? "stroke-yellow-400" : "stroke-accent/50"} strokeWidth={inPath ? 4 : 2}/>
                           <text x={mid.x} y={mid.y} textAnchor="middle" dy="-4" className="fill-text-secondary text-xs font-sans">{edge.weight}</text>
                        </g>
                    })}
                    {nodes.map(node => (
                        <g key={node.id} onMouseDown={e => handleMouseDown(e, node.id)} onClick={() => handleNodeClick(node.id)} className={editorMode === 'select' ? 'cursor-grab' : 'cursor-pointer'}>
                           <circle cx={node.x} cy={node.y} r={NODE_RADIUS} strokeWidth="2" className={`transition-colors duration-300
                            ${node.id === startNode ? 'fill-green-500/50 stroke-green-400' :
                             node.id === endNode ? 'fill-red-500/50 stroke-red-400' :
                             node.id === currentNode ? 'fill-yellow-500 stroke-yellow-300' :
                             visited.includes(node.id) ? 'fill-green-500 stroke-green-400' :
                             node.id === currentNeighbor ? 'fill-purple-500 stroke-purple-300' :
                             'fill-secondary stroke-accent'}`}/>
                           <text x={node.x} y={node.y} textAnchor="middle" dy=".3em" className="fill-text-primary font-semibold select-none">{node.id}</text>
                        </g>
                    ))}
                </svg>
            </div>
            
            {/* Data Panels */}
            <div className="w-48 border-l border-secondary p-2 font-mono text-xs overflow-y-auto">
                <h4 className="font-semibold mb-1">Distances</h4>
                <div className="bg-secondary/50 rounded p-1 mb-2">
                    {nodes.map(n => <div key={n.id}>Node {n.id}: {distances[n.id] ?? '∞'}</div>)}
                </div>
                 <h4 className="font-semibold mb-1">Priority Queue</h4>
                <div className="bg-secondary/50 rounded p-1 flex flex-col gap-1">
                    {pq.map(item => <div key={item.id} className="bg-primary px-2 py-0.5 rounded">[{item.id}, {item.distance}]</div>)}
                </div>
            </div>
        </div>

        {/* Footer Controls */}
        <div className="p-2 border-t border-secondary flex flex-col items-center">
            <div className="h-5 text-accent text-sm mb-2">{message}</div>
             <VisualizationControls
                status={status === 'running' ? 'sorting' : status === 'finished' ? 'sorted' : status}
                onPlayPause={handlePlayPause}
                onStep={handleStep}
                onReset={reset}
                arraySize={50} onArraySizeChange={() => {}} // Dummy props
                minSize={0} maxSize={0} // Hide size slider
                speed={speed} onSpeedChange={setSpeed}
             />
        </div>
    </div>
  );
};