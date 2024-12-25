import { useEffect, useState } from 'react';

interface ScoreEntry {
  player_name: string;
  score: number;
  timestamp: string;
}

export default function Scoreboard({ onBack }: { onBack: () => void }) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scores`)
      .then(res => res.json())
      .then(data => setScores(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-4 text-gray-400 hover:text-white"
        >
          ← Back to Start
        </button>
        <h2 className="text-2xl mb-4 text-center">Top Scores</h2>
        <ul className="flex flex-col gap-2">
          {scores.map((score, index) => (
            <li
              key={index}
              className="bg-gray-800 p-2 rounded flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">#{index + 1}</span>
                <span>{score.player_name}</span>
              </div>
              <span className="font-bold">{score.score}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
