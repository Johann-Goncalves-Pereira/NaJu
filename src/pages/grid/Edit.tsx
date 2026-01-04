import { useCallback, useMemo, useRef, useState } from 'react'

import { useNavigate } from '@tanstack/react-router'
import { Eraser, Redo, Trash2, Undo } from 'lucide-react'

import {
	type CellColor,
	useCurrentProject,
	useGridCells,
	useProjectStore,
} from '@/stores/projectStore'

import GridNavigation from '@components/grid/GridNavigation'

/**
 * Edit page - Main drawing interface
 * Touchscreen-friendly with support for drag painting
 */
export default function EditPage() {
	const navigate = useNavigate()
	const project = useCurrentProject()
	const cells = useGridCells()
	const { setCellColor, clearGrid } = useProjectStore()

	const [selectedColorId, setSelectedColorId] = useState<string | null>(null)
	const [isErasing, setIsErasing] = useState(false)
	const [isPainting, setIsPainting] = useState(false)

	// History for undo/redo
	const [history, setHistory] = useState<Record<string, string | null>[]>([])
	const [historyIndex, setHistoryIndex] = useState(-1)

	const gridRef = useRef<HTMLDivElement>(null)

	// Get color hex by ID
	const colorMap = useMemo(() => {
		if (!project) return new Map<string, string>()
		return new Map(project.colors.map((c: CellColor) => [c.id, c.hex]))
	}, [project])

	const saveToHistory = useCallback(() => {
		if (!project) return
		const currentState = { ...project.cells }
		setHistory(prev => {
			const newHistory = prev.slice(0, historyIndex + 1)
			newHistory.push(currentState)
			return newHistory.slice(-50) // Keep last 50 states
		})
		setHistoryIndex(prev => Math.min(prev + 1, 49))
	}, [historyIndex, project])

	const handleCellInteraction = useCallback(
		(row: number, col: number) => {
			if (!project) return
			const colorId = isErasing ? null : selectedColorId
			setCellColor(row, col, colorId)
		},
		[isErasing, project, selectedColorId, setCellColor],
	)

	const handlePointerDown = useCallback(
		(row: number, col: number) => {
			saveToHistory()
			setIsPainting(true)
			handleCellInteraction(row, col)
		},
		[handleCellInteraction, saveToHistory],
	)

	const handlePointerMove = useCallback(
		(e: React.PointerEvent, row: number, col: number) => {
			if (!isPainting) return
			// Handle drag painting
			e.preventDefault()
			handleCellInteraction(row, col)
		},
		[handleCellInteraction, isPainting],
	)

	const handlePointerUp = useCallback(() => {
		setIsPainting(false)
	}, [])

	const handleUndo = useCallback(() => {
		if (historyIndex < 0 || !project) return
		const prevState = history[historyIndex]
		if (prevState) {
			// Clear current and restore
			Object.keys(project.cells).forEach(key => {
				const [row, col] = key.split('-').map(Number)
				setCellColor(row, col, null)
			})
			Object.entries(prevState).forEach(([key, colorId]) => {
				const [row, col] = key.split('-').map(Number)
				setCellColor(row, col, colorId)
			})
			setHistoryIndex(prev => prev - 1)
		}
	}, [history, historyIndex, project, setCellColor])

	const handleRedo = useCallback(() => {
		if (historyIndex >= history.length - 1) return
		const nextState = history[historyIndex + 1]
		if (nextState && project) {
			Object.keys(project.cells).forEach(key => {
				const [row, col] = key.split('-').map(Number)
				setCellColor(row, col, null)
			})
			Object.entries(nextState).forEach(([key, colorId]) => {
				const [row, col] = key.split('-').map(Number)
				setCellColor(row, col, colorId)
			})
			setHistoryIndex(prev => prev + 1)
		}
	}, [history, historyIndex, project, setCellColor])

	const handleClearGrid = useCallback(() => {
		if (window.confirm('Clear all cells?')) {
			saveToHistory()
			clearGrid()
		}
	}, [clearGrid, saveToHistory])

	const handleSelectColor = useCallback((colorId: string) => {
		setSelectedColorId(colorId)
		setIsErasing(false)
	}, [])

	const handleToggleEraser = useCallback(() => {
		setIsErasing(prev => !prev)
		if (!isErasing) setSelectedColorId(null)
	}, [isErasing])

	if (!project) {
		return (
			<main className='flex h-dvh w-full items-center justify-center'>
				<div className='text-center'>
					<p className='text-lg text-zinc-500'>No project selected</p>
					<button
						onClick={() => navigate({ to: '/grid' })}
						className='mt-4 rounded-xl bg-zinc-900 px-6 py-3 text-white dark:bg-zinc-100 dark:text-zinc-900'
						type='button'
					>
						Go to Projects
					</button>
				</div>
			</main>
		)
	}

	return (
		<main
			className='flex h-dvh min-h-0 w-full flex-col items-center justify-start gap-4 overflow-auto p-4'
			onPointerUp={handlePointerUp}
			onPointerLeave={handlePointerUp}
		>
			<GridNavigation />

			{/* Toolbar */}
			<div className='flex w-full max-w-4xl items-center justify-between gap-4'>
				<div className='flex items-center gap-2'>
					<button
						onClick={handleUndo}
						disabled={historyIndex < 0}
						className='flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl bg-white text-zinc-700 shadow-sm transition-transform active:scale-95 disabled:opacity-30 dark:bg-zinc-800 dark:text-zinc-300'
						type='button'
						aria-label='Undo'
					>
						<Undo size={20} />
					</button>
					<button
						onClick={handleRedo}
						disabled={historyIndex >= history.length - 1}
						className='flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl bg-white text-zinc-700 shadow-sm transition-transform active:scale-95 disabled:opacity-30 dark:bg-zinc-800 dark:text-zinc-300'
						type='button'
						aria-label='Redo'
					>
						<Redo size={20} />
					</button>
				</div>

				<div className='flex items-center gap-2'>
					<button
						onClick={handleToggleEraser}
						className={`flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl shadow-sm transition-all active:scale-95 ${
							isErasing
								? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
								: 'bg-white text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
						}`}
						type='button'
						aria-label='Eraser'
						aria-pressed={isErasing}
					>
						<Eraser size={20} />
					</button>
					<button
						onClick={handleClearGrid}
						className='flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl bg-white text-zinc-700 shadow-sm transition-transform active:scale-95 dark:bg-zinc-800 dark:text-zinc-300'
						type='button'
						aria-label='Clear grid'
					>
						<Trash2 size={20} />
					</button>
				</div>
			</div>

			{/* Grid */}
			<div className='flex min-h-0 flex-1 items-start justify-center overflow-auto py-1'>
				<div
					ref={gridRef}
					className='grid gap-px rounded-lg bg-zinc-200 p-px dark:bg-zinc-700'
					style={{
						gridTemplateRows: `repeat(${project.rows}, ${project.cellSize}px)`,
						gridTemplateColumns: `repeat(${project.cols}, ${project.cellSize}px)`,
						touchAction: isPainting ? 'none' : 'pan-x pan-y', // Allow panning when not painting
					}}
					role='grid'
					aria-label='Drawing grid'
				>
					{cells.map(cell => {
						const bgColor = cell.colorId ? (colorMap.get(cell.colorId) ?? '#ffffff') : '#ffffff'
						return (
							<div
								key={`${cell.row}-${cell.col}`}
								role='gridcell'
								aria-label={`Cell ${cell.row + 1}, ${cell.col + 1}`}
								className='cursor-pointer rounded-sm outline outline-zinc-300 transition-colors'
								style={{
									width: project.cellSize,
									height: project.cellSize,
									backgroundColor: bgColor as string,
								}}
								onPointerDown={() => handlePointerDown(cell.row, cell.col)}
								onPointerEnter={e => handlePointerMove(e, cell.row, cell.col)}
							/>
						)
					})}
				</div>
			</div>

			{/* Color palette */}
			<div className='flex w-full max-w-4xl flex-wrap items-center justify-center gap-2 rounded-xl bg-white p-3 shadow-sm dark:bg-zinc-800'>
				{project.colors.map((color: CellColor) => (
					<button
						key={color.id}
						onClick={() => handleSelectColor(color.id)}
						className={`h-12 w-12 touch-manipulation rounded-xl border-2 transition-all active:scale-95 sm:h-14 sm:w-14 ${
							selectedColorId === color.id && !isErasing
								? 'border-zinc-900 ring-2 ring-zinc-900 ring-offset-2 dark:border-zinc-100 dark:ring-zinc-100'
								: 'border-zinc-200 dark:border-zinc-600'
						}`}
						style={{ backgroundColor: color.hex }}
						type='button'
						aria-label={color.name}
						aria-pressed={selectedColorId === color.id && !isErasing}
						title={color.name}
					/>
				))}
			</div>
		</main>
	)
}
