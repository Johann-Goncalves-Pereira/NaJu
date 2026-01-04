export const buildPageTitle = (section?: string): string =>
	section ? `NaJu Trico — ${section}` : 'NaJu Trico'

export const setPageTitle = (section?: string) => {
	document.title = buildPageTitle(section)
}
