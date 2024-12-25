class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.setupControls();
        this.reset();
    }

    setupCanvas() {
        // Make canvas size responsive
        const updateCanvasSize = () => {
            const maxSize = Math.min(window.innerWidth - 20, 600);
            this.canvas.width = maxSize;
            this.canvas.height = maxSize;
            this.gridSize = Math.floor(maxSize / 20);
        };
        
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.handleInput(e.key);
        });

        // Touch controls
        const buttons = ['upBtn', 'leftBtn', 'rightBtn', 'downBtn'];
        const directions = ['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'];
        
        buttons.forEach((btnId, index) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                ['touchstart', 'mousedown'].forEach(eventType => {
                    btn.addEventListener(eventType, (e) => {
                        e.preventDefault();
                        this.handleInput(directions[index]);
                    });
                });
            }
        });

        // Swipe controls
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) this.handleInput('ArrowRight');
                else this.handleInput('ArrowLeft');
            } else {
                if (dy > 0) this.handleInput('ArrowDown');
                else this.handleInput('ArrowUp');
            }
        });
    }

    reset() {
        // Initialize game state
        this.snake = [{x: 10, y: 10}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.speed = 150;
        
        // Start game loop
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    // Game logic to be implemented in step 002
    handleInput(key) {
        const opposites = {
            'ArrowUp': 'ArrowDown',
            'ArrowDown': 'ArrowUp',
            'ArrowLeft': 'ArrowRight',
            'ArrowRight': 'ArrowLeft'
        };

        let newDirection;
        switch(key) {
            case 'ArrowUp': newDirection = 'up'; break;
            case 'ArrowDown': newDirection = 'down'; break;
            case 'ArrowLeft': newDirection = 'left'; break;
            case 'ArrowRight': newDirection = 'right'; break;
            default: return;
        }

        // Prevent 180-degree turns
        if (opposites[key] !== this.direction) {
            this.nextDirection = newDirection;
        }
    }

    generateFood() {
        while (true) {
            const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
            const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
            
            // Check if the food spawns on the snake
            if (!this.snake.some(segment => segment.x === x && segment.y === y)) {
                return {x, y};
            }
        }
    }

    update() {
        if (this.gameOver) return;

        // Update direction
        this.direction = this.nextDirection;

        // Calculate new head position
        const head = {...this.snake[0]};
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check wall collision
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver = true;
            return;
        }

        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver = true;
            return;
        }

        // Add new head
        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('score').textContent = `Score: ${this.score}`;
            this.food = this.generateFood();
            // Increase speed
            if (this.speed > 50) {
                this.speed -= 2;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }
        } else {
            // Remove tail if no food was eaten
            this.snake.pop();
        }

        // Draw everything
        this.draw();
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });

        // Draw food
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );

        // Draw game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText(
                'Press Space to Restart',
                this.canvas.width / 2,
                this.canvas.height / 2 + 40
            );

            // Add space key listener for restart
            const restartHandler = (e) => {
                if (e.key === ' ') {
                    document.removeEventListener('keydown', restartHandler);
                    this.reset();
                }
            };
            document.addEventListener('keydown', restartHandler);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
