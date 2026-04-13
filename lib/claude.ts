import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = 'claude-sonnet-4-20250514'

/** Strip markdown code fences and parse JSON from Claude responses */
export function parseJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()
  return JSON.parse(cleaned) as T
}

export async function callClaude(prompt: string, maxTokens = 800): Promise<string> {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  })
  const block = msg.content[0]
  return block.type === 'text' ? block.text : ''
}

export async function streamClaude(
  prompt: string,
  onChunk: (chunk: string) => void,
  maxTokens = 800
): Promise<void> {
  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  })
  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      onChunk(chunk.delta.text)
    }
  }
}
