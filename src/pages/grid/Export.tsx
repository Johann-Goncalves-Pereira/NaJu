import { useCallback, useMemo, useRef } from 'react'

import { useNavigate } from '@tanstack/react-router'
import { Download } from 'lucide-react'

import { type CellColor, useCurrentProject, useGridCells } from '@/stores/projectStore'

import GridNavigation from '@components/grid/GridNavigation'

/**
 * Export page - Shows grid with coordinates and allows SVG export
 */
export default function ExportPage() {
	const navigate = useNavigate()
	const project = useCurrentProject()
	const cells = useGridCells()
	const svgRef = useRef<SVGSVGElement>(null)

	// Generate letter labels (A, B, C, ... Z, AA, AB, ...)
	const getColumnLabel = useCallback((index: number): string => {
		let label = ''
		let i = index
		while (i >= 0) {
			label = String.fromCharCode(65 + (i % 26)) + label
			i = Math.floor(i / 26) - 1
		}
		return label
	}, [])

	// Get color hex by ID
	const colorMap = useMemo(() => {
		if (!project) return new Map<string, string>()
		return new Map(project.colors.map((c: CellColor) => [c.id, c.hex]))
	}, [project])

	// Generate SVG content for download
	const generateSVG = useCallback(() => {
		if (!project) return ''

		const cellSize = project.cellSize
		const labelSize = 20
		const padding = 10
		const width = project.cols * cellSize + labelSize + padding * 2
		const height = project.rows * cellSize + labelSize + padding * 2

		let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    .label { font-family: system-ui, sans-serif; font-size: 10px; fill: #71717a; }
    .cell { stroke: #e4e4e7; stroke-width: 1; }
  </style>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  
  <!-- Column labels -->
`

		// Column labels
		for (let c = 0; c < project.cols; c++) {
			const x = labelSize + padding + c * cellSize + cellSize / 2
			const y = padding + 12
			svg += `  <text x="${x}" y="${y}" class="label" text-anchor="middle">${getColumnLabel(c)}</text>\n`
		}

		svg += `\n  <!-- Row labels -->\n`

		// Row labels
		for (let r = 0; r < project.rows; r++) {
			const x = padding + labelSize / 2
			const y = labelSize + padding + r * cellSize + cellSize / 2 + 4
			svg += `  <text x="${x}" y="${y}" class="label" text-anchor="middle">${r + 1}</text>\n`
		}

		svg += `\n  <!-- Grid cells -->\n`

		// Grid cells
		cells.forEach(cell => {
			const x = labelSize + padding + cell.col * cellSize
			const y = labelSize + padding + cell.row * cellSize
			const fill = cell.colorId ? (colorMap.get(cell.colorId) ?? '#ffffff') : '#ffffff'
			svg += `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}" class="cell"/>\n`
		})

		svg += `</svg>`

		return svg
	}, [cells, colorMap, getColumnLabel, project])

	const handleDownload = useCallback(() => {
		if (!project) return

		const svgContent = generateSVG()
		const blob = new Blob([svgContent], { type: 'image/svg+xml' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-${project.rows}x${project.cols}.svg`
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	}, [generateSVG, project])

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

	const cellSize = project.cellSize
	const labelSize = 24
	const gridWidth = project.cols * cellSize
	const gridHeight = project.rows * cellSize

	return (
		<main className='flex h-dvh w-full flex-col items-center justify-start gap-6 overflow-auto p-6'>
			<GridNavigation />

			<section className='flex w-full max-w-4xl flex-col gap-6'>
				<header className='flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-semibold text-zinc-800 dark:text-zinc-100'>Export</h1>
						<p className='mt-1 text-zinc-500 dark:text-zinc-400'>
							{project.name} • {project.rows}×{project.cols}
						</p>
					</div>

					<button
						onClick={handleDownload}
						className='flex touch-manipulation items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-white transition-transform active:scale-95 dark:bg-zinc-100 dark:text-zinc-900'
						type='button'
					>
						<Download size={20} />
						<span>Download SVG</span>
					</button>
				</header>

				{/* Grid with coordinates */}
				<div className='flex justify-center overflow-auto rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-800'>
					<div className='inline-block'>
						<svg
							ref={svgRef}
							width={gridWidth + labelSize}
							height={gridHeight + labelSize}
							viewBox={`0 0 ${gridWidth + labelSize} ${gridHeight + labelSize}`}
							className='max-w-full'
						>
							{/* Column labels */}
							{Array.from({ length: project.cols }, (_, c) => c).map(c => (
								<text
									key={`col-label-${getColumnLabel(c)}`}
									x={labelSize + c * cellSize + cellSize / 2}
									y={16}
									textAnchor='middle'
									className='fill-zinc-400 text-[10px] dark:fill-zinc-500'
									style={{ fontFamily: 'system-ui, sans-serif' }}
								>
									{getColumnLabel(c)}
								</text>
							))}

							{/* Row labels */}
							{Array.from({ length: project.rows }, (_, r) => r).map(r => (
								<text
									key={`row-label-${r + 1}`}
									x={labelSize / 2}
									y={labelSize + r * cellSize + cellSize / 2 + 4}
									textAnchor='middle'
									className='fill-zinc-400 text-[10px] dark:fill-zinc-500'
									style={{ fontFamily: 'system-ui, sans-serif' }}
								>
									{r + 1}
								</text>
							))}

							{/* Grid cells */}
							{cells.map(cell => {
								const x = labelSize + cell.col * cellSize
								const y = labelSize + cell.row * cellSize
								const fill = cell.colorId ? (colorMap.get(cell.colorId) ?? '#ffffff') : '#ffffff'
								return (
									<rect
										key={`${cell.row}-${cell.col}`}
										x={x}
										y={y}
										width={cellSize}
										height={cellSize}
										fill={fill as string}
										stroke='#e4e4e7'
										strokeWidth={1}
										className='dark:stroke-zinc-600'
									/>
								)
							})}
						</svg>
					</div>
				</div>

				{/* Color legend */}
				<div className='rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-800'>
					<h3 className='mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400'>
						Color Legend
					</h3>
					<div className='flex flex-wrap gap-3'>
						{project.colors.map((color: CellColor) => {
							// Count cells with this color
							const count = cells.filter(c => c.colorId === color.id).length
							return (
								<div key={color.id} className='flex items-center gap-2'>
									<div
										className='h-6 w-6 rounded border border-zinc-200 dark:border-zinc-600'
										style={{ backgroundColor: color.hex }}
									/>
									<span className='text-sm text-zinc-600 dark:text-zinc-400'>
										{color.name} ({count})
									</span>
								</div>
							)
						})}
					</div>
				</div>

				{/* Statistics */}
				<div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
					<StatCard label='Total Cells' value={project.rows * project.cols} />
					<StatCard label='Filled Cells' value={cells.filter(c => c.colorId !== null).length} />
					<StatCard label='Colors Used' value={project.colors.length} />
					<StatCard label='Cell Size' value={`${project.cellSize}px`} />
				</div>
			</section>
		</main>
	)
}

function StatCard({ label, value }: { label: string; value: string | number }) {
	return (
		<div className='rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-800'>
			<p className='text-sm text-zinc-500 dark:text-zinc-400'>{label}</p>
			<p className='text-2xl font-semibold text-zinc-800 dark:text-zinc-100'>{value}</p>
		</div>
	)
}
