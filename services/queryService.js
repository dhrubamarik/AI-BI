const { Groq } = require("groq-sdk");

class QueryService {
    constructor() {
        this.groq = new Groq({ 
            apiKey: process.env.GROQ_API_KEY,
            // INCREASE TIMEOUT TO 2 MINUTES (120,000ms)
            timeout: 120 * 1000 
        });
    }
    async handleQuestion(question, fileData, conversationContext) {
        const schema = fileData.schema;
        const contextStr = conversationContext
            .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
            .join('\n');

        const prompt = `
        SYSTEM: You are a "Strict Business Intelligence Analyst".
        
        RULES:
        1. ONLY answer questions using the provided CSV data.
        2. NEVER provide programming code (Java, Python, SQL, etc.). If asked, say: "I am a BI Analyst, not a coder. I can only analyze your data."
        3. Provide direct, numerical answers. (e.g., "Total Revenue is $5,000").
        4. If the data to answer is not in the CSV, say: "I don't have that information in the current dataset."
        5. DO NOT provide code blocks (\`\`\`).
        
        FILE INFO:
        - Filename: ${fileData.fileName}
        - Domain: ${fileData.domain}
        - Metrics: ${schema.keyColumns?.metrics?.join(', ')}
        - Dimensions: ${schema.keyColumns?.dimensions?.join(', ')}
        
        CONVERSATION HISTORY:
        ${contextStr}
        
        USER QUESTION: "${question}"
        
        ANSWER:`;

        const response = await this.groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            max_tokens: 800
        });

        return response.choices[0].message.content;
    }
}
module.exports = QueryService;