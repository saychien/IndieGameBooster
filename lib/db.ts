import { Pool, QueryResultRow } from 'pg'

// Singleton pool — shared across all imports in the same process
let _pool: Pool | null = null

export function getPool(): Pool {
  if (!_pool) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set')
    _pool = new Pool({
      connectionString: url,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
    _pool.on('error', (err) => console.error('[db] pool error:', err))
  }
  return _pool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query<T>(sql, params)
  return result.rows
}
