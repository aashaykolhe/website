
import React from 'react';
import { TOPICS } from '../constants';
import { Topic } from '../types';

interface SidebarProps {
  selectedTopic: Topic;
  onSelectTopic: (topic: Topic) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedTopic, onSelectTopic }) => {
  const groupedTopics = TOPICS.reduce((acc, topic) => {
    (acc[topic.category] = acc[topic.category] || []).push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  return (
    <aside className="w-64 bg-primary border-r border-secondary p-4 overflow-y-auto hidden md:block">
      <nav className="space-y-6">
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
                      selectedTopic.id === topic.id
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
