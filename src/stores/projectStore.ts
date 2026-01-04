import { useMemo } from 'react'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Types
export type CellColor = {
	id: string
	hex: string
	name: string
}

export type GridCell = {
	row: number
	col: number
	colorId: string | null
}

export type Project = {
	id: string
	name: string
	rows: number
	cols: number
	cellSize: number
	colors: CellColor[]
	cells: Record<string, string | null> // key: `${row}-${col}`, value: colorId
	createdAt: number
	updatedAt: number
}

type ProjectState = {
	// Current project
	currentProjectId: string | null
	projects: Record<string, Project>
}

type ProjectActions = {
	// Actions
	createProject: (name: string) => string
	deleteProject: (id: string) => void
	setCurrentProject: (id: string | null) => void

	// Grid configuration
	setGridSize: (rows: number, cols: number) => void
	setCellSize: (size: number) => void

	// Color management
	addColor: (color: Omit<CellColor, 'id'>) => void
	removeColor: (colorId: string) => void
	updateColor: (colorId: string, updates: Partial<Omit<CellColor, 'id'>>) => void

	// Cell painting
	setCellColor: (row: number, col: number, colorId: string | null) => void
	clearGrid: () => void
}

type ProjectStore = ProjectState & ProjectActions

const DEFAULT_COLORS: CellColor[] = [
	{ id: 'color-1', hex: '#ef4444', name: 'Red' },
	{ id: 'color-2', hex: '#f97316', name: 'Orange' },
	{ id: 'color-3', hex: '#eab308', name: 'Yellow' },
	{ id: 'color-4', hex: '#22c55e', name: 'Green' },
	{ id: 'color-5', hex: '#3b82f6', name: 'Blue' },
	{ id: 'color-6', hex: '#8b5cf6', name: 'Purple' },
	{ id: 'color-7', hex: '#ec4899', name: 'Pink' },
	{ id: 'color-8', hex: '#ffffff', name: 'White' },
	{ id: 'color-9', hex: '#000000', name: 'Black' },
]

const generateId = () => `project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
const generateColorId = () => `color-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export const useProjectStore = create<ProjectStore>()(
	persist(
		immer(set => ({
			currentProjectId: null,
			projects: {},

			createProject: (name: string) => {
				const id = generateId()
				const now = Date.now()
				let returnId = ''
				set(state => {
					state.projects[id] = {
						id,
						name,
						rows: 12,
						cols: 12,
						cellSize: 24,
						colors: [...DEFAULT_COLORS],
						cells: {},
						createdAt: now,
						updatedAt: now,
					}
					state.currentProjectId = id
					returnId = id
				})
				return returnId || id
			},

			deleteProject: (id: string) => {
				set(state => {
					delete state.projects[id]
					if (state.currentProjectId === id) {
						state.currentProjectId = null
					}
				})
			},

			setCurrentProject: (id: string | null) => {
				set(state => {
					state.currentProjectId = id
				})
			},

			setGridSize: (rows: number, cols: number) => {
				set(state => {
					const project = state.currentProjectId ? state.projects[state.currentProjectId] : null
					if (project) {
						project.rows = Math.max(1, Math.floor(rows))
						project.cols = Math.max(1, Math.floor(cols))
						project.updatedAt = Date.now()
					}
				})
			},

			setCellSize: (size: number) => {
				set(state => {
					const project = state.currentProjectId ? state.projects[state.currentProjectId] : null
					if (project) {
						project.cellSize = Math.max(8, Math.min(64, size))
						project.updatedAt = Date.now()
					}
				})
			},

			addColor: (color: Omit<CellColor, 'id'>) => {
				set(state => {
					const project = state.currentProjectId ? state.projects[state.currentProjectId] : null
					if (project) {
						project.colors.push({
							id: generateColorId(),
							...color,
						})
						project.updatedAt = Date.now()
					}
				})
			},

			removeColor: (colorId: string) => {
				set(state => {
					const project = state.currentProjectId ? state.projects[state.currentProjectId] : null
					if (project) {
						project.colors = project.colors.filter(c => c.id !== colorId)
						// Clear cells with this color
						for (const key in project.cells) {
							if (project.cells[key] === colorId) {
								project.cells[key] = null
							}
						}
						project.updatedAt = Date.now()
					}
				})
			},

			updateColor: (colorId: string, updates: Partial<Omit<CellColor, 'id'>>) => {
				set(state => {
					const project = state.currentProjectId ? state.projects[state.currentProjectId] : null
					if (project) {
						const color = project.colors.find(c => c.id === colorId)
						if (color) {
							Object.assign(color, updates)
							project.updatedAt = Date.now()
						}
					}
				})
			},

			setCellColor: (row: number, col: number, colorId: string | null) => {
				set(state => {
					const project = state.currentProjectId ? state.projects[state.currentProjectId] : null
					if (project) {
						const key = `${row}-${col}`
						if (colorId === null) {
							delete project.cells[key]
						} else {
							project.cells[key] = colorId
						}
						project.updatedAt = Date.now()
					}
				})
			},

			clearGrid: () => {
				set(state => {
					const project = state.currentProjectId ? state.projects[state.currentProjectId] : null
					if (project) {
						project.cells = {}
						project.updatedAt = Date.now()
					}
				})
			},
		})),
		{
			name: 'pixel-grid-projects',
		},
	),
)

// Selector hooks for better performance
// Use direct property access with stable selectors to prevent re-renders

export function useCurrentProject(): Project | null {
	const currentProjectId = useProjectStore(state => state.currentProjectId)
	const projects = useProjectStore(state => state.projects)

	return useMemo(
		() => (currentProjectId ? (projects[currentProjectId] ?? null) : null),
		[currentProjectId, projects],
	)
}

export function useProjects(): Project[] {
	const projects = useProjectStore(state => state.projects)

	return useMemo(() => Object.values(projects), [projects])
}

export function useProjectColors(): CellColor[] {
	const project = useCurrentProject()
	return useMemo(() => project?.colors ?? [], [project?.colors])
}

export function useGridCells(): GridCell[] {
	const project = useCurrentProject()

	return useMemo(() => {
		if (!project) return []

		const cells: GridCell[] = []
		for (let r = 0; r < project.rows; r++) {
			for (let c = 0; c < project.cols; c++) {
				cells.push({
					row: r,
					col: c,
					colorId: project.cells[`${r}-${c}`] ?? null,
				})
			}
		}
		return cells
	}, [project])
}
