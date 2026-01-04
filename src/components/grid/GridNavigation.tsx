import { useCallback, useState } from 'react'

import { Link, useLocation } from '@tanstack/react-router'
import { Download, FolderOpen, Menu, Palette, Pencil, Ruler, X } from 'lucide-react'

import { useCurrentProject } from '@/stores/projectStore'

type NavItem = {
	to: string
	icon: React.ReactNode
	label: string
	requiresProject?: boolean
}

const navItems: NavItem[] = [
	{
		to: '/grid',
		icon: <FolderOpen size={20} />,
		label: 'Projetos',
	},
	{
		to: '/grid/size',
		icon: <Ruler size={20} />,
		label: 'Tamanho',
		requiresProject: true,
	},
	{
		to: '/grid/colors',
		icon: <Palette size={20} />,
		label: 'Cores',
		requiresProject: true,
	},
	{
		to: '/grid/edit',
		icon: <Pencil size={20} />,
		label: 'Editar',
		requiresProject: true,
	},
	{
		to: '/grid/export',
		icon: <Download size={20} />,
		label: 'Exportar',
		requiresProject: true,
	},
]

/**
 * Floating sidebar navigation for grid editor
 * Hidden by default, reveals on touch/hover
 */
export default function GridNavigation() {
	const [isOpen, setIsOpen] = useState(false)
	const location = useLocation()
	const currentProject = useCurrentProject()

	const handleToggle = useCallback(() => {
		setIsOpen(prev => !prev)
	}, [])

	const handleClose = useCallback(() => {
		setIsOpen(false)
	}, [])

	return (
		<>
			{/* Toggle button - always visible */}
			<button
				onClick={handleToggle}
				className='fixed top-4 left-4 z-50 flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl bg-white/90 shadow-lg backdrop-blur-sm transition-transform active:scale-95 dark:bg-zinc-800/90'
				type='button'
				aria-label={isOpen ? 'Fechar navegação' : 'Abrir navegação'}
				aria-expanded={isOpen}
			>
				{isOpen ? <X size={24} /> : <Menu size={24} />}
			</button>

			{/* Backdrop */}
			{isOpen && (
				<div
					className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
					onClick={handleClose}
					aria-hidden='true'
				/>
			)}

			{/* Sidebar */}
			<nav
				className={`fixed top-0 left-0 z-40 h-full w-64 transform bg-white/95 shadow-2xl backdrop-blur-sm transition-transform duration-300 ease-out dark:bg-zinc-900/95 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
				aria-label='Navegação do editor'
			>
				<div className='flex h-full flex-col p-4 pt-20'>
					{/* Project info */}
					{currentProject && (
						<div className='mb-6 rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800'>
							<p className='text-xs font-medium text-zinc-500 dark:text-zinc-400'>Projeto atual</p>
							<p className='truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100'>
								{currentProject.name}
							</p>
							<p className='text-xs text-zinc-500 dark:text-zinc-400'>
								{currentProject.rows}×{currentProject.cols} • {currentProject.colors.length} cores
							</p>
						</div>
					)}

					{/* Navigation links */}
					<ul className='flex flex-col gap-1'>
						{navItems.map(item => {
							const isActive = location.pathname === item.to
							const isDisabled = item.requiresProject && !currentProject

							if (isDisabled) {
								return (
									<li key={item.to}>
										<span className='flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 dark:text-zinc-600'>
											{item.icon}
											<span>{item.label}</span>
										</span>
									</li>
								)
							}

							return (
								<li key={item.to}>
									<Link
										to={item.to}
										onClick={handleClose}
										className={`flex touch-manipulation items-center gap-3 rounded-xl px-4 py-3 transition-all active:scale-[0.98] ${
											isActive
												? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
												: 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
										}`}
									>
										{item.icon}
										<span className='font-medium'>{item.label}</span>
									</Link>
								</li>
							)
						})}
					</ul>

					{/* Spacer */}
					<div className='flex-1' />

					{/* Footer */}
					<div className='border-t border-zinc-200 pt-4 dark:border-zinc-700'>
						<p className='text-center text-xs text-zinc-400 dark:text-zinc-500'>NaJu Trico</p>
					</div>
				</div>
			</nav>
		</>
	)
}
