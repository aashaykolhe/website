import React from 'react';
import { Topic } from '../types';
import { HomeIcon } from './icons/HomeIcon';

interface SidebarProps {
  topics: Topic[];
  selectedTopic: Topic | null;
  onSelectTopic: (topic: Topic) => void;
  onSelectHome: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ topics, selectedTopic, onSelectTopic, onSelectHome }) => {
  const groupedTopics = topics.reduce((acc, topic) => {
    (acc[topic.category] = acc[topic.category] || []).push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  return (
    <aside className="w-64 bg-primary border-r border-secondary p-4 overflow-y-auto hidden md:block">
      <nav className="space-y-6">
        <div>
           <h2 className="text-xs font-bold uppercase text-text-secondary tracking-widest mb-2 px-2">
              Home
            </h2>
            <ul className="space-y-1">
               <li>
                  <button
                    onClick={onSelectHome}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 flex items-center gap-2 ${
                      !selectedTopic
                        ? 'bg-accent/20 text-accent font-semibold'
                        : 'text-text-secondary hover:bg-secondary/70 hover:text-text-primary'
                    }`}
                  >
                    <HomeIcon className="w-4 h-4" />
                    Dashboard
                  </button>
                </li>
            </ul>
        </div>
        {Object.entries(groupedTopics).map(([category, topics]) => (
          <div key={category}>
            <h2 className="text-xs font-bold uppercase text-text-secondary tracking-widest mb-2 px-2">
              {category}
            </h2>
            <ul className="space-y-1">
              {topics.map((topic) => (
                <li key={topic.id}>
                  <button
                    onClick={() => onSelectTopic(topic)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                      selectedTopic?.id === topic.id
                        ? 'bg-accent/20 text-accent font-semibold'
                        : 'text-text-secondary hover:bg-secondary/70 hover:text-text-primary'
                    }`}
                  >
                    {topic.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};
