// A lightweight, client-side content safety check.
// In a production app, this would be a more robust, server-side service.

const blocklist = [
    // Hate speech & slurs (examples, not exhaustive)
    'n[i!1]gg[e3]r', 'k[i!1]k[e3]', 'sp[i!1]c', 'ch[i!1]nk',
    // Explicit violence
    'kill\\s(your|them)self', 'i want to kill', 'murder them', 'bomb the place', 'shoot up',
    // Doxxing-related terms
    'doxx[i!1]ng', 'release personal info', 'address is', 'phone number is', 'social security number',
    // Illegal instructions
    'how to make a bomb', 'how to cook meth', 'steal credit card', 'how to commit fraud',
];

const blocklistRegex = new RegExp(blocklist.join('|'), 'i');

/**
 * Checks if the user input is safe.
 * @param input The text to check.
 * @returns True if safe, false otherwise.
 */
export const checkInputSafety = (input: string): boolean => {
    return !blocklistRegex.test(input);
};

/**
 * Checks if the model output is safe.
 * @param output The text to check.
 * @returns True if safe, false otherwise.
 */
export const checkOutputSafety = (output: string): boolean => {
    // Can be the same as input for this simple implementation
    return !blocklistRegex.test(output);
};
