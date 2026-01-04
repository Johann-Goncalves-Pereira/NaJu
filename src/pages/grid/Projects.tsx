import { useCallback, useState } from 'react'

import { useNavigate } from '@tanstack/react-router'
import { FolderPlus, Grid3X3, Trash2 } from 'lucide-react'

import { type Project, useProjectStore, useProjects } from '@/stores/projectStore'

import GridNavigation from '@components/grid/GridNavigation'

/**
 * Projects page - Entry point for the grid editor
 * Shows list of existing projects and allows creating new ones
 */
export default function ProjectsPage() {
	const navigate = useNavigate()
	const projects = useProjects()
	const { createProject, deleteProject, setCurrentProject } = useProjectStore()
	const [newProjectName, setNewProjectName] = useState('')
	const [isCreating, setIsCreating] = useState(false)

	const handleCreateProject = useCallback(() => {
		if (!newProjectName.trim()) return
		const id = createProject(newProjectName.trim())
		setNewProjectName('')
		setIsCreating(false)
		setCurrentProject(id)
		navigate({ to: '/grid/size' })
	}, [createProject, navigate, newProjectName, setCurrentProject])

	const handleSelectProject = useCallback(
		(id: string) => {
			setCurrentProject(id)
			navigate({ to: '/grid/edit' })
		},
		[navigate, setCurrentProject],
	)

	const handleDeleteProject = useCallback(
		(e: React.MouseEvent, id: string) => {
			e.stopPropagation()
			if (window.confirm('Are you sure you want to delete this project?')) {
				deleteProject(id)
			}
		},
		[deleteProject],
	)

	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setNewProjectName(e.target.value)
	}, [])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter') {
				handleCreateProject()
			} else if (e.key === 'Escape') {
				setIsCreating(false)
				setNewProjectName('')
			}
		},
		[handleCreateProject],
	)

	return (
		<main className='flex h-dvh w-full flex-col items-center justify-start gap-6 p-6'>
			<GridNavigation />

			<section className='flex w-full max-w-2xl flex-col gap-6'>
				<header className='flex items-center justify-between'>
					<h1 className='text-2xl font-semibold text-zinc-800 dark:text-zinc-100'>Projects</h1>

					{!isCreating && (
						<button
							onClick={() => setIsCreating(true)}
							className='flex touch-manipulation items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-white transition-transform active:scale-95 dark:bg-zinc-100 dark:text-zinc-900'
							type='button'
						>
							<FolderPlus size={20} />
							<span>New Project</span>
						</button>
					)}
				</header>

				{isCreating && (
					<div className='flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-800'>
						<label className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>
							Project Name
						</label>
						<input
							type='text'
							value={newProjectName}
							onChange={handleInputChange}
							onKeyDown={handleKeyDown}
							placeholder='My Pixel Art'
							autoFocus
							className='w-full rounded-lg border border-zinc-200 px-4 py-3 text-lg focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'
						/>
						<div className='flex gap-2'>
							<button
								onClick={handleCreateProject}
								disabled={!newProjectName.trim()}
								className='flex-1 touch-manipulation rounded-xl bg-zinc-900 py-3 text-white transition-transform active:scale-95 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900'
								type='button'
							>
								Create
							</button>
							<button
								onClick={() => {
									setIsCreating(false)
									setNewProjectName('')
								}}
								className='touch-manipulation rounded-xl bg-zinc-100 px-6 py-3 text-zinc-700 transition-transform active:scale-95 dark:bg-zinc-700 dark:text-zinc-300'
								type='button'
							>
								Cancel
							</button>
						</div>
					</div>
				)}

				{projects.length === 0 && !isCreating ? (
					<div className='flex flex-col items-center gap-4 py-16 text-center'>
						<Grid3X3 size={64} className='text-zinc-300 dark:text-zinc-600' />
						<p className='text-lg text-zinc-500 dark:text-zinc-400'>No projects yet</p>
						<p className='text-sm text-zinc-400 dark:text-zinc-500'>
							Create your first pixel art project
						</p>
					</div>
				) : (
					<ul className='flex flex-col gap-3'>
						{projects
							.sort((a: Project, b: Project) => b.updatedAt - a.updatedAt)
							.map((project: Project) => (
								<li key={project.id}>
									<button
										onClick={() => handleSelectProject(project.id)}
										className='flex w-full touch-manipulation items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-transform active:scale-[0.98] dark:bg-zinc-800'
										type='button'
									>
										<div className='flex flex-col items-start gap-1'>
											<span className='text-lg font-medium text-zinc-800 dark:text-zinc-100'>
												{project.name}
											</span>
											<span className='text-sm text-zinc-500 dark:text-zinc-400'>
												{project.rows}×{project.cols} • {project.colors.length} colors
											</span>
										</div>

										<div className='flex items-center gap-2'>
											<button
												onClick={e => handleDeleteProject(e, project.id)}
												className='touch-manipulation rounded-lg p-2 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-red-500 active:scale-95 dark:hover:bg-zinc-700'
												type='button'
												aria-label='Delete project'
											>
												<Trash2 size={20} />
											</button>
										</div>
									</button>
								</li>
							))}
					</ul>
				)}
			</section>
		</main>
	)
}
