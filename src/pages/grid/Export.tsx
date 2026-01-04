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

	// Contrast helpers: convert hex -> luminance -> readable text colors
	const hexToRgb = useCallback((hex: string) => {
		hex = hex.replace('#', '')
		if (hex.length === 3)
			hex = hex
				.split('')
				.map(h => h + h)
				.join('')
		const r = parseInt(hex.substring(0, 2), 16)
		const g = parseInt(hex.substring(2, 4), 16)
		const b = parseInt(hex.substring(4, 6), 16)
		return { r, g, b }
	}, [])

	const getContrastColors = useCallback(
		(hex: string) => {
			try {
				const { r, g, b } = hexToRgb(hex)
				// relative luminance (0..1)
				const sr = r / 255
				const sg = g / 255
				const sb = b / 255
				const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
				const L = 0.2126 * lin(sr) + 0.7152 * lin(sg) + 0.0722 * lin(sb)
				// threshold: pick dark text on bright backgrounds
				if (L > 0.5) {
					return { main: '#111827', sub: '#374151' }
				}
				return { main: '#ffffff', sub: '#e5e7eb' }
			} catch (error) {
				console.warn('Error calculating contrast colors for hex:', hex, error)
				return { main: '#111827', sub: '#374151' }
			}
		},
		[hexToRgb],
	)

	// Generate SVG content for download
	const generateSVG = useCallback(() => {
		if (!project) return ''

		// Visual spacing and rounding to match Edit view
		const gap = 2 // px between cells
		const radius = Math.max(2, Math.floor(project.cellSize * 0.12))
		const cellSize = project.cellSize - gap
		const labelSize = 20
		const padding = 10
		const width = project.cols * (cellSize + gap) + labelSize + padding * 2 - gap
		const height = project.rows * (cellSize + gap) + labelSize + padding * 2 - gap

		let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
	<style>
		/* Use CSS variables to pick up light/dark theme colors when possible */
		:root {
			--coord-fill: #71717a;
			--cell-stroke: #e4e4e7;
			--coord-main-dark: #111827;
			--coord-sub-dark: #374151;
			--coord-main-light: #ffffff;
			--coord-sub-light: #e5e7eb;
		}
		.label { font-family: system-ui, sans-serif; fill: var(--coord-fill); }
		.cell { stroke: var(--cell-stroke); stroke-width: 1; }
		.coord-main { font-family: system-ui, sans-serif; }
		.coord-sub { font-family: system-ui, sans-serif; }
	</style>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  
  <!-- Column labels -->
`

		// Column labels (position centered over each cell)
		for (let c = 0; c < project.cols; c++) {
			const x = labelSize + padding + c * (cellSize + gap) + cellSize / 2
			const y = padding + Math.max(10, Math.round(labelSize * 0.6))
			svg += `  <text x="${x}" y="${y}" class="label" text-anchor="middle">${getColumnLabel(c)}</text>\n`
		}

		svg += `\n  <!-- Row labels -->\n`

		// Row labels (position centered vertically for each row)
		for (let r = 0; r < project.rows; r++) {
			const x = padding + labelSize / 2
			const y =
				labelSize + padding + r * (cellSize + gap) + cellSize / 2 + Math.round(labelSize * 0.16)
			svg += `  <text x="${x}" y="${y}" class="label" text-anchor="middle">${r + 1}</text>\n`
		}

		svg += `\n  <!-- Grid cells -->\n`

		// Grid cells
		cells.forEach(cell => {
			const x = labelSize + padding + cell.col * (cellSize + gap)
			const y = labelSize + padding + cell.row * (cellSize + gap)
			const fill = cell.colorId ? (colorMap.get(cell.colorId) ?? '#ffffff') : '#ffffff'
			// Rounded rect for the cell (provides gap visual)
			svg += `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${radius}" ry="${radius}" fill="${fill}" class="cell"/>\n`

			// Stacked coordinates: column letter above, row number below (centered)
			const colLabel = getColumnLabel(cell.col)
			const centerX = x + cellSize / 2

			// Make font sizes relative to the cellSize
			const mainFont = Math.max(8, Math.round(cellSize * 0.34))
			const subFont = Math.max(7, Math.round(cellSize * 0.24))
			const mainY = y + cellSize / 2 - Math.round(cellSize * 0.12)
			const subY = y + cellSize / 2 + Math.round(cellSize * 0.18)
			const contrasts = getContrastColors(fill)
			svg += `  <text x="${centerX}" y="${mainY}" text-anchor="middle" class="coord-main" fill="${contrasts.main}" font-size="${mainFont}px">${colLabel}</text>\n`
			svg += `  <text x="${centerX}" y="${subY}" text-anchor="middle" class="coord-sub" fill="${contrasts.sub}" font-size="${subFont}px">${cell.row + 1}</text>\n`
		})

		svg += `</svg>`

		return svg
	}, [cells, colorMap, getColumnLabel, getContrastColors, project])

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
					<p className='text-lg text-zinc-500'>Nenhum projeto selecionado</p>
					<button
						onClick={() => navigate({ to: '/grid' })}
						className='mt-4 rounded-xl bg-zinc-900 px-6 py-3 text-white dark:bg-zinc-100 dark:text-zinc-900'
						type='button'
					>
						Ir para projetos
					</button>
				</div>
			</main>
		)
	}

	// Match visual spacing and rounding from Edit view
	const gap = 2
	const radius = Math.max(2, Math.floor(project.cellSize * 0.12))
	const cellSize = project.cellSize - gap
	const labelSize = 24
	const gridWidth = project.cols * (cellSize + gap) - gap
	const gridHeight = project.rows * (cellSize + gap) - gap

	return (
		<main className='flex h-dvh w-full flex-col items-center justify-start gap-6 overflow-auto p-6'>
			<GridNavigation />

			<section className='flex w-full max-w-4xl flex-col gap-6'>
				<header className='flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-semibold text-zinc-800 dark:text-zinc-100'>Exportar</h1>
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
						<span>Baixar SVG</span>
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
									x={labelSize + c * (cellSize + gap) + cellSize / 2}
									y={Math.max(12, Math.round(labelSize * 0.6))}
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
									y={labelSize + r * (cellSize + gap) + cellSize / 2 + Math.round(labelSize * 0.16)}
									textAnchor='middle'
									className='fill-zinc-400 text-[10px] dark:fill-zinc-500'
									style={{ fontFamily: 'system-ui, sans-serif' }}
								>
									{r + 1}
								</text>
							))}

							{/* Grid cells with gap, rounding and stacked coords */}
							{cells.map(cell => {
								const x = labelSize + cell.col * (cellSize + gap)
								const y = labelSize + cell.row * (cellSize + gap)
								const fill = cell.colorId ? (colorMap.get(cell.colorId) ?? '#ffffff') : '#ffffff'
								const colLabel = getColumnLabel(cell.col)
								const contrasts = getContrastColors(fill)
								const mainFont = Math.max(8, Math.round(cellSize * 0.34))
								const subFont = Math.max(7, Math.round(cellSize * 0.24))
								return (
									<g key={`${cell.row}-${cell.col}`}>
										<rect
											x={x}
											y={y}
											width={cellSize}
											height={cellSize}
											rx={radius}
											ry={radius}
											fill={fill as string}
											stroke='#e4e4e7'
											strokeWidth={1}
											className='dark:stroke-zinc-600'
										/>
										<text
											x={x + cellSize / 2}
											y={y + cellSize / 2 - Math.round(cellSize * 0.12)}
											textAnchor='middle'
											style={{
												fontFamily: 'system-ui, sans-serif',
												fill: contrasts.main,
												fontSize: mainFont,
											}}
										>
											{colLabel}
										</text>
										<text
											x={x + cellSize / 2}
											y={y + cellSize / 2 + Math.round(cellSize * 0.18)}
											textAnchor='middle'
											style={{
												fontFamily: 'system-ui, sans-serif',
												fill: contrasts.sub,
												fontSize: subFont,
											}}
										>
											{cell.row + 1}
										</text>
									</g>
								)
							})}
						</svg>
					</div>
				</div>

				{/* Color legend */}
				<div className='rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-800'>
					<h3 className='mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400'>
						Legenda de cores
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
					<StatCard label='Total de células' value={project.rows * project.cols} />
					<StatCard
						label='Células preenchidas'
						value={cells.filter(c => c.colorId !== null).length}
					/>
					<StatCard label='Cores usadas' value={project.colors.length} />
					<StatCard label='Tamanho da célula' value={`${project.cellSize}px`} />
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
