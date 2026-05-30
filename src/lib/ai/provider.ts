type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function callAi(messages: Message[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || "").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt5mini";

  if (!apiKey || !baseUrl) {
    throw new Error("AI provider environment is not configured");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: Number(process.env.OPENAI_TEMPERATURE || 0.2),
      max_tokens: Number(process.env.OPENAI_MAX_TOKENS || 800),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI provider failed ${response.status}: ${text.slice(0, 300)}`);
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("AI provider returned empty content");
  }

  return content;
}

export function parseJsonFromAi(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("AI response did not contain JSON");
  }
  return JSON.parse(match[0]);
}
