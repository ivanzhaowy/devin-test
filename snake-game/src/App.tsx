import { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Trophy } from 'lucide-react'
import StartPage from './StartPage'
import Scoreboard from './Scoreboard'
import CanvasVirtualControls from './CanvasVirtualControls'

type View = 'start' | 'game' | 'scores';

const GRID_SIZE = 20;
const getCanvasSize = () => {
  if (typeof window === 'undefined') return 400;
  const margin = 32; // 2rem (matches p-4 * 2)
  return Math.min(window.innerWidth - margin, 400);
};
const CANVAS_SIZE = getCanvasSize();
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<View>('start');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameStarted, setGameStarted] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Generate random food position
  const generateFood = (): Position => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    return { x, y };
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStarted]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveSnake = () => {
      const head = snake[0];
      let newHead: Position;

      switch (direction) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        submitScore();
        return;
      }

      // Check self collision
      if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        submitScore();
        return;
      }

      const newSnake = [newHead];
      
      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 1);
        setFood(generateFood());
        newSnake.push(...snake);
      } else {
        newSnake.push(...snake.slice(0, -1));
      }

      setSnake(newSnake);
    };

    // Calculate game speed based on score
    // Start at 180ms, decrease by 5ms per point, minimum 60ms
    const calculateGameSpeed = () => {
      const baseSpeed = 180;
      const speedDecrease = 5;
      const minSpeed = 60;
      const newSpeed = Math.max(baseSpeed - (score * speedDecrease), minSpeed);
      return newSpeed;
    };

    const gameInterval = setInterval(moveSnake, calculateGameSpeed());
    return () => clearInterval(gameInterval);
  }, [snake, direction, food, gameStarted, gameOver]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newSize = getCanvasSize();
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = newSize;
        canvas.height = newSize;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = '#333333';
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw snake
    ctx.fillStyle = '#22c55e';
    snake.forEach(({ x, y }, index) => {
      // Darker color for head
      if (index === 0) {
        ctx.fillStyle = '#15803d';
      } else {
        ctx.fillStyle = '#22c55e';
      }
      ctx.fillRect(
        x * CELL_SIZE + 1,
        y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Draw food
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }, [snake, food]);

  const submitScore = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: 'Player', // For now using a default name
          score: score
        }),
      });
      const data = await response.json();
      console.log('Score posted:', data);
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection('RIGHT');
  };

  if (view === 'start') {
    return (
      <StartPage
        onStart={() => {
          setView('game');
          startGame();
        }}
        onViewScores={() => setView('scores')}
      />
    );
  }

  if (view === 'scores') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Scoreboard onBack={() => setView('start')} />
      </div>
    );
  }

  return (
    <div className="safe-area h-[100svh] max-h-[100svh] overflow-hidden bg-gray-900 flex flex-col items-center justify-between p-2 touch-none">
      <div className="flex items-center gap-1 text-white shrink-0 h-8">
        <Trophy className="text-yellow-500" />
        <span className="text-xl font-bold">Score: {score}</span>
      </div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="border-2 border-gray-700 rounded-lg touch-none mb-2"
        onTouchStart={(e) => {
          e.preventDefault();
          if (!gameStarted || gameOver) return;
          const touch = e.touches[0];
          setTouchStart({ x: touch.clientX, y: touch.clientY });
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          if (!touchStart || !gameStarted || gameOver) return;
          const touch = e.changedTouches[0];
          const deltaX = touch.clientX - touchStart.x;
          const deltaY = touch.clientY - touchStart.y;
          
          // Minimum swipe distance (pixels)
          const minSwipeDistance = 30;
          
          // Determine if the swipe was primarily horizontal or vertical
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > minSwipeDistance) {
              if (deltaX > 0 && direction !== 'LEFT') {
                setDirection('RIGHT');
              } else if (deltaX < 0 && direction !== 'RIGHT') {
                setDirection('LEFT');
              }
            }
          } else {
            // Vertical swipe
            if (Math.abs(deltaY) > minSwipeDistance) {
              if (deltaY > 0 && direction !== 'UP') {
                setDirection('DOWN');
              } else if (deltaY < 0 && direction !== 'DOWN') {
                setDirection('UP');
              }
            }
          }
          setTouchStart(null);
        }}
      />

      {(!gameStarted || gameOver) && (
        <div className="flex flex-col items-center gap-4">
          {gameOver && (
            <p className="text-red-500 text-xl font-bold">Game Over!</p>
          )}
          <div className="flex gap-4">
            <Button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700"
            >
              Play Again
            </Button>
            <Button
              onClick={() => setView('start')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Menu
            </Button>
          </div>
        </div>
      )}

      {/* Show canvas controls for touch devices */}
      {window.matchMedia('(hover: none) and (pointer: coarse)').matches && (
        <div className="mt-2 shrink-0">
          <CanvasVirtualControls
            onUp={() => direction !== 'DOWN' && setDirection('UP')}
            onDown={() => direction !== 'UP' && setDirection('DOWN')}
            onLeft={() => direction !== 'RIGHT' && setDirection('LEFT')}
            onRight={() => direction !== 'LEFT' && setDirection('RIGHT')}
          />
        </div>
      )}

      <p className="text-gray-400 text-sm text-center px-4 shrink-0">
        {window.matchMedia('(hover: none) and (pointer: coarse)').matches
          ? 'Use controls below to move the snake'
          : 'Use arrow keys to control the snake'}
      </p>
    </div>
  )
}

export default App
