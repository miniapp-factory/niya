"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const GRID_SIZE = 4;
const TILE_VALUES = [2, 4];
const TILE_PROBABILITIES = [0.9, 0.1];

function randomTileValue() {
  return Math.random() < TILE_PROBABILITIES[0] ? TILE_VALUES[0] : TILE_VALUES[1];
}

function cloneGrid(grid: number[][]) {
  return grid.map(row => [...row]);
}

export default function Game2048() {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Spawn initial two tiles
  useEffect(() => {
    spawnTile();
    spawnTile();
  }, []);

  // Add key listeners for arrow keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case "ArrowUp":
          move("up");
          break;
        case "ArrowDown":
          move("down");
          break;
        case "ArrowLeft":
          move("left");
          break;
        case "ArrowRight":
          move("right");
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [grid, gameOver]);

  const spawnTile = () => {
    const empty: [number, number][] = [];
    grid.forEach((row, r) => row.forEach((cell, c) => {
      if (cell === 0) empty.push([r, c]);
    }));
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    const newGrid = cloneGrid(grid);
    newGrid[r][c] = randomTileValue();
    setGrid(newGrid);
  };

  const move = (direction: "up" | "down" | "left" | "right") => {
    const rotated = rotateGrid(grid, direction);
    const moved = moveLeft(rotated);
    const restored = rotateGrid(moved, opposite(direction));
    if (!gridsEqual(grid, restored)) {
      setGrid(restored);
      spawnTile();
      if (checkGameOver(restored)) setGameOver(true);
    }
  };

  const rotateGrid = (g: number[][], dir: string) => {
    const n = g.length;
    const res = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (dir === "up") res[c][n - 1 - r] = g[r][c];
        if (dir === "down") res[n - 1 - c][r] = g[r][c];
        if (dir === "left") res[r][c] = g[r][c];
        if (dir === "right") res[n - 1 - r][n - 1 - c] = g[r][c];
      }
    }
    return res;
  };

  const opposite = (dir: string) => {
    switch (dir) {
      case "up": return "down";
      case "down": return "up";
      case "left": return "right";
      case "right": return "left";
    }
  };

  const moveLeft = (g: number[][]) => {
    const newGrid = g.map(row => {
      const filtered = row.filter(v => v !== 0);
      const merged: number[] = [];
      let i = 0;
      while (i < filtered.length) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
          merged.push(filtered[i] * 2);
          setScore(s => s + filtered[i] * 2);
          i += 2;
        } else {
          merged.push(filtered[i]);
          i += 1;
        }
      }
      while (merged.length < GRID_SIZE) merged.push(0);
      return merged;
    });
    return newGrid;
  };

  const gridsEqual = (a: number[][], b: number[][]) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (a[r][c] !== b[r][c]) return false;
      }
    }
    return true;
  };

  const checkGameOver = (g: number[][]) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) return false;
        if (c + 1 < GRID_SIZE && g[r][c] === g[r][c + 1]) return false;
        if (r + 1 < GRID_SIZE && g[r][c] === g[r + 1][c]) return false;
      }
    }
    return true;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {grid.flat().map((val, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center h-12 w-12 rounded-md text-xl font-bold ${
              val === 0
                ? "bg-gray-200 text-gray-500"
                : val < 8
                ? "bg-yellow-200 text-yellow-800"
                : val < 16
                ? "bg-yellow-300 text-yellow-900"
                : val < 32
                ? "bg-orange-200 text-orange-800"
                : val < 64
                ? "bg-orange-300 text-orange-900"
                : val < 128
                ? "bg-red-200 text-red-800"
                : val < 256
                ? "bg-red-300 text-red-900"
                : val < 512
                ? "bg-purple-200 text-purple-800"
                : val < 1024
                ? "bg-purple-300 text-purple-900"
                : "bg-indigo-200 text-indigo-800"
            }`}
          >
            {val !== 0 ? val : null}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => move("up")} aria-label="Move up">↑</Button>
        <Button onClick={() => move("down")} aria-label="Move down">↓</Button>
        <Button onClick={() => move("left")} aria-label="Move left">←</Button>
        <Button onClick={() => move("right")} aria-label="Move right">→</Button>
      </div>
      <div className="text-lg">Score: {score}</div>
      {gameOver && (
        <Share text={`I scored ${score} points in 2048! ${url}`} />
      )}
    </div>
  );
}
