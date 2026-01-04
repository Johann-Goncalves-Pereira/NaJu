import { useCallback } from 'react'

import Grid from '../components/Grid'
import useGrid from '../hooks/useGrid'

export default function Home() {
	const { rows, cols, setRows, setCols, setSize, cells } = useGrid(12, 12)

	const updateRows = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const v = Math.max(1, Number(e.target.value || 0))
			setRows(v)
		},
		[setRows],
	)

	const updateCols = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const v = Math.max(1, Number(e.target.value || 0))
			setCols(v)
		},
		[setCols],
	)

	return (
		<main className='flex h-dvh w-full flex-col items-center justify-start gap-6 p-6'>
			<section className='flex w-full max-w-3xl flex-col gap-4'>
				<div className='flex items-center justify-between gap-4'>
					<div className='flex items-center gap-3'>
						<label className='flex items-center gap-2'>
							<span className='text-sm'>Rows</span>
							<input
								type='number'
								min={1}
								value={rows}
								onChange={updateRows}
								className='w-20 rounded border px-2 py-1'
							/>
						</label>

						<label className='flex items-center gap-2'>
							<span className='text-sm'>Cols</span>
							<input
								type='number'
								min={1}
								value={cols}
								onChange={updateCols}
								className='w-20 rounded border px-2 py-1'
							/>
						</label>
					</div>

					{/* Fixed cell size: 24px - removed runtime control */}
				</div>

				<Grid rows={rows} cols={cols} cells={cells} />

				<div className='flex gap-2'>
					<button onClick={() => setSize(8, 8)} className='rounded bg-slate-100 px-3 py-1'>
						8×8
					</button>
					<button onClick={() => setSize(12, 12)} className='rounded bg-slate-100 px-3 py-1'>
						12×12
					</button>
					<button onClick={() => setSize(24, 24)} className='rounded bg-slate-100 px-3 py-1'>
						24×24
					</button>
				</div>
			</section>
		</main>
	)
}
