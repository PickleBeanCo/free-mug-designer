import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { history, message } = await req.json();

    // The modern SDK automatically reads GEMINI_API_KEY from Vercel variables
    const ai = new GoogleGenAI();

    const systemInstruction = "You are a professional custom mug design assistant. Your goal is to discover what the user wants printed on their mug. Ask exactly one question at a time. First ask if they want Full Wrap or Single Graphic. Second, ask about the main subject matter. Third, ask if they want any text or a specific name included, reminding them to keep it short. Fourth, ask about the artistic style (e.g., watercolor, minimalist) and colours. Once you have all info, stop asking questions and reply exactly with the word: GENERATE followed by a highly descriptive image prompt detailing the layout, text, and styles. Speak only in plain friendly text conversation.";

    // Convert the conversation log into the unified chat history format Google expects
    const formattedContents = history.map(item => ({
      role: item.role === 'model' ? 'model' : 'user',
      parts: [{ text: item.parts[0].text }]
    }));

    // Add the new user message to the end of the history array
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Run the text generation request on Google's modern engine
    const responseResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = responseResult.text;

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("Backend Crash Details:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
