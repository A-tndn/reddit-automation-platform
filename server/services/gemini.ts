import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export async function generateComment(postTitle: string, postContent: string, apiKey?: string): Promise<string> {
  try {
    const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : ai;
    
    const prompt = `Post: ${postTitle}
${postContent ? `Content: ${postContent}` : ''}

Write a short 10-20 word Reddit comment. No quotes, emojis, or markdown.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "Generate concise Reddit comments. 10-20 words only.",
        maxOutputTokens: 50,
      },
      contents: prompt,
    });
    
    let comment = response.text?.trim() || "";
    
    // Clean and enforce word limit
    comment = comment.replace(/["""'']/g, '').replace(/\*\*|\*|_/g, '').trim();
    const words = comment.split(/\s+/).filter(w => w.length > 0);
    
    if (words.length < 10 || words.length > 20) {
      // Fallback for length issues
      comment = words.slice(0, 15).join(' ');
    }

    return comment || "Great post! Thanks for sharing this interesting content.";
  } catch (error) {
    console.error("Error generating comment:", error);
    throw new Error(`Failed to generate comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generatePost(subreddit: string, topic: string, apiKey?: string): Promise<{ title: string; content: string }> {
  try {
    const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : ai;
    
    const systemPrompt = `You are a Reddit content creator who writes engaging posts for specific subreddits.
Your posts should be:
- Relevant to the subreddit topic
- Engaging and discussion-worthy
- Follow Reddit best practices
- Have compelling titles
- Provide valuable content
- Be authentic and conversational

Generate both a title and content for the post. Return as JSON with "title" and "content" fields.`;

    const userPrompt = `Create a post for r/${subreddit} about: ${topic}

Generate an engaging Reddit post with title and content.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
          },
          required: ["title", "content"],
        },
      },
      contents: userPrompt,
    });

    const rawJson = response.text;
    
    if (!rawJson) {
      throw new Error("Failed to generate post - empty response");
    }

    const data = JSON.parse(rawJson);
    
    if (!data.title || !data.content) {
      throw new Error("Invalid response format from AI");
    }

    return {
      title: data.title,
      content: data.content,
    };
  } catch (error) {
    console.error("Error generating post:", error);
    throw new Error(`Failed to generate post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzePostSentiment(postTitle: string, postContent: string, apiKey?: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  shouldComment: boolean;
}> {
  try {
    const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : ai;
    
    const systemPrompt = `You are a sentiment analysis expert for Reddit posts.
Analyze the sentiment and determine if it's appropriate to comment.
Consider factors like:
- Overall tone (positive, negative, neutral)
- Engagement potential
- Controversy level
- Community guidelines

Return JSON with sentiment, confidence (0-1), and shouldComment boolean.`;

    const userPrompt = `Analyze this Reddit post:

Title: ${postTitle}
Content: ${postContent || 'No content provided'}

Provide sentiment analysis and commenting recommendation.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-pro", 
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            sentiment: { 
              type: "string",
              enum: ["positive", "negative", "neutral"]
            },
            confidence: { type: "number" },
            shouldComment: { type: "boolean" },
          },
          required: ["sentiment", "confidence", "shouldComment"],
        },
      },
      contents: userPrompt,
    });

    const rawJson = response.text;
    
    if (!rawJson) {
      throw new Error("Failed to analyze sentiment - empty response");
    }

    const data = JSON.parse(rawJson);
    
    return {
      sentiment: data.sentiment,
      confidence: data.confidence,
      shouldComment: data.shouldComment,
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    throw new Error(`Failed to analyze sentiment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
