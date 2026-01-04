import { useCallback, useState } from 'react'

import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Plus, Trash2, X } from 'lucide-react'

import { type CellColor, useCurrentProject, useProjectStore } from '@/stores/projectStore'

import GridNavigation from '@components/grid/GridNavigation'

/**
 * Colors page - Manage color palette for the project
 */
export default function ColorsPage() {
	const navigate = useNavigate()
	const project = useCurrentProject()
	const { addColor, removeColor, updateColor } = useProjectStore()
	const [isAddingColor, setIsAddingColor] = useState(false)
	const [newColorHex, setNewColorHex] = useState('#3b82f6')
	const [newColorName, setNewColorName] = useState('')
	const [editingColorId, setEditingColorId] = useState<string | null>(null)

	const handleAddColor = useCallback(() => {
		if (!newColorName.trim()) return
		addColor({
			hex: newColorHex,
			name: newColorName.trim(),
		})
		setNewColorHex('#3b82f6')
		setNewColorName('')
		setIsAddingColor(false)
	}, [addColor, newColorHex, newColorName])

	const handleRemoveColor = useCallback(
		(colorId: string) => {
			removeColor(colorId)
		},
		[removeColor],
	)

	const handleUpdateColor = useCallback(
		(colorId: string, hex: string, name: string) => {
			updateColor(colorId, { hex, name })
			setEditingColorId(null)
		},
		[updateColor],
	)

	const handleContinue = useCallback(() => {
		navigate({ to: '/grid/edit' })
	}, [navigate])

	const handleHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setNewColorHex(e.target.value)
	}, [])

	const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setNewColorName(e.target.value)
	}, [])

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
		<main className='flex h-dvh w-full flex-col items-center justify-start gap-6 overflow-y-auto p-6'>
			<GridNavigation />

			<section className='flex w-full max-w-2xl flex-col gap-6'>
				<header className='flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-semibold text-zinc-800 dark:text-zinc-100'>Colors</h1>
						<p className='mt-1 text-zinc-500 dark:text-zinc-400'>
							Choose colors for your palette ({project.colors.length} colors)
						</p>
					</div>

					{!isAddingColor && (
						<button
							onClick={() => setIsAddingColor(true)}
							className='flex touch-manipulation items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-white transition-transform active:scale-95 dark:bg-zinc-100 dark:text-zinc-900'
							type='button'
						>
							<Plus size={20} />
							<span>Add Color</span>
						</button>
					)}
				</header>

				{/* Add new color form */}
				{isAddingColor && (
					<div className='rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-800'>
						<div className='flex items-center gap-4'>
							<input
								type='color'
								value={newColorHex}
								onChange={handleHexChange}
								className='h-14 w-14 cursor-pointer rounded-xl border-2 border-zinc-200 dark:border-zinc-600'
								style={{ padding: 0 }}
							/>
							<div className='flex flex-1 flex-col gap-2'>
								<input
									type='text'
									value={newColorName}
									onChange={handleNameChange}
									placeholder='Color name'
									autoFocus
									className='w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'
								/>
								<input
									type='text'
									value={newColorHex}
									onChange={handleHexChange}
									placeholder='#000000'
									className='w-full rounded-lg border border-zinc-200 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'
								/>
							</div>
						</div>
						<div className='mt-4 flex gap-2'>
							<button
								onClick={handleAddColor}
								disabled={!newColorName.trim()}
								className='flex-1 touch-manipulation rounded-xl bg-zinc-900 py-3 text-white transition-transform active:scale-95 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900'
								type='button'
							>
								Add Color
							</button>
							<button
								onClick={() => {
									setIsAddingColor(false)
									setNewColorName('')
								}}
								className='touch-manipulation rounded-xl bg-zinc-100 px-6 py-3 text-zinc-700 transition-transform active:scale-95 dark:bg-zinc-700 dark:text-zinc-300'
								type='button'
							>
								Cancel
							</button>
						</div>
					</div>
				)}

				{/* Color list */}
				<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
					{project.colors.map((color: CellColor) => (
						<ColorCard
							key={color.id}
							color={color}
							isEditing={editingColorId === color.id}
							onEdit={() => setEditingColorId(color.id)}
							onCancelEdit={() => setEditingColorId(null)}
							onUpdate={(hex, name) => handleUpdateColor(color.id, hex, name)}
							onRemove={() => handleRemoveColor(color.id)}
						/>
					))}
				</div>

				{project.colors.length === 0 && (
					<div className='py-12 text-center'>
						<p className='text-lg text-zinc-500 dark:text-zinc-400'>No colors in palette</p>
						<p className='mt-2 text-sm text-zinc-400 dark:text-zinc-500'>
							Add at least one color to start drawing
						</p>
					</div>
				)}

				{/* Continue button */}
				<button
					onClick={handleContinue}
					disabled={project.colors.length === 0}
					className='flex touch-manipulation items-center justify-center gap-2 rounded-xl bg-zinc-900 py-4 text-lg font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900'
					type='button'
				>
					<span>Start Drawing</span>
					<ArrowRight size={20} />
				</button>
			</section>
		</main>
	)
}

// Color card sub-component
type ColorCardProps = {
	color: { id: string; hex: string; name: string }
	isEditing: boolean
	onEdit: () => void
	onCancelEdit: () => void
	onUpdate: (hex: string, name: string) => void
	onRemove: () => void
}

function ColorCard({ color, isEditing, onEdit, onCancelEdit, onUpdate, onRemove }: ColorCardProps) {
	const [hex, setHex] = useState(color.hex)
	const [name, setName] = useState(color.name)

	const handleSave = useCallback(() => {
		onUpdate(hex, name)
	}, [hex, name, onUpdate])

	if (isEditing) {
		return (
			<div className='flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm dark:bg-zinc-800'>
				<input
					type='color'
					value={hex}
					onChange={e => setHex(e.target.value)}
					className='h-12 w-full cursor-pointer rounded-lg'
					style={{ padding: 0 }}
				/>
				<input
					type='text'
					value={name}
					onChange={e => setName(e.target.value)}
					className='w-full rounded-lg border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'
				/>
				<div className='flex gap-1'>
					<button
						onClick={handleSave}
						className='flex-1 rounded-lg bg-zinc-900 py-2 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900'
						type='button'
					>
						Save
					</button>
					<button
						onClick={onCancelEdit}
						className='rounded-lg bg-zinc-100 p-2 dark:bg-zinc-700'
						type='button'
					>
						<X size={14} />
					</button>
				</div>
			</div>
		)
	}

	return (
		<button
			onClick={onEdit}
			className='group relative flex touch-manipulation flex-col gap-2 rounded-xl bg-white p-3 shadow-sm transition-transform active:scale-95 dark:bg-zinc-800'
			type='button'
		>
			<div
				className='h-16 w-full rounded-lg border border-zinc-200 dark:border-zinc-700'
				style={{ backgroundColor: color.hex }}
			/>
			<div className='flex items-center justify-between'>
				<span className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>{color.name}</span>
				<button
					onClick={e => {
						e.stopPropagation()
						onRemove()
					}}
					className='touch-manipulation rounded-lg p-1 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500'
					type='button'
					aria-label='Remove color'
				>
					<Trash2 size={14} />
				</button>
			</div>
			<span className='text-xs text-zinc-400'>{color.hex}</span>
		</button>
	)
}
