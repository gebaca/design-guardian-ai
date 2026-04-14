import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getDesignResponse(
  userPrompt: string,
  designSystem: string,
  systemPrompt: string
) {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Design System JSON: ${designSystem}` },
      { role: 'user', content: userPrompt },
    ],
    model: 'llama-3.3-70b-versatile',
    //model: 'llama-3.1-8b-instant',
  });

  return completion.choices[0]?.message?.content || '';
}
