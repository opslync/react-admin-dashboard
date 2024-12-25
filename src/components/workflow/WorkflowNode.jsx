import React from 'react';

export default function WorkflowNode({ step, icon, onClick, onDragStart, onBuild }) {
  const handleClick = (e) => {
    if (step.type === 'build') {
      onBuild?.();
    } else {
      onClick();
    }
  };

  return (
    <div
      className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-blue-500"
      draggable
      onDragStart={onDragStart}
      onClick={handleClick}
    >
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
      <p className="text-sm text-gray-600">{step.description}</p>
    </div>
  );
}