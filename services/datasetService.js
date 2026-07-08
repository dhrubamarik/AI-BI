const { Groq } = require('groq-sdk');
const _ = require('lodash');

class DatasetService {
    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        // Fallback patterns (backup when AI fails)
        this.patterns = {
            sales: ["sales", "revenue", "profit", "quantity", "product", "amount", "price", "invoice"],
            hr: ["employee", "salary", "department", "designation", "experience"],
            finance: ["stock", "close", "open", "volume", "market", "investment"],
            inventory: ["stock", "warehouse", "inventory", "supplier", "quantity"],
            marketing: ["campaign", "clicks", "impressions", "ctr", "conversion"]
        };
    }

    async analyzeDataset(headers, sampleData, fileName) {
        try {
            console.log('🤖 Starting AI analysis...');

            // Primary: AI Analysis
            const aiAnalysis = await this.performAIAnalysis(headers, sampleData, fileName);

            // Enhance with calculated metrics
            const enhancedAnalysis = await this.enhanceWithMetrics(aiAnalysis, sampleData);

            console.log('✅ AI analysis complete');
            return enhancedAnalysis;

        } catch (error) {
            console.error('❌ AI analysis failed, using fallback:', error.message);
            // Fallback: Pattern matching
            return this.fallbackAnalysis(headers, sampleData, fileName);
        }
    }

    async performAIAnalysis(headers, sampleData, fileName) {
        const prompt = `
You are a business intelligence expert. Analyze this CSV dataset:

Filename: ${fileName}
Headers: ${headers.join(', ')}

Sample Data (first 3 rows):
${JSON.stringify(sampleData, null, 2)}

Return ONLY this JSON structure:
{
  "businessDomain": "sales|hr|finance|inventory|marketing|operations|customer|logistics|unknown",
  "confidence": 0.95,
  "description": "Brief description of what this dataset contains",
  "keyColumns": {
    "metrics": ["numerical columns that measure business performance"],
    "dimensions": ["categorical columns that segment/group data"],
    "identifiers": ["unique ID columns"],
    "dates": ["date/time columns"]
  },
  "dataTypes": {
    "column_name": "currency|number|percentage|date|category|text|id|boolean"
  },
  "suggestedKPIs": [
    "Total Revenue",
    "Average Order Value", 
    "Monthly Growth Rate"
  ],
  "businessQuestions": [
    "What was the total revenue last quarter?",
    "Which product category performs best?",
    "What's the monthly trend?"
  ],
  "insights": [
    "Dataset contains sales transaction data",
    "Time series analysis possible with date column",
    "Revenue analysis can be performed"
  ]
}`;

        const response = await this.groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            max_tokens: 1200
        });

        return JSON.parse(response.choices[0].message.content);
    }

    async enhanceWithMetrics(analysis, sampleData) {
        // Calculate basic statistics for numeric columns
        const metrics = analysis.keyColumns.metrics;
        const statistics = {};

        metrics.forEach(metric => {
            const values = sampleData
                .map(row => parseFloat(row[metric]))
                .filter(val => !isNaN(val));

            if (values.length > 0) {
                statistics[metric] = {
                    min: Math.min(...values),
                    max: Math.max(...values),
                    avg: values.reduce((a, b) => a + b, 0) / values.length,
                    sum: values.reduce((a, b) => a + b, 0)
                };
            }
        });

        return {
            ...analysis,
            statistics,
            sampleSize: sampleData.length,
            analyzedAt: new Date().toISOString()
        };
    }

    fallbackAnalysis(headers, sampleData, fileName) {
        console.log('🔄 Using fallback pattern matching...');

        const lowerHeaders = headers.map(h => h.toLowerCase());
        let bestType = "unknown";
        let bestScore = 0;

        // Pattern matching logic
        for (const type in this.patterns) {
            let score = 0;
            this.patterns[type].forEach(keyword => {
                if (lowerHeaders.some(h => h.includes(keyword))) {
                    score++;
                }
            });
            if (score > bestScore) {
                bestScore = score;
                bestType = type;
            }
        }

        // Basic column categorization
        const metrics = headers.filter(h => this.looksNumeric(h, sampleData));
        const dates = headers.filter(h => this.looksLikeDate(h, sampleData));
        const identifiers = headers.filter(h => this.looksLikeId(h));
        const dimensions = headers.filter(h =>
            !metrics.includes(h) && !dates.includes(h) && !identifiers.includes(h)
        );

        return {
            businessDomain: bestType,
            confidence: bestScore > 0 ? bestScore * 0.2 : 0.1,
            description: `${bestType} dataset detected via pattern matching`,
            keyColumns: { metrics, dimensions, identifiers, dates },
            dataTypes: this.inferDataTypes(headers, sampleData),
            suggestedKPIs: this.getDefaultKPIs(bestType),
            businessQuestions: this.getDefaultQuestions(bestType),
            insights: [`Pattern-based analysis identified this as ${bestType} data`],
            statistics: {},
            sampleSize: sampleData.length,
            analyzedAt: new Date().toISOString(),
            fallback: true
        };
    }

    looksNumeric(header, sampleData) {
        const numericKeywords = ['amount', 'price', 'cost', 'revenue', 'profit', 'quantity', 'total', 'value'];
        if (numericKeywords.some(kw => header.toLowerCase().includes(kw))) return true;

        // Check actual data
        const sample = sampleData.slice(0, 3).map(row => row[header]);
        return sample.every(val => !isNaN(parseFloat(val)));
    }

    looksLikeDate(header, sampleData) {
        const dateKeywords = ['date', 'time', 'created', 'updated', 'timestamp'];
        if (dateKeywords.some(kw => header.toLowerCase().includes(kw))) return true;

        // Check actual data
        const sample = sampleData.slice(0, 3).map(row => row[header]);
        return sample.some(val => !isNaN(Date.parse(val)));
    }

    looksLikeId(header) {
        return header.toLowerCase().includes('id') || header.toLowerCase().includes('key');
    }

    inferDataTypes(headers, sampleData) {
        const types = {};
        headers.forEach(header => {
            if (this.looksNumeric(header, sampleData)) types[header] = 'number';
            else if (this.looksLikeDate(header, sampleData)) types[header] = 'date';
            else if (this.looksLikeId(header)) types[header] = 'id';
            else types[header] = 'category';
        });
        return types;
    }

    getDefaultKPIs(type) {
        const defaults = {
            sales: ["Total Revenue", "Average Order Value", "Sales Count"],
            hr: ["Average Salary", "Employee Count", "Department Distribution"],
            finance: ["Total Investment", "Average Return", "Portfolio Value"],
            inventory: ["Stock Levels", "Reorder Points", "Turnover Rate"],
            marketing: ["Total Impressions", "Click-through Rate", "Conversion Rate"]
        };
        return defaults[type] || ["Record Count", "Data Summary"];
    }

    getDefaultQuestions(type) {
        const defaults = {
            sales: ["What's the total revenue?", "Which product sells most?", "What's the monthly trend?"],
            hr: ["What's the average salary by department?", "How many employees per role?"],
            finance: ["What's the portfolio performance?", "Which stocks performed best?"],
            inventory: ["What items need restocking?", "What's the turnover rate?"],
            marketing: ["What's the conversion rate?", "Which campaigns work best?"]
        };
        return defaults[type] || ["What patterns do you see?", "Summarize this data"];
    }
}

module.exports = DatasetService;