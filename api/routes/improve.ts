import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { message, tone } = req.body;

  if (!message || !tone) {
    res.status(400).json({ error: 'Message and tone are required' });
    return;
  }

  console.log(`[API] Request received: Tone=${tone}, MessageLength=${message.length}`);

  const apiKey = process.env.MINIMAX_API_KEY;

  // 1. Check for API Key
  if (!apiKey) {
    console.error('[API] Error: Missing MINIMAX_API_KEY in environment variables.');
    res.status(500).json({ error: 'Missing MINIMAX_API_KEY. Please set this environment variable.' });
    return;
  }

  // 2. Call MiniMax API
  console.log('[API] Calling MiniMax API...');
  
  try {
    const response = await axios.post(
      'https://api.minimax.io/v1/text/chatcompletion_v2',
      {
        model: 'MiniMax-M2.1',
        messages: [
          {
            role: 'system',
            name: 'MM',
            content: `You are an assistant that rewrites short messages (emails, DMs, texts).
Output ONLY the rewritten message as plain text.
Do NOT add explanations, labels, commentary, quotes, or meta text.`
          },
          {
            role: 'user',
            name: 'User',
            content: `Rewrite the message below in a ${tone} tone.
Fix grammar and wording.
Make it sound natural for US professional communication.
If the message contains a request, make the ask specific and include a clear next step (time or action).

Message:
<<<
${message}
>>>

REQUIREMENTS:
- Return ONLY the rewritten message.
- Do NOT say “Here is the rewritten version”.
- Do NOT explain what you did.
- Do NOT include quotation marks.`
          }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const improvedMessage = response.data.choices[0]?.message?.content || 'No response from AI';
    console.log('[API] MiniMax Success. Response length:', improvedMessage.length);
    res.json({ improvedMessage });
  } catch (error: any) {
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error('[API] MiniMax API Error:', errorMsg);
    res.status(500).json({ error: `MiniMax API Error: ${errorMsg}` });
  }
});

export default router;
