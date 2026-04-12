/**
 * Crawling is now handled by the offline script: scripts/crawl.ts
 * This route is a stub for informational purposes only.
 */

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { message: 'Crawling is offline. Run: npx ts-node --project tsconfig.scripts.json scripts/crawl.ts --all' },
    { status: 200 }
  )
}
