import React, { useState, useEffect } from 'react';

const factorialSteps = [
  { action: 'push', value: 5, result: null, message: 'Call factorial(5)' },
  { action: 'push', value: 4, result: null, message: 'Call factorial(4)' },
  { action: 'push', value: 3, result: null, message: 'Call factorial(3)' },
  { action: 'push', value: 2, result: null, message: 'Call factorial(2)' },
  { action: 'push', value: 1, result: null, message: 'Call factorial(1), base case' },
  { action: 'pop', value: 1, result: 1, message: 'Return 1' },
  { action: 'pop', value: 2, result: 2, message: 'Return 2 * 1 = 2' },
  { action: 'pop', value: 3, result: 6, message: 'Return 3 * 2 = 6' },
  { action: 'pop', value: 4, result: 24, message: 'Return 4 * 6 = 24' },
  { action: 'pop', value: 5, result: 120, message: 'Return 5 * 24 = 120' },
  { action: 'clear', value: null, result: null, message: 'Final result: 120' },
];

export const RecursionVisualization: React.FC = () => {
  const [stack, setStack] = useState<{ value: number, result: number | null }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying || currentStep >= factorialSteps.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const step = factorialSteps[currentStep];
      if (step.action === 'push') {
        setStack(prev => [...prev, { value: step.value!, result: null }]);
      } else if (step.action === 'pop') {
        setStack(prev => prev.slice(0, -1));
      } else {
        setStack([]);
      }
      setCurrentStep(c => c + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    if (currentStep >= factorialSteps.length) {
      setCurrentStep(0);
      setStack([]);
    }
    setIsPlaying(true);
  };
  
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setStack([]);
  }

  return (
    <div className="flex flex-col h-full w-full items-center justify-between p-4 gap-4 font-mono">
      <div className="flex w-full gap-4">
        <div className="w-1/2 bg-secondary/50 p-4 rounded-md text-sm">
          <pre>
            <code>
{`def factorial(n):
  if n == 1:
    return 1
  else:
    return n * factorial(n - 1)

result = factorial(5)`}
            </code>
          </pre>
        </div>
        <div className="w-1/2 flex flex-col items-center">
            <h3 className="text-text-secondary mb-2">Call Stack</h3>
            <div className="w-48 border-x-2 border-b-2 border-accent rounded-b-md min-h-[200px] flex flex-col-reverse justify-start">
                {stack.map((frame, index) => (
                    <div key={index} className="w-full h-10 bg-secondary flex items-center justify-center text-text-primary border-t-2 border-primary">
                        {`factorial(${frame.value})`}
                    </div>
                ))}
            </div>
        </div>
      </div>
      <div className="h-6 text-accent">
        {factorialSteps[currentStep-1]?.message || 'Click Start to visualize factorial(5)'}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={handlePlay} disabled={isPlaying} className="px-4 py-2 bg-accent rounded-md text-primary font-semibold hover:bg-sky-400 disabled:opacity-50">
            {currentStep >= factorialSteps.length ? 'Replay' : 'Start'}
        </button>
        <button onClick={handleReset} className="px-4 py-2 bg-secondary rounded-md text-text-primary hover:bg-secondary/70">
            Reset
        </button>
      </div>
    </div>
  );
};
