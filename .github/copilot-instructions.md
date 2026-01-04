# AI Coding Guidelines

## Architecture Overview

This is a cutting-edge React 19 application utilizing TanStack Router for file-based routing with
React Compiler optimization. The architecture follows a clean separation of concerns:

**Core Structure:**

- `src/routes/` - File-based routing system where file paths map to URL routes
- `src/pages/` - Page components that handle route-specific logic and layout
- `src/components/` - Reusable UI components with strict TypeScript contracts
- `src/layout/` - Layout wrapper components (Root.tsx provides global app shell)
- `src/hooks/` - Custom React hooks for shared stateful logic
- `src/utils/` - Pure utility functions and helper modules
- `src/types/` - TypeScript type definitions and ts-reset configuration

### Component / Hook Separation Mandate

All non-trivial logic MUST live outside of React component render functions.

Rules:

- UI components (files under `src/components/` and `src/pages/`) should be PRESENTATION ONLY.
- State management, side-effects, derived calculations, input validation, persistence, timers,
  keyboard handlers, and domain algorithms belong in custom hooks under `src/hooks/` or pure
  functions under `src/utils/`.
- Components may only:
  - Receive props
  - Call hooks to obtain already-prepared data & handlers
  - Render JSX
  - Contain minimal event bridging (e.g. mapping a button click to a hook handler)
- No inline business logic, mutation chains, or multi-step computations directly inside JSX
  callbacks.
- If a component grows beyond a few lines of straightforward prop plumbing, extract a hook (e.g.
  `useThing()`).

Type Safety & Performance Alignment:

- Hooks must export precise return object shapes (avoid `any`, prefer readonly where possible).
- Derive complex values with `useMemo` and stable callbacks with `useCallback` inside the hook;
  components should never need additional memoization layers for those values.
- Keep hooks pure in their exposed contract: side-effects (storage, network) happen internally;
  components receive stable references.
- Maintain single source of truth types in `src/types/`; hooks derive with `ReturnType` /
  `Parameters` helpers when needed.

Enforcement Guidance:

- During reviews, migrate any logic found in a component into a hook before merging.
- New features start with a hook API sketch (inputs, outputs, error modes) prior to adding UI.
- Favor composition: many small hooks are better than one large monolith.

Example Pattern:

```typescript
// Hook (logic)
function useWidget(id: string) {
  const { data, error } = useQuery({ /* ... */ })
  const toggle = useCallback(() => {/* ... */}, [])
  const derived = useMemo(() => compute(data), [data])
  return { derived, error, toggle }
}

// Component (presentation)
function Widget({ id }: { id: string }) {
  const { derived, error, toggle } = useWidget(id)
  if (error) return <ErrorView />
  return <button onClick={toggle}>{derived.label}</button>
}
```

This mandate complements existing strict typing, memoization, and performance directives without
replacing them.

**Key Architectural Decisions:**

- **React Compiler Integration**: Enabled only in production to maintain HMR performance while
  optimizing bundle efficiency
- **File-Based Routing**: TanStack Router auto-generates route trees from file structure,
  eliminating manual route configuration
- **ts-reset Enhancement**: Leverages @total-typescript/ts-reset to improve built-in type
  definitions and reduce common TypeScript friction
- **Rolldown Integration**: Uses rolldown-vite for enhanced build performance with Rust-powered
  bundling

## Critical Developer Workflows

### Core Development Commands

```bash
pnpm dev              # Development server with HMR (React Compiler disabled)
pnpm dev:compiler     # Development with React Compiler enabled for testing
pnpm build           # Production build with TypeScript compilation + Vite bundling
pnpm preview         # Serve production build locally for testing
pnpm lint            # ESLint with React Compiler rules + TypeScript strict mode
pnpm format          # Prettier with import sorting + Tailwind class ordering
```

### Environment Setup Requirements

- **Node.js**: Modern version supporting ES2022+ features
- **PNPM**: Required package manager (not npm/yarn) due to specific overrides
- **TypeScript**: Strict mode configuration with comprehensive linting
- **Development Tools**: React Scan automatically enabled in dev mode for performance debugging

### Testing & Validation Workflow

1. Run `pnpm lint` before commits to catch React Compiler violations
2. Use `pnpm dev:compiler` periodically to test production-like compilation
3. Monitor React Scan output in browser devtools for performance regressions
4. Validate builds with `pnpm build && pnpm preview` before deployment

## Advanced TypeScript & Type Safety Conventions

This project enforces **super strict** TypeScript patterns for maximum type safety and
maintainability:

### Single Source of Truth Patterns

```typescript
// ✅ Derive types from constants to maintain single source of truth
const THEME_MODES = {
	light: 'light',
	dark: 'dark',
	system: 'system',
} as const

type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES]

// ✅ Extract union types from object keys
const API_ENDPOINTS = {
	users: '/api/users',
	posts: '/api/posts',
	comments: '/api/comments',
} as const

type EndpointKey = keyof typeof API_ENDPOINTS
type EndpointUrl = (typeof API_ENDPOINTS)[EndpointKey]
```

### Utility Types for Type Transformation

```typescript
// ✅ Use utility types for creating variations of core types
interface User {
	id: string
	name: string
	email: string
	avatar?: string
}

type CreateUserRequest = Omit<User, 'id'>
type UserProfile = Pick<User, 'name' | 'avatar'>
type OptionalUser = Partial<User>
type RequiredUser = Required<User>
```

### Advanced Type Extraction Patterns

```typescript
// ✅ Extract function parameter and return types
function fetchUserData(id: string, options: RequestInit): Promise<User> {
	return fetch(`/api/users/${id}`, options).then(r => r.json())
}

type FetchUserParams = Parameters<typeof fetchUserData>
type FetchUserReturn = ReturnType<typeof fetchUserData>
type ResolvedUser = Awaited<FetchUserReturn>

// ✅ Use infer for complex type extraction
type ExtractArrayType<T> = T extends (infer U)[] ? U : never
type ExtractPromiseType<T> = T extends Promise<infer U> ? U : never

// ✅ Extract instance types from classes/constructors
class ApiClient {
	constructor(public baseUrl: string) {}
}
type ApiClientInstance = InstanceType<typeof ApiClient>
```

### Strictness Configuration & ts-reset Integration

- **Ultra-strict tsconfig**: Enhanced with `exactOptionalPropertyTypes`, `noImplicitReturns`,
  `noUncheckedIndexedAccess`
- **ts-reset Integration**: `@total-typescript/ts-reset` improves Array methods, JSON parsing, and
  other built-in type accuracy
- **Verbatim Module Syntax**: Ensures import/export statements are preserved exactly for better
  tooling support
- **No Unchecked Side Effects**: `noUncheckedSideEffectImports` prevents accidental side-effect
  imports
- **Consistent Type Imports**: ESLint enforces `import type` for type-only imports

### React Performance & Memoization Patterns

```typescript
// ✅ Use React.memo for component memoization with proper comparison
const UserCard = memo(({ user, onEdit }: UserCardProps) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
});

// ✅ Custom comparison function for complex props
const ExpensiveComponent = memo(
  ({ data, config }: Props) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    return (
      prevProps.data.id === nextProps.data.id &&
      prevProps.config.theme === nextProps.config.theme
    );
  }
);

// ✅ useMemo for expensive calculations
function DataTable({ items, filters }: DataTableProps) {
  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      filters.every((filter) => filter.predicate(item))
    );
  }, [items, filters]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredItems]);

  return <div>{/* render sortedItems */}</div>;
}

// ✅ useCallback for stable function references
function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  const handleToggle = useCallback(
    (id: string) => {
      onToggle(id);
    },
    [onToggle]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
    },
    [onDelete]
  );

  return (
    <div>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

// ✅ React Compiler compatible patterns (avoid manual memoization when possible)
function AutoOptimizedComponent({ user, settings }: Props) {
  // React Compiler will automatically optimize this
  const userProfile = {
    name: user.name,
    avatar: user.avatar,
    preferences: settings.preferences,
  };

  // Compiler handles memoization automatically
  const displayName = user.displayName || user.name;

  return <UserProfile profile={userProfile} name={displayName} />;
}
```

### Memoization Best Practices & Anti-patterns

```typescript
// ❌ Don't memoize everything - adds overhead
const OverMemoizedComponent = memo(() => {
  return <div>Simple static content</div>;
});

// ✅ Only memoize when you have expensive renders or frequent re-renders
const ExpensiveChart = memo(({ data }: ChartProps) => {
  return <ComplexVisualization data={data} />;
});

// ❌ Don't create objects in render without memoization
function BadComponent({ userId }: Props) {
  return <UserProfile config={{ theme: "dark", userId }} />; // New object every render
}

// ✅ Memoize object creation or move outside component
function GoodComponent({ userId }: Props) {
  const config = useMemo(
    () => ({
      theme: "dark" as const,
      userId,
    }),
    [userId]
  );

  return <UserProfile config={config} />;
}

// ✅ Or use React Compiler's automatic optimization
function CompilerOptimizedComponent({ userId }: Props) {
  // React Compiler automatically memoizes this object
  const config = { theme: "dark" as const, userId };
  return <UserProfile config={config} />;
}
```

### Performance Rules Enforcement

The ESLint configuration enforces several performance-critical patterns:

- **Type Imports**: `@typescript-eslint/consistent-type-imports` ensures type-only imports use
  `import type`
- **React Keys**: `react/jsx-key` requires keys in list items to prevent reconciliation issues
- **Function Binding**: `react/jsx-no-bind` warns about inline function creation in JSX
- **Context Values**: `react/jsx-no-constructed-context-values` prevents object recreation in
  Context
- **Hook Dependencies**: `react-hooks/exhaustive-deps` ensures complete dependency arrays
- **Unnecessary Fragments**: `react/jsx-no-useless-fragment` removes performance overhead
- **Array Index Keys**: `react/no-array-index-key` warns about unstable keys

## Code Quality and Documentation Standards

### Readability Conventions

- **No Semicolons**: Consistent omission across the codebase (`semi: false`)
- **Single Quotes**: For all string literals and JSX attributes (`singleQuote: true`)
- **Tab Indentation**: 2-space equivalent tabs for consistent formatting (`useTabs: true`)
- **80 Character Line Limit**: Enforced via Prettier for optimal code review readability
- **Import Ordering**: Automatic sorting - React → Third-party → Path aliases (@/) → Relative
  imports

- **Styling**: Use Tailwind CSS utility classes for component and page styles. Prefer composing
  styles with Tailwind in JSX/TSX files and keep custom CSS to a minimum. Allowed exceptions: global
  layer utilities (e.g. `@layer components`), font-face declarations, reset styles, and
  runtime-driven CSS variables (accent and theme variables). When a design requires complex,
  reusable patterns, extract them into Tailwind component classes or design tokens rather than
  ad-hoc CSS files.

### JSDoc Documentation Requirements

````typescript
/**
 * Fetches user data with caching and error handling
 * @param userId - Unique identifier for the user
 * @param options - Configuration object for the request
 * @param options.cache - Whether to use cached data if available
 * @param options.timeout - Request timeout in milliseconds
 * @returns Promise that resolves to user data or throws ApiError
 * @throws {ApiError} When the API request fails or user is not found
 * @example
 * ```typescript
 * const user = await fetchUser('123', { cache: true, timeout: 5000 })
 * ```
 */
async function fetchUser(
	userId: string,
	options: { cache?: boolean; timeout?: number },
): Promise<User> {
	// Implementation
}
````

### Error & Edge Case Handling

- **Exhaustive Error Types**: Define specific error classes for different failure modes
- **Result Type Pattern**: Consider using Result<T, E> types for operations that can fail
- **Null Safety**: Leverage strict null checks and optional chaining for all potentially undefined
  values
- **Input Validation**: Validate all external inputs (API responses, user input, environment
  variables)

```typescript
// ✅ Comprehensive error handling with specific types
class ValidationError extends Error {
	constructor(
		public field: string,
		message: string,
	) {
		super(message)
		this.name = 'ValidationError'
	}
}

function validateEmail(email: string): email is string {
	if (!email) throw new ValidationError('email', 'Email is required')
	if (!email.includes('@')) throw new ValidationError('email', 'Invalid email format')
	return true
}
```

## Project Patterns & Integrations

### Effect Integration & Functional Error Management

We use the `effect` library (v3) for structured, typed, and composable side‑effects in hooks and
utilities. Key principles:

**Two Error Channels**

- Success channel carries domain values (e.g. `string[]` dictionary words).
- Error channel carries _expected_ (recoverable, user-displayable) or _unexpected_ (programmer /
  infra) tagged errors.

**Tagged Errors**

- Domain errors extend `Data.TaggedError('Tag')<Shape>` in `src/types/effectErrors.ts`.
- Expected errors: `DictionaryNetworkError`, `DictionaryParseError`, `DictionaryCacheError`,
  `StorageUnavailable`, etc.
- Unexpected errors wrapped via `toUnexpected(origin, cause)` producing `UnexpectedError`.

**Patterns Implemented**

- Fallback: `Effect.catchAll(() => Effect.succeed(fallbackValue))` (dictionary falls back to minimal
  word list).
- Matching: Prefer `Effect.catchTags({ TagName: handler })` when discriminating specific expected
  errors (see storage examples—may be expanded later).
- Retrying: Network fetch uses `Effect.retry({ schedule: Schedule.recurs(2) })` for transient
  failures.
- Timing Out: For future network additions, wrap with `Effect.timeout(Duration.seconds(5))` then
  provide graceful fallback.
- Sandboxing / Isolation: Use `Effect.either(effect)` (preferred) or `Effect.sandbox(effect)` to
  probe cache without aborting pipeline.
- Error Accumulation: For multi‑stage validations, accumulate with `Effect.validateAll` (future
  expansion; currently single‑stage parsing).
- Parallel vs Sequential: Use `Effect.all([...effects], { concurrency: 'unbounded' })` for
  independent operations (not yet required). Keep parsing sequential where ordering matters.
- Yieldable Errors: When exposing errors to UI, run the Effect inside hook `queryFn` (React Query)
  and surface `query.error`.

**React Hook Usage**

- Wrap side effects in `Effect.runFork` inside `useEffect` for fire‑and‑forget (e.g. persisting
  score).
- For synchronous initial state: `useState(() => Effect.runSync(effect))` (ensure a pure fallback
  path to avoid throwing during render).
- Never run long‑running or retry loops directly in render; compose in Effect then execute outside.

**Design Rules**

1. Keep pure helpers pure. Only wrap in `Effect` where IO, randomness, time, or failure can occur
   (network, localStorage, compression, animation start/stop).
2. Expose an Effect API AND (optionally) a legacy Promise API while migrating. New code prefers
   `Effect`.
3. Always provide a graceful fallback for user‑visible operations (dictionary, accent load, score
   load) so UI stays responsive.
4. Type all effect return values precisely: `Effect.Effect<A, E>` where `E` is a union of tagged
   errors (avoid `any`).
5. Keep errors serializable (simple field types) for potential telemetry.

**Snippet Example**

```ts
// Build German dictionary with retry + fallback
export const buildGermanDictionaryEffect = (
	length: number,
): Effect.Effect<
	string[],
	DictionaryNetworkError | DictionaryParseError | DictionaryCacheError | UnexpectedError
> =>
	Effect.gen(function* () {
		const cacheEither = yield* Effect.either(loadCacheEffect(length))
		if (cacheEither._tag === 'Right') return cacheEither.right
		const cacheOk = yield* shouldCacheEffect(GERMAN_DICTIONARY_URL).pipe(
			Effect.catchAll(() => Effect.succeed(true)),
		)
		const raw = yield* fetchRawDictionaryEffect(GERMAN_DICTIONARY_URL).pipe(
			Effect.retry({ schedule: Schedule.recurs(2) }),
		)
		const filtered = yield* parseAndFilterEffect(raw, length)
		if (!filtered.length) return FALLBACK_WORDS
		if (cacheOk)
			yield* storeCacheEffect(filtered, length, GERMAN_DICTIONARY_URL).pipe(Effect.ignore)
		return filtered
	}).pipe(Effect.catchAll(() => Effect.succeed(FALLBACK_WORDS)))
```

**When Adding New Logic**

- Identify impure boundaries → wrap in `Effect.try` / `Effect.tryPromise`.
- Introduce tagged errors for each distinct failure mode (validation, network, parse, quota).
- Provide a fallback early if user experience depends on the result.
- Prefer composition over nesting: break pipeline into named Effects (e.g. `fetchRawEffect`,
  `parseEffect`, `storeEffect`).
- Document the contract (Inputs / Outputs / Error Tags / Fallback) above new Effect APIs.

This section complements existing error handling; components remain presentation-only and never
orchestrate failure logic directly.

### File-Based Routing Architecture

- **Route Definition**: Create files in `src/routes/` that mirror URL structure
- **Auto-Generated Route Tree**: Never manually edit `src/routeTree.gen.ts` - it's automatically
  maintained
- **Layout Composition**: Root layout in `__root.tsx` provides app shell with `<Outlet />` for child
  routes
- **Route Components**: Export `Route` objects using `createFileRoute()` or `createRootRoute()`

### Path Alias System

```typescript
// ✅ Always use path aliases for internal imports
import UserProfile from "@components/UserProfile";
import { useAuth } from "@hooks/useAuth";
import { formatDate } from "@utils/date";
import LovePage from "@pages/Love";

// ❌ Never use relative imports for internal modules
import UserProfile from "../../components/UserProfile";
```

### React Compiler Integration Pattern

- **Development Mode**: Compiler disabled to preserve HMR and fast refresh
- **Production Mode**: Compiler enabled for automatic optimization and memoization
- **ESLint Integration**: `eslint-plugin-react-compiler` enforces compiler-compatible patterns
- **Testing Strategy**: Use `pnpm dev:compiler` to validate compiler compatibility during
  development

### Performance Monitoring Integration

- **React Scan**: Automatically enabled in development for real-time performance insights
- **Component Re-render Tracking**: Monitor unnecessary re-renders via browser devtools
- **Build Analysis**: Rolldown provides detailed bundle analysis and optimization reports

### Type-Safe Component Patterns

```typescript
// ✅ Proper component typing with strict interfaces
interface UserCardProps {
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar?: string;
  };
  readonly onEdit: (userId: string) => void;
  readonly isSelected?: boolean;
}

// ✅ Component with proper memoization and error boundaries
const UserCard = memo<UserCardProps>(({ user, onEdit, isSelected = false }) => {
  const handleEdit = useCallback(() => {
    onEdit(user.id);
  }, [onEdit, user.id]);

  return (
    <div className={`user-card ${isSelected ? "selected" : ""}`}>
      <img src={user.avatar ?? "/default-avatar.png"} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button type='button' onClick={handleEdit}>
        Edit User
      </button>
    </div>
  );
});

UserCard.displayName = "UserCard";

// ✅ Custom hook with proper typing and memoization
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      const userData = (await response.json()) as User;
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      void fetchUser(userId);
    }
  }, [userId, fetchUser]);

  return useMemo(
    () => ({
      user,
      loading,
      error,
      refetch: () => fetchUser(userId),
    }),
    [user, loading, error, fetchUser, userId]
  );
}
```

### Key Reference Files

- `src/routes/__root.tsx` - Root route definition and layout composition
- `src/layout/Root.tsx` - Main app layout with router outlet
- `vite.config.ts` - Build configuration with conditional React Compiler
- `eslint.config.js` - Comprehensive linting rules with React Compiler integration
- `tsconfig.app.json` - Strict TypeScript configuration with path aliases
