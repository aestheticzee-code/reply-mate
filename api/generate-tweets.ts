
// Assuming a Next.js-like API route environment
import { generateViralTweetsFromExamples } from '../services/geminiService';
import { checkInputSafety, checkOutputSafety } from '../services/contentSafetyService';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { examples } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        if (!examples || !Array.isArray(examples) || examples.length === 0) {
            return res.status(400).json({ message: 'Missing or invalid examples array' });
        }

        if (examples.some(ex => !checkInputSafety(ex))) {
            return res.status(400).json({ message: 'Input contains potentially unsafe content.' });
        }

        const tweets = await generateViralTweetsFromExamples(examples);

        if (tweets.some(tweet => !checkOutputSafety(tweet))) {
             console.warn(`Unsafe content generated and blocked for examples: ${examples.join(', ')}`);
             return res.status(500).json({ message: 'Generated content was deemed unsafe.' });
        }

        res.status(200).json({ tweets });
    } catch (error) {
        console.error('API Error in /api/generate-tweets:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        res.status(500).json({ message: errorMessage });
    }
}
