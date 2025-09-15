import React, { useState, useEffect, useCallback } from 'react';
import { Topic, GeneratedContent } from '../types';
import { generateContentForTopic } from '../services/geminiService';
import { contentCache } from '../services/contentCache';
import { LoadingSpinner } from './LoadingSpinner';
import { CodeBlock } from './CodeBlock';
import { BubbleSortVisualization } from './BubbleSortVisualization';
import { SelectionSortVisualization } from './SelectionSortVisualization';
import { InsertionSortVisualization } from './InsertionSortVisualization';
import { MergeSortVisualization } from './MergeSortVisualization';
import { QuickSortVisualization } from './QuickSortVisualization';
import { BinarySearchVisualization } from './BinarySearchVisualization';
import { LinkedListVisualization } from './LinkedListVisualization';
import { StackVisualization } from './StackVisualization';
import { QueueVisualization } from './QueueVisualization';
import ReactMarkdown from 'react-markdown';
import { HeapSortVisualization } from './HeapSortVisualization';
import { LinearSearchVisualization } from './LinearSearchVisualization';
import { PythonListVisualization } from './PythonListVisualization';
import { PythonDictVisualization } from './PythonDictVisualization';
import { BinarySearchTreeVisualization } from './BinarySearchTreeVisualization';
import { HeapVisualization } from './HeapVisualization';
import { GraphTraversalVisualization } from './GraphTraversalVisualization';
import { TrieVisualization } from './TrieVisualization';
import { RecursionVisualization } from './RecursionVisualization';
import { FibonacciMemoizationVisualization } from './FibonacciMemoizationVisualization';
import { CoinChangeVisualization } from './CoinChangeVisualization';
import { KnapsackVisualization } from './KnapsackVisualization';
import { DijkstraVisualization } from './DijkstraVisualization';

interface TopicViewProps {
  topic: Topic;
}

const renderVisualization = (topic: Topic) => {
  switch (topic.visualizationComponent) {
    case 'BubbleSort':
      return <BubbleSortVisualization />;
    case 'SelectionSort':
      return <SelectionSortVisualization />;
    case 'InsertionSort':
      return <InsertionSortVisualization />;
    case 'MergeSort':
        return <MergeSortVisualization />;
    case 'QuickSort':
        return <QuickSortVisualization />;
    case 'HeapSort':
        return <HeapSortVisualization />;
    case 'BinarySearch':
        return <BinarySearchVisualization />;
    case 'LinearSearch':
        return <LinearSearchVisualization />;
    case 'LinkedList':
        return <LinkedListVisualization />;
    case 'Stack':
        return <StackVisualization />;
    case 'Queue':
        return <QueueVisualization />;
    case 'PythonList':
        return <PythonListVisualization />;
    case 'PythonDict':
        return <PythonDictVisualization />;
    case 'BinarySearchTree':
        return <BinarySearchTreeVisualization />;
    case 'Heap':
        return <HeapVisualization />;
    case 'GraphTraversal':
        return <GraphTraversalVisualization />;
    case 'Trie':
        return <TrieVisualization />;
    case 'Recursion':
        return <RecursionVisualization />;
    case 'FibonacciMemoization':
        return <FibonacciMemoizationVisualization />;
    case 'CoinChange':
        return <CoinChangeVisualization />;
    case 'Knapsack':
        return <KnapsackVisualization />;
    case 'Dijkstra':
        return <DijkstraVisualization />;
    case 'None':
    default:
      return (
        <div className="flex items-center justify-center h-full bg-secondary/30 rounded-lg">
          <p className="text-text-secondary">Visualization coming soon for {topic.title}.</p>
        </div>
      );
  }
};

export const TopicView: React.FC<TopicViewProps> = ({ topic }) => {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    
    // Check cache first
    const cachedContent = contentCache.get(topic.id);
    if (cachedContent) {
      setContent(cachedContent);
      setIsLoading(false);
      return;
    }

    // If not in cache, fetch and then store
    const generatedContent = await generateContentForTopic(topic);
    contentCache.set(topic.id, generatedContent);
    setContent(generatedContent);
    setIsLoading(false);
  }, [topic]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <div className="space-y-8 h-full flex flex-col">
      <h1 className="text-3xl font-bold text-text-primary">{topic.title}</h1>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Left column: Visualization */}
        <div className="bg-primary rounded-lg border border-secondary shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-secondary">
            <h2 className="text-lg font-semibold">Visualization</h2>
          </div>
          <div className="flex-1 p-4 min-h-[300px] lg:min-h-0">
            {renderVisualization(topic)}
          </div>
        </div>

        {/* Right column: Code */}
        <div className="bg-primary rounded-lg border border-secondary shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-secondary">
            <h2 className="text-lg font-semibold">Python Implementation</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : (
              <CodeBlock code={content?.pythonCode ?? ''} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom section: Explanation */}
      <div className="bg-primary rounded-lg border border-secondary shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 border-b border-secondary">
          <h2 className="text-lg font-semibold">Explanation</h2>
        </div>
        <div className="p-6 prose prose-invert max-w-none prose-headings:text-accent prose-strong:text-text-primary prose-a:text-accent">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : (
             <ReactMarkdown>{content?.explanation ?? ''}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};