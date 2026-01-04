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
			className='grid content-start gap-0'
			role='grid'
			style={{
				gridTemplateRows,
				gridTemplateColumns: gridTemplateCols,
			}}
			aria-rowcount={rows}
			aria-colcount={cols}
		>
			{cells.map(cell => (
				<div
					key={cell.id}
					role='gridcell'
					aria-label={`Cell ${cell.row + 1}, ${cell.col + 1}`}
					className='bg-white outline outline-zinc-200'
					style={{
						width: cellSize,
						height: cellSize,
					}}
				>
					{/* optional small label */}
				</div>
			))}
		</div>
	)
}
