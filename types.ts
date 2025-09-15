
export interface Topic {
  id: string;
  title: string;
  category: string;
  visualizationComponent: string;
}

export interface GeneratedContent {
  explanation: string;
  pythonCode: string;
}
