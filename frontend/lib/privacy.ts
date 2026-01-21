
export interface AnonymizedResult {
    anonymizedText: string;
    piiMap: Record<string, string>; // Token -> Original Value
}

export class PrivacyFilter {
    private static patterns = {
        // Basic regex for demonstration. 
        // In production, use more robust libraries or NER models if possible locally (e.g. Transformers.js)
        // Updated regex to handle both comma-formatted (50,000) and plain (50000) matches
        amount: /\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b|\b\d+\b/g,
        // Simple logic: Capitalized words that are not at start of sentence (very naive for "Names")
        // Improving this requires more complex logic, but for "Mock", we'll stick to a simpler heuristic or just specific PII markers if user inputs them?
        // Let's stick to the python logic: replacing numbers effectively.
        // And let's add a placeholder for Locations if we can detect them (hard without logic).
        // For this MVP, we will focus on Financial Logic (Numbers).
    };

    static anonymize(text: string): AnonymizedResult {
        let anonymizedText = text;
        const piiMap: Record<string, string> = {};
        let counter = 1;

        // Redact Amounts/Numbers (Financial Context)
        // We want to capture things that look like money or specific quantities.
        // For simplicity in this demo, we redact all number sequences.

        // Using a replace callback to handle each match unique if we wanted, 
        // but here we just want [AMOUNT_1], [AMOUNT_2] etc.

        // We need to find all matches first to not mess up indices during replacement
        const numberMatches = text.match(this.patterns.amount);

        if (numberMatches) {
            numberMatches.forEach((val) => {
                // Check if already mapped (duplicate reasoning)
                // If the same number appears twice, should it be same token? Yes usually.
                const existingToken = Object.keys(piiMap).find(key => piiMap[key] === val);

                if (existingToken) {
                    anonymizedText = anonymizedText.replace(val, existingToken);
                } else {
                    const token = `[AMOUNT_${counter}]`;
                    piiMap[token] = val;
                    anonymizedText = anonymizedText.replace(val, token);
                    counter++;
                }
            });
        }

        // Naive Location/Name detection (Simulated for specific keywords for the demo)
        // If the user says "Dhaka", we hide it.
        const sensitiveWords = ["Dhaka", "Bangladesh", "New York", "London", "Shuvo", "Alice"];
        let locCounter = 1;
        let personCounter = 1;

        sensitiveWords.forEach(word => {
            if (anonymizedText.includes(word)) {
                // Basic detection
                const isPerson = ["Shuvo", "Alice"].includes(word);
                const token = isPerson ? `[PERSON_${personCounter}]` : `[LOC_${locCounter}]`;

                // Only increment if new
                const existingToken = Object.keys(piiMap).find(key => piiMap[key] === word);
                if (!existingToken) {
                    piiMap[token] = word;
                    anonymizedText = anonymizedText.replaceAll(word, token);
                    if (isPerson) personCounter++; else locCounter++;
                } else {
                    anonymizedText = anonymizedText.replaceAll(word, existingToken);
                }
            }
        });

        return { anonymizedText, piiMap };
    }

    static restore(text: string, piiMap: Record<string, string>): string {
        let restored = text;
        for (const [token, value] of Object.entries(piiMap)) {
            restored = restored.replaceAll(token, value);
        }
        return restored;
    }
}
