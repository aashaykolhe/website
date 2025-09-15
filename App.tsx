import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopicView } from './components/TopicView';
import { Topic } from './types';
import { PythonIcon } from './components/icons/PythonIcon';
import { Dashboard } from './components/Dashboard';
import { getAllTopics } from './services/db';
import { LoadingSpinner } from './components/LoadingSpinner';

const App: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const allTopics = await getAllTopics();
        setTopics(allTopics);
      } catch (error) {
        console.error("Failed to load topic data from DB:", error);
        // Here you could implement a fallback or show an error message
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-primary min-h-screen flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 mb-4">
          <PythonIcon className="h-8 w-8 text-accent" />
          <h1 className="text-xl font-bold text-text-primary tracking-wider">
            Python DSA Visualizer
          </h1>
        </div>
        <LoadingSpinner />
        <p className="text-text-secondary mt-2">Initializing data store...</p>
      </div>
    );
  }

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
        <Sidebar
          topics={topics}
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
          onSelectHome={() => setSelectedTopic(null)}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          {selectedTopic ? (
            <TopicView topic={selectedTopic} key={selectedTopic.id} />
          ) : (
            <Dashboard topics={topics} onSelectTopic={setSelectedTopic} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
