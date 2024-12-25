interface VirtualControlsProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
}

export default function VirtualControls({
  onUp,
  onDown,
  onLeft,
  onRight
}: VirtualControlsProps) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      {/* Up */}
      <button
        className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white flex items-center justify-center text-lg"
        onTouchStart={(e) => {
          e.preventDefault();
          onUp();
        }}
      >
        ↑
      </button>
      {/* Left/Right */}
      <div className="flex gap-2">
        <button
          className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white flex items-center justify-center text-lg"
          onTouchStart={(e) => {
            e.preventDefault();
            onLeft();
          }}
        >
          ←
        </button>
        <button
          className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white flex items-center justify-center text-lg"
          onTouchStart={(e) => {
            e.preventDefault();
            onRight();
          }}
        >
          →
        </button>
      </div>
      {/* Down */}
      <button
        className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white flex items-center justify-center text-lg"
        onTouchStart={(e) => {
          e.preventDefault();
          onDown();
        }}
      >
        ↓
      </button>
    </div>
  );
}
