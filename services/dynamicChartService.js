const { Groq } = require("groq-sdk");

class DynamicChartService {
    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
            // INCREASE TIMEOUT
            timeout: 120 * 1000
        });
    }

    async generateChartsWithAI(data, schema, question) {
        try {
            const prompt = `
            You are a Data Visualization expert.
            TASK: Decide if the user's question: "${question}" requires a chart.
            
            RULES:
            1. If the question is about "Revenue", "Sales", "Distribution", or "Comparison", generate a chart.
            2. If the question is a simple greeting or non-data related, return exactly [].
            3. Use 'pie' or 'doughnut' for distributions. Use 'bar' for comparisons. Use 'line' for trends.
            
            DATA SCHEMA:
            - Metrics: ${schema.keyColumns?.metrics?.join(', ')}
            - Dimensions: ${schema.keyColumns?.dimensions?.join(', ')}
            
            Return ONLY a JSON array:
            [{
              "type": "bar|pie|line",
              "title": "Clear Chart Title",
              "fields": { "label": "dimension_column", "value": "metric_column" }
            }]`;

            const response = await this.groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.1
            });

            const configs = JSON.parse(response.choices[0].message.content);
            return configs.map(conf => this.processData(data, conf)).filter(c => c !== null);
        } catch (e) { return []; }
    }

    processData(data, config) {
        const { label, value } = config.fields;
        const groups = {};

        data.forEach(row => {
            const k = row[label] || 'Other';
            const v = parseFloat(row[value]) || 0;
            groups[k] = (groups[k] || 0) + v;
        });

        const labels = Object.keys(groups);
        const values = Object.values(groups);

        if (labels.length === 0) return null;

        return {
            type: config.type,
            title: config.title,
            data: {
                labels,
                datasets: [{
                    label: value,
                    data: values,
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        };
    }
}
module.exports = DynamicChartService;