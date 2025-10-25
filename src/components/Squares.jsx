import { useRef, useEffect } from 'react';
import './Squares.css';

const Squares = ({
  direction = 'right',
  speed = 1,
  borderColor = '#999',
  squareSize = 64,
  hoverFillColor = '#67c0d2',
  colorA = '#67C0D2',
  colorB = '#111',
  className = ''
}) => {
  const canvasRef = useRef(null);
  const numSquaresX = useRef();
  const numSquaresY = useRef();
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquare = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvas.offsetWidth;
      const cssHeight = canvas.offsetHeight;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      numSquaresX.current = Math.ceil(cssWidth / squareSize) + 1;
      numSquaresY.current = Math.ceil(cssHeight / squareSize) + 1;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      const cssWidth = canvas.offsetWidth;
      const cssHeight = canvas.offsetHeight;
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      const bayer = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
      ];

      for (let x = startX; x < cssWidth + squareSize; x += squareSize) {
        for (let y = startY; y < cssHeight + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.current.x % squareSize);
          const squareY = y - (gridOffset.current.y % squareSize);

          const i = Math.floor((x - startX) / squareSize);
          const j = Math.floor((y - startY) / squareSize);

          const tRaw = (squareY + squareSize / 2) / cssHeight;
          const darkPortion = 0.32;
          const t = Math.min(Math.max((tRaw - (1 - darkPortion)) / darkPortion, 0), 1);

          const threshold = (bayer[j % 4][i % 4] + 0.5) / 16;

          if (tRaw < 1 - darkPortion) {
            ctx.fillStyle = colorA;
          } else {
            ctx.fillStyle = t > threshold ? colorB : colorA;
          }
          ctx.fillRect(squareX, squareY, squareSize, squareSize);

          if (
            hoveredSquare.current &&
            i === hoveredSquare.current.x &&
            j === hoveredSquare.current.y
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }
        }
      }
    };

    const handleMouseMove = event => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      let hoveredSquareX = Math.floor((mouseX + gridOffset.current.x - startX) / squareSize);
      let hoveredSquareY = Math.floor((mouseY + gridOffset.current.y - startY) / squareSize);

      if (typeof numSquaresX.current === 'number') {
        hoveredSquareX = Math.max(0, Math.min(hoveredSquareX, numSquaresX.current - 1));
      }
      if (typeof numSquaresY.current === 'number') {
        hoveredSquareY = Math.max(0, Math.min(hoveredSquareY, numSquaresY.current - 1));
      }

      if (
        !hoveredSquare.current ||
        hoveredSquare.current.x !== hoveredSquareX ||
        hoveredSquare.current.y !== hoveredSquareY
      ) {
        hoveredSquare.current = { x: hoveredSquareX, y: hoveredSquareY };
      }
    };

    const handleMouseLeave = () => {
      hoveredSquare.current = null;
    };

    gridOffset.current = { x: 0, y: 0 };
    drawGrid();

    const mouseMoveWrapper = event => {
      handleMouseMove(event);
      drawGrid();
    };

    const mouseLeaveWrapper = () => {
      handleMouseLeave();
      drawGrid();
    };

    canvas.addEventListener('mousemove', mouseMoveWrapper);
    canvas.addEventListener('mouseleave', mouseLeaveWrapper);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', mouseMoveWrapper);
      canvas.removeEventListener('mouseleave', mouseLeaveWrapper);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize, colorA, colorB]);

  return <canvas ref={canvasRef} className={`squares-canvas ${className}`}></canvas>;
};

export default Squares;
