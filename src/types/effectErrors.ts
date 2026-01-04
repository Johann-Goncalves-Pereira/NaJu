import { Data } from 'effect'

// Expected domain errors (recoverable / user-facing)
export class DictionaryNetworkError extends Data.TaggedError('DictionaryNetworkError')<{
	status: number
	url: string
}> {}

export class DictionaryParseError extends Data.TaggedError('DictionaryParseError')<{
	reason: string
}> {}

export class DictionaryCacheError extends Data.TaggedError('DictionaryCacheError')<{
	reason: string
}> {}

export class StorageQuotaExceeded extends Data.TaggedError('StorageQuotaExceeded')<{
	key: string
	size?: number
}> {}

export class StorageUnavailable extends Data.TaggedError('StorageUnavailable')<object> {}

// Tracking related storage errors
export class TrackingStorageError extends Data.TaggedError('TrackingStorageError')<{
	action: 'track' | 'clear'
	reason: string
}> {}

// Unexpected / programming / infrastructure errors (should be logged, maybe reported)
export class UnexpectedError extends Data.TaggedError('UnexpectedError')<{
	origin: string
	message: string
}> {}

// Accent related errors
export class AccentPersistenceError extends Data.TaggedError('AccentPersistenceError')<{
	action: 'load' | 'save'
	reason: string
}> {}

export type DictionaryError =
	| DictionaryNetworkError
	| DictionaryParseError
	| DictionaryCacheError
	| UnexpectedError

export type StorageError =
	| StorageQuotaExceeded
	| StorageUnavailable
	| AccentPersistenceError
	| TrackingStorageError

// Helper for mapping unknown thrown values to UnexpectedError
export function toUnexpected(origin: string, cause: unknown): UnexpectedError {
	return new UnexpectedError({
		origin,
		message: cause instanceof Error ? cause.message : String(cause),
	})
}
