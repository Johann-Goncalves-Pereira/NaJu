import { useMemo } from 'react'

import { useCurrentProject } from '@/stores/projectStore'

/**
 * Grid preview component for size configuration page
 * Shows a miniature version of the grid
 */
export default function GridPreview() {
	const project = useCurrentProject()

	const { cells, cellSizePreview } = useMemo(() => {
		if (!project) return { cells: [], cellSizePreview: 0 }

		const cellSize = project.cellSize

		const previewCells: { row: number; col: number }[] = []
		for (let r = 0; r < project.rows; r++) {
			for (let c = 0; c < project.cols; c++) {
				previewCells.push({ row: r, col: c })
			}
		}

		return {
			cells: previewCells,
			cellSizePreview: Math.max(4, cellSize),
		}
	}, [project])

	if (!project) return null

	return (
		<div
			className='grid gap-px overflow-auto rounded-lg bg-zinc-200 p-1 dark:bg-zinc-600'
			style={{
				gridTemplateRows: `repeat(${project.rows}, ${cellSizePreview}px)`,
				gridTemplateColumns: `repeat(${project.cols}, ${cellSizePreview}px)`,
			}}
			role='img'
			aria-label={`Prévia da grade: ${project.rows} linhas por ${project.cols} colunas`}
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
