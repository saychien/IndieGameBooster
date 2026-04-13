import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. Using mock mode.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export async function analyzeGame(input: string, strategy: 'EarlyAccess' | 'FullRelease') {
  const ai = getAI();
  
  if (!ai) {
    // Mock fallback for demo purposes if API key is missing
    return {
      title: "Demo Game (Mock)",
      tags: ["Indie", "Action", "Pixel Art", "Sci-Fi", "Hardcore"],
      keywords: ["indie game dev", "pixel art action", "hardcore platformer", "retro gaming", "speedrun", "metroidvania", "challenging games", "pc gaming"]
    };
  }

  try {
    const prompt = `
      Analyze the following game information (could be a Steam link description or raw text).
      Return a JSON object with:
      1. "title": The name of the game (if found, else "Unknown Game").
      2. "tags": A set of 5 to 7 tags that best describe the game (Genres, Visual Style, Themes, Moods, Features).
      3. "keywords": 8 specific search keywords for finding content creators who would like this game.
      
      Marketing Strategy: ${strategy === 'EarlyAccess' ? 'Niche/Hardcore (Focus on veteran genre players and deep-dive reviewers)' : 'Broad/Lifestyle (Focus on variety streamers, cozy vloggers, and mainstream appeal)'}.
      
      Game Info: ${input}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["title", "tags", "keywords"],
        },
      },
    });

    if (!response.text) throw new Error("Empty response from AI");
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis failed, using fallback:", error);
    return {
      title: "Analysis Failed (Using Fallback)",
      tags: ["Indie", "Strategy", "Simulation", "Casual", "Relaxing"],
      keywords: ["indie games", "gameplay walkthrough", "game review", "new indie games", "gaming community", "indie dev", "steam games", "indie spotlight"]
    };
  }
}

export async function generateReachOutEmail(gameTitle: string, creatorName: string, channelInfo: string, keysCount: number) {
  const ai = getAI();
  if (!ai) return "Mock Email: Hi " + creatorName + ", we'd love to collaborate on " + gameTitle + "!";

  try {
    const prompt = `
      Please generate a cooperation email with the content creator "${creatorName}" in a polite but chill tone.
      Introduce our game "${gameTitle}".
      Describe a bit about what we know about their channel ("${channelInfo}") and why we'd love to reach out.
      Ask them if they would love to play our game for free and review our game.
      We can offer ${keysCount} game keys for them to give away.
      No emoji, no dash.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Failed to generate email content.";
  } catch (error) {
    console.error("Email generation failed:", error);
    return "Hi " + creatorName + ",\n\nWe love your content and think our game " + gameTitle + " would be a great fit for your channel. Would you be interested in a few keys to try it out?\n\nBest regards,\nThe Dev Team";
  }
}

export async function generateRedNotePost(gameTitle: string, tags: string[]) {
  const ai = getAI();
  if (!ai) return "[游戏推荐] 这款游戏太赞了！ #" + gameTitle;

  try {
    const prompt = `
      Generate a RedNote (小红书) game recommendation post for "${gameTitle}".
      Use a catchy title with brackets like [游戏推荐].
      Include relevant hashtags.
      Focus on the visual style and mood based on these tags: ${tags.join(", ")}.
      The tone should be enthusiastic and lifestyle-oriented.
      Language: Chinese.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Failed to generate RedNote post.";
  } catch (error) {
    console.error("RedNote generation failed:", error);
    return "[游戏推荐] 发现一款宝藏游戏 " + gameTitle + "！风格真的很独特，推荐给大家！ #游戏推荐 #独立游戏";
  }
}

export async function generateRedditRecommendations(gameTitle: string, tags: string[]) {
  const ai = getAI();
  if (!ai) return "r/IndieGaming, r/Gaming";

  try {
    const prompt = `
      Recommend 5 subreddits where I should promote my game "${gameTitle}".
      Base it on these tags: ${tags.join(", ")}.
      For each subreddit, provide a brief reason why it's a good fit.
      Return as a list.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Failed to generate Reddit recommendations.";
  } catch (error) {
    console.error("Reddit recommendation failed:", error);
    return "1. r/IndieGaming - Great for general indie game discovery\n2. r/Gaming - Large audience for all types of games";
  }
}
