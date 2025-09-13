export interface Topic {
  id: string;
  title: string;
  category: string;
  visualizationComponent:
    | 'BubbleSort'
    | 'SelectionSort'
    | 'InsertionSort'
    | 'MergeSort'
    | 'QuickSort'
    | 'HeapSort'
    | 'BinarySearch'
    | 'LinearSearch'
    | 'LinkedList'
    | 'Stack'
    | 'Queue'
    | 'PythonList'
    | 'PythonDict'
    | 'BinarySearchTree'
    | 'Heap'
    | 'Graph'
    | 'Trie'
    | 'Recursion'
    | 'None';
}

export interface GeneratedContent {
  explanation: string;
  pythonCode: string;
}

export type AlgorithmStep = {
  array: number[];
  comparing?: [number, number];
  swapping?: [number, number];
  sorted?: number[];
};
