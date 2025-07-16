import React from 'react';
import { X } from 'lucide-react';

export default function ConfigPanel({ step, onClose }) {
  return (
    <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">{step.title} Configuration</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        {Object.entries(step.config).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            {Array.isArray(value) ? (
              <div className="space-y-2">
                {value.map((item, index) => (
                  <input
                    key={index}
                    type="text"
                    value={item}
                    className="w-full p-2 border rounded-md"
                    readOnly
                  />
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={value}
                className="w-full p-2 border rounded-md"
                readOnly
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 