
// Assuming a Next.js-like API route environment
import { generateShortReply } from '../services/geminiService';
import { checkInputSafety, checkOutputSafety } from '../services/contentSafetyService';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { postContent, tone } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        if (!postContent || !tone) {
            return res.status(400).json({ message: 'Missing postContent or tone' });
        }

        if (!checkInputSafety(postContent) || !checkInputSafety(tone)) {
            return res.status(400).json({ message: 'Input contains potentially unsafe content.' });
        }

        const reply = await generateShortReply(postContent, tone);

        if (!checkOutputSafety(reply)) {
            // Log this event for review
            console.warn(`Unsafe content generated and blocked for input: ${postContent}`);
            return res.status(500).json({ message: 'Generated content was deemed unsafe.' });
        }

        res.status(200).json({ reply });
    } catch (error) {
        console.error('API Error in /api/generate-reply:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        res.status(500).json({ message: errorMessage });
    }
}
