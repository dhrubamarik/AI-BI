class KPIEngine {
  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async generateKPIs(schema, data) {
    const calculations = await this.calculateMetrics(schema, data);
    const insights = await this.generateInsights(schema, calculations);
    
    return {
      calculations,
      insights,
      visualizations: this.suggestCharts(schema, calculations)
    };
  }

  calculateMetrics(schema, data) {
    const metrics = {};
    
    // Dynamic aggregations based on schema
    schema.keyColumns.metrics.forEach(metric => {
      if (schema.dataTypes[metric] === 'currency') {
        metrics[`total_${metric}`] = this.sum(data, metric);
        metrics[`avg_${metric}`] = this.average(data, metric);
      }
    });

    // Time-based analysis if date column exists
    const dateColumn = schema.keyColumns.dimensions.find(col => 
      schema.dataTypes[col] === 'date'
    );
    
    if (dateColumn) {
      metrics.timeSeriesData = this.groupByTime(data, dateColumn, schema.keyColumns.metrics);
    }

    return metrics;
  }

  async generateInsights(schema, calculations) {
    const prompt = `
Based on this business data analysis, provide 3-5 key insights:

Domain: ${schema.businessDomain}
Metrics: ${JSON.stringify(calculations)}

Return JSON array of insights:
[
  {
    "type": "trend|comparison|anomaly|opportunity",
    "title": "Revenue increased 15% in Q2",
    "description": "Detailed explanation...",
    "impact": "high|medium|low",
    "actionable": true
  }
]`;

    const response = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768"
    });

    return JSON.parse(response.choices[0].message.content);
  }
}