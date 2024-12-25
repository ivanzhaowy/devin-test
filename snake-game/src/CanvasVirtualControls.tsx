import React, { useRef, useEffect, useState } from 'react';

interface CanvasVirtualControlsProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
}

// Constants for gamepad layout
const DPAD_CENTER_X = 80;
const BUTTON_SPACING = 42;
const BUTTON_RADIUS = 20;
const CANVAS_SIZE = 160;

export default function CanvasVirtualControls({
  onUp,
  onDown,
  onLeft,
  onRight
}: CanvasVirtualControlsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const drawControl = (ctx: CanvasRenderingContext2D, x: number, y: number, direction: string, isPressed: boolean = false) => {
    const radius = BUTTON_RADIUS;
    
    // Draw button background
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = isPressed ? '#1F2937' : '#4B5563'; // darker when pressed
    ctx.fill();
    ctx.strokeStyle = isPressed ? '#9CA3AF' : '#6B7280';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw arrow
    ctx.beginPath();
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 3;
    
    const arrowSize = 10;

    switch (direction) {
      case 'up':
        ctx.moveTo(x, y + arrowSize);
        ctx.lineTo(x, y - arrowSize);
        ctx.moveTo(x - arrowSize/2, y - arrowSize/2);
        ctx.lineTo(x, y - arrowSize);
        ctx.lineTo(x + arrowSize/2, y - arrowSize/2);
        break;
      case 'down':
        ctx.moveTo(x, y - arrowSize);
        ctx.lineTo(x, y + arrowSize);
        ctx.moveTo(x - arrowSize/2, y + arrowSize/2);
        ctx.lineTo(x, y + arrowSize);
        ctx.lineTo(x + arrowSize/2, y + arrowSize/2);
        break;
      case 'left':
        ctx.moveTo(x + arrowSize, y);
        ctx.lineTo(x - arrowSize, y);
        ctx.moveTo(x - arrowSize/2, y - arrowSize/2);
        ctx.lineTo(x - arrowSize, y);
        ctx.lineTo(x - arrowSize/2, y + arrowSize/2);
        break;
      case 'right':
        ctx.moveTo(x - arrowSize, y);
        ctx.lineTo(x + arrowSize, y);
        ctx.moveTo(x + arrowSize/2, y - arrowSize/2);
        ctx.lineTo(x + arrowSize, y);
        ctx.lineTo(x + arrowSize/2, y + arrowSize/2);
        break;
    }
    ctx.stroke();
  };

  const redrawControls = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#374151'; // bg-gray-700
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const dpadCenterY = canvas.height / 2;

    // Draw d-pad buttons in gamepad layout
    drawControl(ctx, DPAD_CENTER_X, dpadCenterY - BUTTON_SPACING, 'up', pressedButton === 'up');
    drawControl(ctx, DPAD_CENTER_X - BUTTON_SPACING, dpadCenterY, 'left', pressedButton === 'left');
    drawControl(ctx, DPAD_CENTER_X + BUTTON_SPACING, dpadCenterY, 'right', pressedButton === 'right');
    drawControl(ctx, DPAD_CENTER_X, dpadCenterY + BUTTON_SPACING, 'down', pressedButton === 'down');
  };

  useEffect(() => {
    redrawControls();
  }, [pressedButton]);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Scale coordinates if canvas is rendered at a different size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    const dpadCenterY = canvas.height / 2;

    // Check d-pad buttons
    const upX = DPAD_CENTER_X;
    const upY = dpadCenterY - BUTTON_SPACING;
    if (Math.pow(canvasX - upX, 2) + Math.pow(canvasY - upY, 2) <= Math.pow(BUTTON_RADIUS, 2)) {
      setPressedButton('up');
      onUp();
      return;
    }

    const downX = DPAD_CENTER_X;
    const downY = dpadCenterY + BUTTON_SPACING;
    if (Math.pow(canvasX - downX, 2) + Math.pow(canvasY - downY, 2) <= Math.pow(BUTTON_RADIUS, 2)) {
      setPressedButton('down');
      onDown();
      return;
    }

    const leftX = DPAD_CENTER_X - BUTTON_SPACING;
    const leftY = dpadCenterY;
    if (Math.pow(canvasX - leftX, 2) + Math.pow(canvasY - leftY, 2) <= Math.pow(BUTTON_RADIUS, 2)) {
      setPressedButton('left');
      onLeft();
      return;
    }

    const rightX = DPAD_CENTER_X + BUTTON_SPACING;
    const rightY = dpadCenterY;
    if (Math.pow(canvasX - rightX, 2) + Math.pow(canvasY - rightY, 2) <= Math.pow(BUTTON_RADIUS, 2)) {
      setPressedButton('right');
      onRight();
      return;
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={() => setPressedButton(null)}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="bg-gray-700 touch-none rounded-lg max-w-full"
    />
  );
}
