import { useMemo } from 'react'

import { useCurrentProject } from '@/stores/projectStore'

/**
 * Grid preview component for size configuration page
 * Shows a miniature version of the grid
 */
export default function GridPreview() {
	const project = useCurrentProject()

	const { cells, maxPreviewSize, cellSizePreview } = useMemo(() => {
		if (!project) return { cells: [], maxPreviewSize: 0, cellSizePreview: 0 }

		const maxSize = 200
		const cellSize = Math.min(maxSize / Math.max(project.rows, project.cols), project.cellSize)

		const previewCells: { row: number; col: number }[] = []
		for (let r = 0; r < project.rows; r++) {
			for (let c = 0; c < project.cols; c++) {
				previewCells.push({ row: r, col: c })
			}
		}

		return {
			cells: previewCells,
			maxPreviewSize: maxSize,
			cellSizePreview: Math.max(4, cellSize),
		}
	}, [project])

	if (!project) return null

	return (
		<div
			className='grid gap-px rounded-lg bg-zinc-200 p-1 dark:bg-zinc-600'
			style={{
				gridTemplateRows: `repeat(${project.rows}, ${cellSizePreview}px)`,
				gridTemplateColumns: `repeat(${project.cols}, ${cellSizePreview}px)`,
				maxWidth: maxPreviewSize,
				maxHeight: maxPreviewSize,
			}}
			role='img'
			aria-label={`Grid preview: ${project.rows} rows by ${project.cols} columns`}
		>
			{cells.map(cell => (
				<div
					key={`${cell.row}-${cell.col}`}
					className='rounded-sm bg-white dark:bg-zinc-800'
					style={{
						width: cellSizePreview,
						height: cellSizePreview,
					}}
				/>
			))}
		</div>
	)
}
