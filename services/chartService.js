class ChartService {
    static generateChartConfig(data, domain, question) {
        console.log(`📊 Generating charts for domain: ${domain}`);
        console.log(`❓ Question: ${question}`);
        console.log(`📈 Data rows: ${data.length}`);

        if (domain === 'hr') {
            return this.generateHRCharts(data, question);
        } else if (domain === 'sales') {
            return this.generateSalesCharts(data, question);
        } else if (domain === 'finance') {
            return this.generateFinanceCharts(data, question);
        } else if (domain === 'inventory') {
            return this.generateInventoryCharts(data, question);
        } else if (domain === 'marketing') {
            return this.generateMarketingCharts(data, question);
        }
        
        console.log('⚠️ No charts for domain:', domain);
        return [];
    }

    // ─────────────────────────────────────────
    // MARKETING CHARTS
    // ─────────────────────────────────────────
    static generateMarketingCharts(data, question) {
        const charts = [];
        const lowerQuestion = question.toLowerCase();

        console.log('🎨 Generating Marketing charts...');

        // 1. Impressions by Channel (Pie Chart)
        if (lowerQuestion.includes('impression') || lowerQuestion.includes('channel') || lowerQuestion.includes('reach')) {
            const channelImpressions = {};
            
            data.forEach(row => {
                const channel = row.channel || row.Channel || 'Unknown';
                const impressions = parseFloat(row.impressions || row.Impressions || 0) || 0;
                channelImpressions[channel] = (channelImpressions[channel] || 0) + impressions;
            });

            console.log('📢 Channel impressions:', channelImpressions);

            charts.push({
                type: 'doughnut',
                title: 'Total Impressions by Channel',
                data: {
                    labels: Object.keys(channelImpressions),
                    datasets: [{
                        data: Object.values(channelImpressions),
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40'
                        ],
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return context.label + ': ' + value.toLocaleString() + ' (' + percentage + '%)';
                                }
                            }
                        }
                    }
                }
            });
        }

        // 2. Revenue by Channel (Bar Chart)
        if (lowerQuestion.includes('revenue') || lowerQuestion.includes('income') || lowerQuestion.includes('earnings')) {
            const channelRevenue = {};
            
            data.forEach(row => {
                const channel = row.channel || row.Channel || 'Unknown';
                const revenue = parseFloat(row.revenue || row.Revenue || 0) || 0;
                channelRevenue[channel] = (channelRevenue[channel] || 0) + revenue;
            });

            console.log('💰 Channel revenue:', channelRevenue);

            charts.push({
                type: 'bar',
                title: 'Total Revenue by Channel',
                data: {
                    labels: Object.keys(channelRevenue),
                    datasets: [{
                        label: 'Revenue ($)',
                        data: Object.values(channelRevenue),
                        backgroundColor: '#36A2EB',
                        borderColor: '#1e88e5',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return '$ ' + context.parsed.x.toLocaleString();
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // 3. Clicks/Conversions by Channel (Bar Chart)
        if (lowerQuestion.includes('click') || lowerQuestion.includes('conversion') || lowerQuestion.includes('ctr')) {
            const channelClicks = {};
            const channelConversions = {};
            
            data.forEach(row => {
                const channel = row.channel || row.Channel || 'Unknown';
                const clicks = parseFloat(row.clicks || row.Clicks || 0) || 0;
                const conversions = parseFloat(row.conversions || row.Conversions || 0) || 0;
                
                channelClicks[channel] = (channelClicks[channel] || 0) + clicks;
                channelConversions[channel] = (channelConversions[channel] || 0) + conversions;
            });

            console.log('🔗 Channel clicks:', channelClicks);

            charts.push({
                type: 'bar',
                title: 'Clicks & Conversions by Channel',
                data: {
                    labels: Object.keys(channelClicks),
                    datasets: [
                        {
                            label: 'Clicks',
                            data: Object.values(channelClicks),
                            backgroundColor: '#36A2EB',
                            borderColor: '#1e88e5',
                            borderWidth: 1,
                            borderRadius: 4
                        },
                        {
                            label: 'Conversions',
                            data: Object.values(channelConversions),
                            backgroundColor: '#4BC0C0',
                            borderColor: '#00897b',
                            borderWidth: 1,
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // 4. Campaign Performance (Top Campaigns)
        if (lowerQuestion.includes('campaign') || lowerQuestion.includes('performance') || lowerQuestion.includes('best')) {
            const campaignData = [];
            
            data.forEach(row => {
                const name = row.campaign_name || row.Campaign_Name || 'Campaign';
                const revenue = parseFloat(row.revenue || row.Revenue || 0) || 0;
                const cost = parseFloat(row.cost || row.Cost || 0) || 0;
                const conversions = parseFloat(row.conversions || row.Conversions || 0) || 0;
                
                campaignData.push({
                    name: name.substring(0, 20),
                    revenue: revenue,
                    conversions: conversions,
                    roi: cost > 0 ? ((revenue - cost) / cost * 100).toFixed(1) : 0
                });
            });

            // Sort by revenue and take top 8
            campaignData.sort((a, b) => b.revenue - a.revenue);
            const topCampaigns = campaignData.slice(0, 8);

            console.log('🏆 Top campaigns:', topCampaigns);

            charts.push({
                type: 'bar',
                title: 'Top Campaigns by Revenue',
                data: {
                    labels: topCampaigns.map(c => c.name),
                    datasets: [{
                        label: 'Revenue ($)',
                        data: topCampaigns.map(c => c.revenue),
                        backgroundColor: '#4BC0C0',
                        borderColor: '#00897b',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return '$ ' + context.parsed.x.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }

        // 5. Cost vs Revenue (Line Chart)
        if (lowerQuestion.includes('cost') || lowerQuestion.includes('roi') || lowerQuestion.includes('profit')) {
            const costData = [];
            const revenueData = [];
            const labels = [];

            data.forEach((row, idx) => {
                if (idx < 15) { // Limit to 15 for readability
                    const cost = parseFloat(row.cost || row.Cost || 0) || 0;
                    const revenue = parseFloat(row.revenue || row.Revenue || 0) || 0;
                    costData.push(cost);
                    revenueData.push(revenue);
                    labels.push(`C${idx + 1}`);
                }
            });

            console.log('📈 Cost vs Revenue data loaded');

            charts.push({
                type: 'line',
                title: 'Cost vs Revenue per Campaign',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Cost ($)',
                            data: costData,
                            borderColor: '#FF6384',
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Revenue ($)',
                            data: revenueData,
                            borderColor: '#36A2EB',
                            backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            tension: 0.4,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }

        // 6. Audience Size Distribution (Pie)
        if (lowerQuestion.includes('audience') || lowerQuestion.includes('reach') || lowerQuestion.includes('size')) {
            const audienceByDevice = {};
            
            data.forEach(row => {
                const device = row.device_type || row.Device_Type || 'Unknown';
                const audience = parseFloat(row.audience_size || row.Audience_Size || 0) || 0;
                audienceByDevice[device] = (audienceByDevice[device] || 0) + audience;
            });

            console.log('📱 Audience by device:', audienceByDevice);

            charts.push({
                type: 'pie',
                title: 'Audience Size by Device Type',
                data: {
                    labels: Object.keys(audienceByDevice),
                    datasets: [{
                        data: Object.values(audienceByDevice),
                        backgroundColor: ['#36A2EB', '#FF9F40', '#4BC0C0'],
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': ' + context.parsed.toLocaleString() + ' users';
                                }
                            }
                        }
                    }
                }
            });
        }

        console.log(`✅ Generated ${charts.length} marketing charts`);
        return charts;
    }

    // ─────────────────────────────────────────
    // SALES CHARTS
    // ─────────────────────────────────────────
    static generateSalesCharts(data, question) {
        const charts = [];
        const lowerQuestion = question.toLowerCase();

        console.log('🎨 Generating Sales charts...');

        // Revenue by Product (Bar)
        if (lowerQuestion.includes('product') || lowerQuestion.includes('revenue')) {
            const productRevenue = {};
            
            data.forEach(row => {
                const product = row.product || row.Product || 'Unknown';
                const revenue = parseFloat(row.revenue || row.Revenue || 0) || 0;
                productRevenue[product] = (productRevenue[product] || 0) + revenue;
            });

            charts.push({
                type: 'bar',
                title: 'Revenue by Product',
                data: {
                    labels: Object.keys(productRevenue),
                    datasets: [{
                        label: 'Revenue ($)',
                        data: Object.values(productRevenue),
                        backgroundColor: '#36A2EB',
                        borderColor: '#1e88e5',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }

        // Sales by Region (Pie)
        if (lowerQuestion.includes('region') || lowerQuestion.includes('territory')) {
            const regionSales = {};
            
            data.forEach(row => {
                const region = row.region || row.Region || 'Unknown';
                const revenue = parseFloat(row.revenue || row.Revenue || 0) || 0;
                regionSales[region] = (regionSales[region] || 0) + revenue;
            });

            charts.push({
                type: 'doughnut',
                title: 'Sales by Region',
                data: {
                    labels: Object.keys(regionSales),
                    datasets: [{
                        data: Object.values(regionSales),
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        console.log(`✅ Generated ${charts.length} sales charts`);
        return charts;
    }

    // ─────────────────────────────────────────
    // FINANCE CHARTS
    // ─────────────────────────────────────────
    static generateFinanceCharts(data, question) {
        const charts = [];
        const lowerQuestion = question.toLowerCase();

        console.log('🎨 Generating Finance charts...');

        // Stock Price Trends (Line)
        if (lowerQuestion.includes('price') || lowerQuestion.includes('trend') || lowerQuestion.includes('stock')) {
            const stockData = {};
            
            data.forEach(row => {
                const symbol = row.stock_symbol || row.Stock_Symbol || 'Unknown';
                if (!stockData[symbol]) {
                    stockData[symbol] = [];
                }
                stockData[symbol].push({
                    close: parseFloat(row.close_price || row.Close_Price || 0),
                    date: row.date || ''
                });
            });

            // Take first stock
            const firstStock = Object.keys(stockData)[0];
            if (firstStock) {
                const prices = stockData[firstStock].slice(0, 10);
                
                charts.push({
                    type: 'line',
                    title: `Price Trend - ${firstStock}`,
                    data: {
                        labels: prices.map((_, i) => `Day ${i + 1}`),
                        datasets: [{
                            label: 'Close Price ($)',
                            data: prices.map(p => p.close),
                            borderColor: '#36A2EB',
                            backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            }
        }

        console.log(`✅ Generated ${charts.length} finance charts`);
        return charts;
    }

    // ─────────────────────────────────────────
    // INVENTORY CHARTS
    // ─────────────────────────────────────────
    static generateInventoryCharts(data, question) {
        const charts = [];
        const lowerQuestion = question.toLowerCase();

        console.log('🎨 Generating Inventory charts...');

        // Stock Levels by Warehouse (Bar)
        if (lowerQuestion.includes('warehouse') || lowerQuestion.includes('stock') || lowerQuestion.includes('inventory')) {
            const warehouseStock = {};
            
            data.forEach(row => {
                const warehouse = row.warehouse || row.Warehouse || 'Unknown';
                const stock = parseFloat(row.current_stock || row.Current_Stock || 0) || 0;
                warehouseStock[warehouse] = (warehouseStock[warehouse] || 0) + stock;
            });

            charts.push({
                type: 'bar',
                title: 'Total Stock by Warehouse',
                data: {
                    labels: Object.keys(warehouseStock),
                    datasets: [{
                        label: 'Units in Stock',
                        data: Object.values(warehouseStock),
                        backgroundColor: '#4BC0C0',
                        borderColor: '#00897b',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }

        console.log(`✅ Generated ${charts.length} inventory charts`);
        return charts;
    }

    // ─────────────────────────────────────────
    // HR CHARTS (existing)
    // ─────────────────────────────────────────
    static generateHRCharts(data, question) {
        const charts = [];
        const lowerQuestion = question.toLowerCase();

        console.log('🎨 Generating HR charts...');

        const deptData = {};
        data.forEach(row => {
            const dept = row.department || row.Department || 'Unknown';
            deptData[dept] = (deptData[dept] || 0) + 1;
        });

        if (Object.keys(deptData).length > 0) {
            charts.push({
                type: 'pie',
                title: 'Employee Distribution by Department',
                data: {
                    labels: Object.keys(deptData),
                    datasets: [{
                        data: Object.values(deptData),
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }

        if (lowerQuestion.includes('salary')) {
            const deptSalary = {};
            const deptCount = {};
            data.forEach(row => {
                const dept = row.department || row.Department || 'Unknown';
                const salary = parseFloat(row.salary || row.Salary || 0) || 0;
                deptSalary[dept] = (deptSalary[dept] || 0) + salary;
                deptCount[dept] = (deptCount[dept] || 0) + 1;
            });

            const avgSalary = {};
            Object.keys(deptSalary).forEach(dept => {
                avgSalary[dept] = Math.round(deptSalary[dept] / deptCount[dept]);
            });

            charts.push({
                type: 'bar',
                title: 'Average Salary by Department',
                data: {
                    labels: Object.keys(avgSalary),
                    datasets: [{
                        label: 'Average Salary ($)',
                        data: Object.values(avgSalary),
                        backgroundColor: '#36A2EB',
                        borderColor: '#1e88e5',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { x: { beginAtZero: true } }
                }
            });
        }

        console.log(`✅ Generated ${charts.length} HR charts`);
        return charts;
    }
}

module.exports = ChartService;