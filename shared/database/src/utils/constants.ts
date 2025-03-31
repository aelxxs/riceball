export const Deps = {
	Redis: Symbol("Redis"),
	Database: Symbol("Database"),
	RepositoryManager: Symbol("RepositoryManager"),
	Cache: Symbol("Cache"),
	EntityManager: Symbol("EntityManager"),
} as const;

export const EXPIRE = 60 * 60 * 24 * 7; // 1 week
