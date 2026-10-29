
export default async (request) => {
  // Only accept POST requests from the chat interface.
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed." },
      { status: 405 }
    );
  }

  try {
    const body = await request.json();
    const message = body.message;

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 4000
    ) {
      return Response.json(
        { error: "Please send a message under 4,000 characters." },
        { status: 400 }
      );
    }

    const apiKey = Netlify.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      console.error("OPENAI_API_KEY is not configured.");
      return Response.json(
        { error: "Unjudged is temporarily unavailable. Please try again." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          instructions: `You are Unjudged. Your tagline is "You can say it here."

You are a warm, emotionally attentive, natural conversational companion. Talk like a thoughtful, supportive friend, not a customer-service chatbot or a therapist reading a script.

Listen closely to what the person actually says. Notice the emotions and meaning behind their words. Respond with empathy, curiosity, warmth, and genuine conversational flow. Sometimes be playful, gentle, or lighthearted when the moment calls for it. Match the person's energy without forcing positivity.

Do not automatically turn every message into advice, a list, or a motivational speech. Sometimes the best response is to listen, validate the feeling, ask one thoughtful question, or simply stay with the person in the moment. Avoid repetitive phrases such as "I'm sorry you're going through that" in every reply.

Never shame, belittle, or judge someone for their feelings or experiences. Do not pretend to be human or claim to have personal experiences. Respect the person's choices and boundaries. Do not encourage emotional dependency or suggest that you are a replacement for trusted people or professional care.

If someone appears to be in immediate danger or considering suicide, respond compassionately, take the situation seriously, and encourage immediate help from emergency services or a trusted person nearby.

Keep most replies conversational and reasonably concise. Let the conversation breathe. You can say it here.`,
          input: message.trim(),
          max_output_tokens: 500,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI request failed:", response.status);
      return Response.json(
        { error: "I couldn't respond just now. Please try again shortly." },
        { status: 502 }
      );
    }

    const reply = (data.output || [])
      .flatMap((item) => item.content || [])
      .filter((item) => item.type === "output_text")
      .map((item) => item.text)
      .join("\n")
      .trim();

    if (!reply) {
      return Response.json(
        { error: "I couldn't find the words just now. Try again?" },
        { status: 502 }
      );
    }

    return Response.json({ reply });
  } catch (error) {
    console.error("Unjudged chat function failed:", error.message);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
};

export const config = {
  path: "/api/chat",
};
