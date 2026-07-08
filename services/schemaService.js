const { Groq } = require('groq-sdk');

class SchemaService {
    constructor() {
        this.groq = new Groq({ 
            apiKey: process.env.GROQ_API_KEY 
        });
    }

    async analyzeSchema(headers, sampleData) {
        try {
            const prompt = this.buildAnalysisPrompt(headers, sampleData);
            
            const response = await this.groq.chat.completions.create({
                messages: [{ 
                    role: "user", 
                    content: prompt 
                }],
                model: "llama-3.3-70b-versatile", 
                temperature: 0.1, // Low temperature for consistent results
                max_tokens: 1000
            });

            const analysis = JSON.parse(response.choices[0].message.content);
            return this.validateAndEnhance(analysis, headers);
            
        } catch (error) {
            console.error('Schema analysis failed:', error);
            // Fallback to your existing pattern matching
            return this.fallbackAnalysis(headers, sampleData);
        }
    }

    buildAnalysisPrompt(headers, sampleData) {
        return `
You are a business data analyst. Analyze this dataset and return ONLY valid JSON.

Headers: ${headers.join(', ')}

Sample Data:
${JSON.stringify(sampleData, null, 2)}

Analyze and return this exact JSON structure:
{
  "businessDomain": "sales|hr|finance|inventory|marketing|operations|customer|unknown",
  "confidence": 0.95,
  "keyColumns": {
    "metrics": ["column_names_that_are_numbers_to_measure"],
    "dimensions": ["column_names_that_categorize_data"], 
    "identifiers": ["column_names_that_are_unique_ids"],
    "dates": ["column_names_that_are_dates"]
  },
  "dataTypes": {
    "column_name": "currency|number|date|category|text|id"
  },
  "suggestedKPIs": [
    "Total Revenue",
    "Average Deal Size", 
    "Growth Rate"
  ],
  "insights": [
    "This appears to be sales transaction data",
    "Contains time series information for trend analysis"
  ]
}

Rules:
- businessDomain: Pick the most likely business area
- confidence: 0-1 based on how clear the data type is
- metrics: Numerical columns that businesses measure
- dimensions: Categorical columns that segment data
- Return ONLY the JSON, no other text`;
    }

    validateAndEnhance(analysis, headers) {
        // Ensure all headers are categorized
        const categorized = new Set([
            ...analysis.keyColumns.metrics,
            ...analysis.keyColumns.dimensions,
            ...analysis.keyColumns.identifiers,
            ...analysis.keyColumns.dates
        ]);

        headers.forEach(header => {
            if (!categorized.has(header)) {
                analysis.keyColumns.dimensions.push(header);
            }
        });

        return analysis;
    }

    fallbackAnalysis(headers, sampleData) {
        // Your existing pattern matching as backup
        return {
            businessDomain: "unknown",
            confidence: 0.3,
            keyColumns: {
                metrics: headers.filter(h => this.looksLikeNumber(h)),
                dimensions: headers.filter(h => !this.looksLikeNumber(h)),
                identifiers: [],
                dates: []
            },
            dataTypes: {},
            suggestedKPIs: ["Basic Count", "Simple Average"],
            insights: ["Fallback analysis - AI unavailable"]
        };
    }

    looksLikeNumber(header) {
        const numberKeywords = ['amount', 'price', 'cost', 'revenue', 'profit', 'quantity', 'total'];
        return numberKeywords.some(keyword => 
            header.toLowerCase().includes(keyword)
        );
    }
}

module.exports = SchemaService;