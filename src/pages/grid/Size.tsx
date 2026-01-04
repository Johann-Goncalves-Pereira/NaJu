import { useCallback } from 'react'

import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Minus, Plus } from 'lucide-react'

import { useCurrentProject, useProjectStore } from '@/stores/projectStore'

import GridNavigation from '@components/grid/GridNavigation'
import GridPreview from '@components/grid/GridPreview'

/**
 * Size configuration page
 * Allows users to set grid dimensions and cell size
 */
export default function SizePage() {
	const navigate = useNavigate()
	const project = useCurrentProject()
	const { setGridSize, setCellSize } = useProjectStore()

	const handleRowsChange = useCallback(
		(delta: number) => {
			if (!project) return
			const newRows = Math.max(1, Math.min(64, project.rows + delta))
			setGridSize(newRows, project.cols)
		},
		[project, setGridSize],
	)

	const handleColsChange = useCallback(
		(delta: number) => {
			if (!project) return
			const newCols = Math.max(1, Math.min(64, project.cols + delta))
			setGridSize(project.rows, newCols)
		},
		[project, setGridSize],
	)

	const handleCellSizeChange = useCallback(
		(delta: number) => {
			if (!project) return
			const newSize = Math.max(8, Math.min(64, project.cellSize + delta))
			setCellSize(newSize)
		},
		[project, setCellSize],
	)

	const handleRowsInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (!project) return
			const value = Math.max(1, Math.min(64, parseInt(e.target.value) || 1))
			setGridSize(value, project.cols)
		},
		[project, setGridSize],
	)

	const handleColsInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (!project) return
			const value = Math.max(1, Math.min(64, parseInt(e.target.value) || 1))
			setGridSize(project.rows, value)
		},
		[project, setGridSize],
	)

	const handleCellSizeInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Math.max(8, Math.min(64, parseInt(e.target.value) || 8))
			setCellSize(value)
		},
		[setCellSize],
	)

	const handleContinue = useCallback(() => {
		navigate({ to: '/grid/colors' })
	}, [navigate])

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

	return (
		<main className='flex h-dvh w-full flex-col items-center justify-start gap-6 overflow-y-auto p-6'>
			<GridNavigation />

			<section className='flex w-full max-w-2xl flex-col gap-6'>
				<header>
					<h1 className='text-2xl font-semibold text-zinc-800 dark:text-zinc-100'>
						Tamanho da grade
					</h1>
					<p className='mt-1 text-zinc-500 dark:text-zinc-400'>
						Configure as dimensões da sua arte de tricô
					</p>
				</header>

				{/* Grid dimensions */}
				<div className='flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-800'>
					{/* Rows control */}
					<div className='flex items-center justify-between'>
						<label className='text-lg font-medium text-zinc-700 dark:text-zinc-300'>Linhas</label>
						<div className='flex items-center gap-2'>
							<button
								onClick={() => handleRowsChange(-1)}
								disabled={project.rows <= 1}
								className='flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition-transform active:scale-95 disabled:opacity-30 dark:bg-zinc-700 dark:text-zinc-300'
								type='button'
								aria-label='Diminuir linhas'
							>
								<Minus size={24} />
							</button>
							<input
								type='number'
								min={1}
								max={64}
								value={project.rows}
								onChange={handleRowsInput}
								className='w-20 rounded-xl border-2 border-zinc-200 px-3 py-2 text-center text-xl font-semibold dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100'
							/>
							<button
								onClick={() => handleRowsChange(1)}
								disabled={project.rows >= 64}
								className='flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition-transform active:scale-95 disabled:opacity-30 dark:bg-zinc-700 dark:text-zinc-300'
								type='button'
								aria-label='Aumentar linhas'
							>
								<Plus size={24} />
							</button>
						</div>
					</div>

					{/* Columns control */}
					<div className='flex items-center justify-between'>
						<label className='text-lg font-medium text-zinc-700 dark:text-zinc-300'>Colunas</label>
						<div className='flex items-center gap-2'>
							<button
								onClick={() => handleColsChange(-1)}
								disabled={project.cols <= 1}
								className='flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition-transform active:scale-95 disabled:opacity-30 dark:bg-zinc-700 dark:text-zinc-300'
								type='button'
								aria-label='Diminuir colunas'
							>
								<Minus size={24} />
							</button>
							<input
								type='number'
								min={1}
								max={64}
								value={project.cols}
								onChange={handleColsInput}
								className='w-20 rounded-xl border-2 border-zinc-200 px-3 py-2 text-center text-xl font-semibold dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100'
							/>
							<button
								onClick={() => handleColsChange(1)}
								disabled={project.cols >= 64}
								className='flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition-transform active:scale-95 disabled:opacity-30 dark:bg-zinc-700 dark:text-zinc-300'
								type='button'
								aria-label='Aumentar colunas'
							>
								<Plus size={24} />
							</button>
						</div>
					</div>

					{/* Cell size control */}
					<div className='flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700'>
						<label className='text-lg font-medium text-zinc-700 dark:text-zinc-300'>
							Tamanho da célula
						</label>
						<div className='flex items-center gap-2'>
							<button
								onClick={() => handleCellSizeChange(-4)}
								disabled={project.cellSize <= 8}
								className='flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition-transform active:scale-95 disabled:opacity-30 dark:bg-zinc-700 dark:text-zinc-300'
								type='button'
								aria-label='Diminuir tamanho da célula'
							>
								<Minus size={24} />
							</button>
							<input
								type='number'
								min={8}
								max={64}
								step={4}
								value={project.cellSize}
								onChange={handleCellSizeInput}
								className='w-20 rounded-xl border-2 border-zinc-200 px-3 py-2 text-center text-xl font-semibold dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100'
							/>
							<button
								onClick={() => handleCellSizeChange(4)}
								disabled={project.cellSize >= 64}
								className='flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition-transform active:scale-95 disabled:opacity-30 dark:bg-zinc-700 dark:text-zinc-300'
								type='button'
								aria-label='Aumentar tamanho da célula'
							>
								<Plus size={24} />
							</button>
						</div>
					</div>
				</div>

				{/* Preset sizes */}
				<div className='flex flex-wrap gap-2'>
					{[
						[8, 8],
						[12, 12],
						[16, 16],
						[24, 24],
						[32, 32],
					].map(([r, c]) => (
						<button
							key={`${r}x${c}`}
							onClick={() => setGridSize(r, c)}
							className={`touch-manipulation rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
								project.rows === r && project.cols === c
									? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
									: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
							}`}
							type='button'
						>
							{r}×{c}
						</button>
					))}
				</div>

				{/* Preview */}
				<div className='rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-800'>
					<h3 className='mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400'>Prévia</h3>
					<div className='flex justify-center'>
						<GridPreview />
					</div>
				</div>

				{/* Continue button */}
				<button
					onClick={handleContinue}
					className='flex touch-manipulation items-center justify-center gap-2 rounded-xl bg-zinc-900 py-4 text-lg font-medium text-white transition-transform active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900'
					type='button'
				>
					<span>Escolher cores</span>
					<ArrowRight size={20} />
				</button>
			</section>
		</main>
	)
}
