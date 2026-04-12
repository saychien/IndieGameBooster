import { OutreachContent, Channel, GameData } from './types'

export async function downloadOutreachZip(
  outreachList: OutreachContent[],
  channels: Channel[],
  game: GameData
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const JSZip = (await import('jszip')).default
  const { saveAs } = await import('file-saver')

  const zip = new JSZip()
  const folder = zip.folder(game.name.replace(/[^a-zA-Z0-9]/g, '_'))!

  for (const item of outreachList) {
    const channel = channels.find(c => c.id === item.channelId)
    const name = channel?.name.replace(/[^a-zA-Z0-9]/g, '_') || item.channelId
    const ext = item.type === 'press_kit' ? 'txt' : 'txt'
    folder.file(`${item.type}_${name}.${ext}`, item.content)
  }

  // Add a summary README
  const summary = outreachList
    .map(item => {
      const ch = channels.find(c => c.id === item.channelId)
      return `--- ${ch?.name || item.channelId} (${item.type}) ---\n${item.content}\n`
    })
    .join('\n\n')

  folder.file('README_all_outreach.txt', summary)

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `${game.name.replace(/\s+/g, '_')}_outreach_kit.zip`)
}
