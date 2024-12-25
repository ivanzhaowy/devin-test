interface StartPageProps {
  onStart: () => void;
  onViewScores: () => void;
}

export default function StartPage({ onStart, onViewScores }: StartPageProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-white text-4xl font-bold mb-2">蛇来运转</h1>
      <p className="text-gray-400 text-lg mb-4">Snake Game</p>
      <button
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        onClick={onStart}
      >
        Start Game
      </button>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        onClick={onViewScores}
      >
        View Score Rankings
      </button>
    </div>
  );
}
