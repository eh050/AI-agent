'use client';

import { useState } from 'react';

interface MissionInputProps {
  onSubmit: (mission: string) => void;
}

export default function MissionInput({ onSubmit }: MissionInputProps) {
  const [mission, setMission] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission.trim()) return;

    setIsSubmitting(true);
    onSubmit(mission.trim());
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Enter Your Research Mission
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Describe what you want the AI agent to research. The agent will break it
        down into steps and execute them autonomously.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          placeholder="e.g., Research the latest developments in quantum computing and its potential applications in cryptography"
          className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     resize-none"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={!mission.trim() || isSubmitting}
          className="mt-4 w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 
                     disabled:bg-gray-400 disabled:cursor-not-allowed
                     text-white font-semibold rounded-lg transition-colors"
        >
          {isSubmitting ? 'Starting...' : 'Start Research Mission'}
        </button>
      </form>
    </div>
  );
}
