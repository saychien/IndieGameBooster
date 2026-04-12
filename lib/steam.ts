import { GameData } from './types'

export function parseAppId(steamUrl: string): string | null {
  const match = steamUrl.match(/app\/(\d+)/)
  return match ? match[1] : null
}

export async function fetchGameData(appId: string): Promise<GameData> {
  const [storeRes, spyRes] = await Promise.all([
    fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en`,
      { signal: AbortSignal.timeout(10000) }
    ),
    fetch(
      `https://steamspy.com/api.php?request=appdetails&appid=${appId}`,
      { signal: AbortSignal.timeout(10000) }
    ),
  ])

  const storeJson = await storeRes.json()
  const spyJson = await spyRes.json()

  const storeData = storeJson[appId]?.data
  if (!storeData) throw new Error('Game not found on Steam')

  const tags = Object.keys(spyJson?.tags || {}).slice(0, 10)
  const similarGames = Object.values(spyJson?.similar || {})
    .map((g: unknown) => (g as { name: string }).name)
    .slice(0, 5)

  const priceOverview = storeData.price_overview
  const price = priceOverview ? priceOverview.final / 100 : 0

  return {
    name: storeData.name,
    description: storeData.short_description || storeData.detailed_description?.slice(0, 500) || '',
    tags,
    similarGames,
    estimatedOwners: spyJson?.owners,
    price,
    steamAppId: appId,
    headerImageUrl: storeData.header_image,
    steamUrl: `https://store.steampowered.com/app/${appId}`,
  }
}
