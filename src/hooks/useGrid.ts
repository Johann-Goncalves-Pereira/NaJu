import { useCallback, useMemo, useState } from 'react'

export type Cell = {
	row: number
	col: number
	id: string
}

export default function useGrid(initialRows = 12, initialCols = 12) {
	const [rows, setRows] = useState(() => Math.max(1, Math.floor(initialRows)))
	const [cols, setCols] = useState(() => Math.max(1, Math.floor(initialCols)))

	const setSize = useCallback((newRows: number, newCols: number) => {
		setRows(() => Math.max(1, Math.floor(newRows)))
		setCols(() => Math.max(1, Math.floor(newCols)))
	}, [])

	const cells: Cell[] = useMemo(() => {
		const out: Cell[] = []
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				out.push({ row: r, col: c, id: `${r}-${c}` })
			}
		}
		return out
	}, [rows, cols])

	return {
		rows,
		cols,
		setRows,
		setCols,
		setSize,
		cells,
	} as const
}
