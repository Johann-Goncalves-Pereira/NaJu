import { useEffect } from 'react'

import { buildPageTitle } from '@/utils/pageTitle'

export const usePageTitle = (section?: string) => {
	useEffect(() => {
		document.title = buildPageTitle(section)
	}, [section])
}
