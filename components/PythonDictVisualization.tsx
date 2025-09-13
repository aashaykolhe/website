import React, { useState } from 'react';

type Dictionary = Record<string, string>;

export const PythonDictVisualization: React.FC = () => {
  const [dict, setDict] = useState<Dictionary>({ name: 'Alice', age: '30' });
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');

  const handleSet = () => {
    if (!key || !value) {
      setMessage("Key and Value cannot be empty");
      return;
    }
    const newDict = { ...dict, [key]: value };
    setDict(newDict);
    setMessage(`dict['${key}'] = '${value}'`);
    setKey('');
    setValue('');
  };

  const handleDelete = () => {
    if (!key) {
      setMessage("Key cannot be empty");
      return;
    }
    if (!(key in dict)) {
      setMessage(`KeyError: '${key}' not found`);
      return;
    }
    const newDict = { ...dict };
    delete newDict[key];
    setDict(newDict);
    setMessage(`del dict['${key}']`);
    setKey('');
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-between p-4 gap-4">
      <div className="flex flex-col items-center w-full">
        <div className="w-full p-4 border border-secondary rounded-md min-h-[8rem] font-mono text-text-primary">
          <span className="text-accent">{'{'}</span>
          <div className="pl-4">
            {Object.entries(dict).map(([k, v], i, arr) => (
              <div key={k}>
                <span className="text-green-400">'{k}'</span>: <span className="text-orange-400">'{v}'</span>{i < arr.length - 1 && ','}
              </div>
            ))}
          </div>
          <span className="text-accent">{'}'}</span>
        </div>
        <div className="h-6 mt-2 text-accent font-mono">{message}</div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <input type="text" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Key" className="w-28 px-2 py-1 bg-secondary rounded-md text-text-primary focus:ring-2 focus:ring-accent outline-none" />
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" className="w-28 px-2 py-1 bg-secondary rounded-md text-text-primary focus:ring-2 focus:ring-accent outline-none" />
        <button onClick={handleSet} disabled={!key || !value} className="px-3 py-1 text-sm bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50">Set Item</button>
        <button onClick={handleDelete} disabled={!key} className="px-3 py-1 text-sm bg-secondary rounded-md text-text-primary hover:bg-secondary/70 disabled:opacity-50">Delete Item</button>
      </div>
    </div>
  );
};
