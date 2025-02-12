
export interface EmbeddingSearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

export const getEmbedding = async (text: string, apiKey: string): Promise<number[]> => {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small'
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate embedding');
  }

  const json = await response.json();
  return json.data[0].embedding;
}

export const buildPromptWithContext = (
  query: string,
  relevantContext: string[],
  systemPrompt: string
): { messages: Array<{ role: string; content: string }> } => {
  const contextText = relevantContext.length > 0
    ? `\nRelevant context:\n${relevantContext.join('\n\n')}`
    : '';

  const fullSystemPrompt = `${systemPrompt}\n\nYou have access to relevant context that you should use to inform your responses when applicable.${contextText}`;

  return {
    messages: [
      { role: 'system', content: fullSystemPrompt },
      { role: 'user', content: query }
    ]
  };
}
