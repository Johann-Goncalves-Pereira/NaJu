type GridProps = {
	rows: number
	cols: number
	cells: { id: string; row: number; col: number }[]
}

export default function Grid({ rows, cols, cells }: GridProps) {
	const cellSize = 24
	const gridTemplateRows = `repeat(${rows}, ${cellSize}px)`
	const gridTemplateCols = `repeat(${cols}, ${cellSize}px)`

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateRows,
				gridTemplateColumns: gridTemplateCols,
				gap: 4,
				alignContent: 'start',
			}}
			role='grid'
			aria-rowcount={rows}
			aria-colcount={cols}
		>
			{cells.map(cell => (
				<div
					key={cell.id}
					role='gridcell'
					aria-label={`Cell ${cell.row + 1}, ${cell.col + 1}`}
					style={{
						width: cellSize,
						height: cellSize,
						background: 'linear-gradient(180deg, #fff, #f3f4f6)',
						border: '1px solid rgba(0,0,0,0.08)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 10,
						color: '#111827',
						userSelect: 'none',
					}}
				>
					{/* optional small label */}
				</div>
			))}
		</div>
	)
}
