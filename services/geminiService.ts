
import { GoogleGenAI, Type } from "@google/genai";
import { shortReplySystemPrompt } from '../prompts/shortReplySystemPrompt';
import { viralTweetsFromExamplesSystemPrompt } from '../prompts/viralTweetsFromExamplesSystemPrompt';

// FIX: Initialize the Gemini AI client with the API key from environment variables.
// This function assumes the API_KEY is available as an environment variable.
// On Vercel, this will be configured in the project settings.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a short, context-aware reply for a social media post.
 */
export const generateShortReply = async (postContent: string, tone: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            // FIX: For simple text prompts, `contents` should be a string. Combining the post and tone into a single prompt.
            contents: `Original post: "${postContent}"\nTone for reply: ${tone}`,
            config: {
                systemInstruction: shortReplySystemPrompt,
                temperature: 0.6,
                topP: 0.95,
                maxOutputTokens: 120, 
                thinkingConfig: { thinkingBudget: 60 },
            }
        });

        const reply = response.text.trim();
        if (!reply) {
            throw new Error("The model returned an empty reply.");
        }
        return reply;
    } catch (error) {
        console.error("Error generating short reply:", error);
        throw new Error("Failed to generate reply. Please try again later.");
    }
};

/**
 * Generates viral tweet ideas based on existing examples.
 */
export const generateViralTweetsFromExamples = async (examples: string[]): Promise<string[]> => {
    try {
        const userPrompt = `Given these 5 example tweets (each on its own line), write 3 unique tweets that are engaging, friendly, and have viral potential.

Examples:
${examples.join('\n')}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    }
                },
                systemInstruction: viralTweetsFromExamplesSystemPrompt,
                temperature: 0.8,
                topP: 0.95,
                maxOutputTokens: 700, 
                thinkingConfig: { thinkingBudget: 300 },
            },
        });
        
        const jsonResponse = response.text.trim();
        if (!jsonResponse) {
            throw new Error("The model returned an empty response for viral tweets from examples.");
        }

        const parsedTweets: string[] = JSON.parse(jsonResponse);
        return parsedTweets;

    } catch (error) {
        console.error("Error generating viral tweets from examples:", error);
        throw new Error("Failed to generate tweet ideas. Please try again later.");
    }
};
