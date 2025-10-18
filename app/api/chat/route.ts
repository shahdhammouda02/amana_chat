import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message } = await request.json();

  try {
    // Simple AI responses
    const responses = [
      `You said: "${message}". That's interesting!`,
      `Thanks for sharing: "${message}". Tell me more!`,
      `I understand you're saying: "${message}". How can I help?`,
      `Regarding "${message}", I'd love to know more about that.`,
      `"${message}" - that's a great point! What else is on your mind?`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return NextResponse.json({ 
      response: randomResponse 
    });
  } catch (error) {
    return NextResponse.json({ 
      response: "Sorry, I'm having trouble responding right now." 
    });
  }
}