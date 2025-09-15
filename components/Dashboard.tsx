import React, { useState } from 'react';
import { Topic } from '../types';
import { SearchIcon } from './icons/SearchIcon';

interface DashboardProps {
  topics: Topic[];
  onSelectTopic: (topic: Topic) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ topics, onSelectTopic }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTopics = filteredTopics.reduce((acc, topic) => {
    (acc[topic.category] = acc[topic.category] || []).push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Welcome to the Python DSA Visualizer</h1>
        <p className="mt-2 text-text-secondary max-w-3xl">
          An interactive platform to visualize Data Structures and Algorithms using Python. 
          Select a topic below to see a live visualization, an AI-generated explanation, and a Python code implementation powered by Gemini.
        </p>
      </div>

      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="h-5 w-5 text-text-secondary" />
        </span>
        <input
          type="text"
          placeholder="Search topics by title or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md bg-secondary/70 border border-secondary rounded-md py-2 pl-10 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {Object.keys(groupedTopics).length > 0 ? (
        Object.entries(groupedTopics).map(([category, topics]) => (
          <div key={category}>
            <h2 className="text-xl font-semibold text-accent mb-4 border-b-2 border-secondary pb-2">
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => onSelectTopic(topic)}
                  className="bg-secondary p-4 rounded-lg text-left hover:bg-secondary/70 border border-transparent hover:border-accent/50 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <h3 className="font-semibold text-text-primary">{topic.title}</h3>
                  {topic.visualizationComponent === 'None' && (
                      <span className="text-xs text-yellow-400/80 mt-1 block">Explanation Only</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
            <p className="text-text-secondary">No topics found for "{searchQuery}".</p>
        </div>
      )}
    </div>
  );
};
