import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';

export async function POST(request: Request) {
  const { error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const { rawText } = await request.json();

    if (!rawText) {
      return NextResponse.json({ error: 'Missing raw text' }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing NVIDIA API Key. Please add NVIDIA_API_KEY to your environment variables.' }, { status: 500 });
    }

    const prompt = `You are a helpful assistant that extracts contact information from unstructured text.
Extract the following fields from the text provided below:
- name (Full Name)
- email (Email Address)
- phone (Phone Number)
- company (Company Name)
- source (Where the lead came from, e.g., Referral, Inbound - if not clear, leave empty)

Return ONLY a valid JSON object in the following format:
{
  "name": "",
  "email": "",
  "phone": "",
  "company": "",
  "source": ""
}
If a field cannot be determined, return an empty string for that field. Do not include any markdown formatting, markdown code blocks, or extra text. Only return the JSON object.

Text to parse:
"""
${rawText}
"""`;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        top_p: 1,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NVIDIA API Error:', errorText);
      return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // strip markdown code block mapping if present
    if (content.startsWith('\`\`\`json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('\`\`\`')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsedJSON = JSON.parse(content);
      return NextResponse.json(parsedJSON);
    } catch {
      console.error('Failed to parse JSON:', content);
      return NextResponse.json({ error: 'AI returned invalid JSON format' }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Error in parse-contact route:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
