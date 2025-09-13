
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopicView } from './components/TopicView';
import { Topic } from './types';
import { TOPICS } from './constants';
import { PythonIcon } from './components/icons/PythonIcon';

const App: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic>(TOPICS[0]);

  return (
    <div className="bg-primary min-h-screen text-text-primary font-sans flex flex-col">
      <header className="bg-secondary/50 border-b border-secondary p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <PythonIcon className="h-8 w-8 text-accent" />
          <h1 className="text-xl font-bold text-text-primary tracking-wider">
            Python DSA Visualizer
          </h1>
        </div>
        <a href="https://aistudio.google.com/app/prompts/gemini-2.5-flash" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-accent transition-colors">
          Powered by Gemini
        </a>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} />
        <main className="flex-1 p-6 overflow-y-auto">
          <TopicView topic={selectedTopic} key={selectedTopic.id} />
        </main>
      </div>
    </div>
  );
};

export default App;
