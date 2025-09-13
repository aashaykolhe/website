import React, { useState } from 'react';

export const PythonListVisualization: React.FC = () => {
  const [list, setList] = useState<number[]>([10, 20, 30, 40]);
  const [value, setValue] = useState('');
  const [index, setIndex] = useState('');
  const [message, setMessage] = useState('');

  const handleAppend = () => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      setMessage('Invalid value');
      return;
    }
    setList([...list, numValue]);
    setValue('');
    setMessage(`list.append(${numValue})`);
  };

  const handlePop = () => {
    if (list.length === 0) {
      setMessage('List is empty');
      return;
    }
    const poppedValue = list[list.length - 1];
    setList(list.slice(0, -1));
    setMessage(`list.pop() -> returned ${poppedValue}`);
  };

  const handleInsert = () => {
    const numValue = parseInt(value, 10);
    const numIndex = parseInt(index, 10);
    if (isNaN(numValue) || isNaN(numIndex)) {
      setMessage('Invalid value or index');
      return;
    }
    if (numIndex < 0 || numIndex > list.length) {
      setMessage('Index out of bounds');
      return;
    }
    const newList = [...list];
    newList.splice(numIndex, 0, numValue);
    setList(newList);
    setValue('');
    setIndex('');
    setMessage(`list.insert(${numIndex}, ${numValue})`);
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-between p-4 gap-4">
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-wrap justify-center gap-2 w-full p-2 border border-secondary rounded-md min-h-[6rem]">
          {list.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center rounded bg-secondary text-text-primary font-mono">{item}</div>
              <div className="text-xs mt-1 text-text-secondary">{i}</div>
            </div>
          ))}
          {list.length === 0 && <span className="text-text-secondary self-center">List is empty</span>}
        </div>
        <div className="h-6 mt-2 text-accent font-mono">{message}</div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" className="w-24 px-2 py-1 bg-secondary rounded-md text-text-primary focus:ring-2 focus:ring-accent outline-none" />
        <input type="number" value={index} onChange={(e) => setIndex(e.target.value)} placeholder="Index" className="w-24 px-2 py-1 bg-secondary rounded-md text-text-primary focus:ring-2 focus:ring-accent outline-none" />
        <button onClick={handleAppend} disabled={!value} className="px-3 py-1 text-sm bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50">Append</button>
        <button onClick={handleInsert} disabled={!value || !index} className="px-3 py-1 text-sm bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50">Insert</button>
        <button onClick={handlePop} disabled={list.length === 0} className="px-3 py-1 text-sm bg-secondary rounded-md text-text-primary hover:bg-secondary/70 disabled:opacity-50">Pop</button>
      </div>
    </div>
  );
};
