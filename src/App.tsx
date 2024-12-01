import { useEffect, useState, useCallback } from "react"
import { cn } from "./utils.ts"
import React from "react"

interface Drop {
  baseColor: string
  length: number
  position: number
}

interface ColumnState {
  drops: Drop[]
  cooldown: number
  pattern: number
}

interface GridProps {
  rows?: number
  cols?: number
}

export default function App({ rows = 15, cols = 20 }: GridProps) {
  const [columns, setColumns] = useState<ColumnState[]>(() => 
    Array(cols).fill(null).map(() => ({
      drops: [],
      cooldown: 0,
      pattern: Math.random() * 10
    }))
  )

  const baseColors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-cyan-500",
    "bg-red-500",
    "bg-orange-500",
    "bg-emerald-500",
    "bg-indigo-500",
    "bg-fuchsia-500",
    "bg-rose-500",
  ]

  const shouldCreateDrop = useCallback((columnState: ColumnState, neighborStates: ColumnState[]) => {
    if (columnState.cooldown > 0) return false
    
    const neighborDensity = neighborStates.reduce((sum, state) => 
      sum + state.drops.length, 0) / neighborStates.length
    
    const baseProbability = 0.08
    const patternMultiplier = Math.sin(columnState.pattern + Date.now() / 1000) * 0.5 + 0.5
    const densityFactor = Math.max(0, 1 - neighborDensity / 3)
    
    return Math.random() < (baseProbability * patternMultiplier * densityFactor)
  }, [])

  useEffect(() => {
    const updateRain = () => {
      setColumns(prevColumns => {
        return prevColumns.map((column, idx) => {
          const neighbors = [
            idx > 0 ? prevColumns[idx - 1] : null,
            idx < cols - 1 ? prevColumns[idx + 1] : null,
          ].filter(Boolean) as ColumnState[]

          let updatedColumn = { ...column }
          
          if (updatedColumn.cooldown > 0) {
            updatedColumn.cooldown--
          }

          updatedColumn.drops = updatedColumn.drops
            .map(drop => ({ ...drop, position: drop.position + 1 }))
            .filter(drop => drop.position - drop.length < rows)

          if (shouldCreateDrop(column, neighbors)) {
            updatedColumn.drops.push({
              baseColor: baseColors[Math.floor(Math.random() * baseColors.length)],
              length: Math.floor(Math.random() * 10) + 1,
              position: 0
            })
            updatedColumn.cooldown = Math.floor(Math.random() * 10) + 5
          }

          updatedColumn.pattern += 0.1

          return updatedColumn
        })
      })
    }

    const intervalId = setInterval(updateRain, 100)
    return () => clearInterval(intervalId)
  }, [rows, cols, baseColors, shouldCreateDrop])

  // Create visual grid with gradient effect for each drop
  const grid = Array(rows).fill(null).map((_, row) =>
    Array(cols).fill(null).map((_, col) => {
      const drops = columns[col].drops
      const activeDrop = drops.find(drop => 
        row >= drop.position - drop.length && row <= drop.position
      )
      
      if (activeDrop) {
        const positionInDrop = row - (activeDrop.position - activeDrop.length)
        const opacity = 1 - (positionInDrop / activeDrop.length)
        // Create opacity classes for gradient effect
        const opacityClass = opacity >= 0.8 ? "opacity-100" :
                           opacity >= 0.6 ? "opacity-80" :
                           opacity >= 0.4 ? "opacity-60" :
                           opacity >= 0.2 ? "opacity-40" :
                           "opacity-20"
        return `${activeDrop.baseColor} ${opacityClass}`
      }
      return ""
    })
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black p-4">
      <div className="rounded-lg bg-gray-800/30 backdrop-blur-sm p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          FOG Gaming
        </h1>
        <div 
          className="grid gap-1 rounded-lg border-4 border-gray-600/30 bg-black/95 p-4 shadow-inner" 
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: 'fit-content'
          }}
        >
          {grid.map((row, i) => 
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={cn(
                  "aspect-square w-6 rounded-sm transition-all duration-300",
                  cell || "bg-gray-900/90"
                )}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

