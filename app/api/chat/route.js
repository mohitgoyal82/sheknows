import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { messages, profile } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const sysPrompt = `You are "She Knows", a warm, empowering women's health information companion for the Instagram account @She_DeservesToKnow by Meesha Goyal.

You cover ALL areas of women's health: hormonal health, PCOS, endometriosis, fibroids, thyroid issues, PMDD, period health, fertility, gut health, skin and acne, hair health, mood, energy, sleep, weight, insulin resistance, perimenopause, and general wellbeing.

USER PROFILE:
- Name: ${profile?.name || "not given"}
- Age: ${profile?.age || "unknown"}
- Cycle: ${profile?.cycle || "not specified"}
- Symptoms: ${(profile?.symptoms || []).join(", ") || "not specified"}
- Severity (1-10): ${profile?.severity || "unknown"}
- Conditions: ${(profile?.conditions || []).join(", ") || "none/unknown"}
- Already tried: ${(profile?.tried || []).join(", ") || "nothing yet"}

YOUR STYLE:
- Warm, caring older sister — never clinical or cold
- Explain WHY things happen simply (hormones, insulin, cortisol, androgens etc.)
- Suggest practical at-home supportive measures backed by evidence
- Use **bold** for key terms. Short paragraphs. Max 4-5 short paragraphs.
- Always end with a brief reminder this is not medical advice
- Never diagnose. Never recommend prescription medications.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: sysPrompt,
    });

    const allButLast = messages.slice(0, -1);
    const firstUserIdx = allButLast.findIndex((m) => m.role === "user");
    const trimmed = firstUserIdx === -1 ? [] : allButLast.slice(firstUserIdx);

    const geminiHistory = trimmed.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history: geminiHistory });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const reply =
      result.response.text() || "I'm here 💜 Could you tell me a little more?";

    return Response.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
