/**
 * Reports and Analytics Module for Parts Return Control System
 * Handles report generation, data aggregation, and export functionality
 */

/**
 * Generate comprehensive reports based on filtered data
 * @param {Array} data - Array of devolution records
 * @param {Object} options - Report generation options
 */
function generateReports(data, options = {}) {
    const reports = {
        summary: generateSummaryReport(data),
        byParts: generatePartReport(data),
        byCustomers: generateCustomerReport(data),
        byMechanics: generateMechanicReport(data),
        byActions: generateActionReport(data),
        timeAnalysis: generateTimeAnalysisReport(data),
        trends: generateTrendReport(data)
    };

    return reports;
}

/**
 * Generate summary statistics
 * @param {Array} data - Devolution data
 * @returns {Object} Summary statistics
 */
function generateSummaryReport(data) {
    if (!data || data.length === 0) {
        return {
            totalDevolutions: 0,
            totalQuantity: 0,
            uniqueParts: 0,
            uniqueCustomers: 0,
            uniqueMechanics: 0,
            averageQuantityPerDevolution: 0,
            dateRange: null
        };
    }

    const totalQuantity = data.reduce((sum, item) => sum + item.quantidade_devolvida, 0);
    const uniqueParts = new Set(data.map(item => item.codigo_peca)).size;
    const uniqueCustomers = new Set(data.map(item => item.cliente)).size;
    const uniqueMechanics = new Set(data.map(item => item.mecanico)).size;

    // Calculate date range
    const dates = data.map(item => new Date(item.data_devolucao));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    return {
        totalDevolutions: data.length,
        totalQuantity: totalQuantity,
        uniqueParts: uniqueParts,
        uniqueCustomers: uniqueCustomers,
        uniqueMechanics: uniqueMechanics,
        averageQuantityPerDevolution: data.length > 0 ? (totalQuantity / data.length).toFixed(2) : 0,
        dateRange: {
            start: minDate.toISOString().split('T')[0],
            end: maxDate.toISOString().split('T')[0]
        }
    };
}

/**
 * Generate report grouped by parts
 * @param {Array} data - Devolution data
 * @returns {Array} Parts report data
 */
function generatePartReport(data) {
    const partGroups = {};

    data.forEach(item => {
        const key = item.codigo_peca;
        if (!partGroups[key]) {
            partGroups[key] = {
                codigo: item.codigo_peca,
                descricao: item.descricao_peca,
                totalQuantity: 0,
                occurrences: 0,
                customers: new Set(),
                mechanics: new Set(),
                actions: { Alterada: 0, Excluída: 0 },
                averageQuantityPerOccurrence: 0,
                latestReturn: null,
                earliestReturn: null
            };
        }

        const group = partGroups[key];
        group.totalQuantity += item.quantidade_devolvida;
        group.occurrences++;
        group.customers.add(item.cliente);
        group.mechanics.add(item.mecanico);
        group.actions[item.acao_requisicao]++;

        // Track date range
        const returnDate = new Date(item.data_devolucao);
        if (!group.latestReturn || returnDate > new Date(group.latestReturn)) {
            group.latestReturn = item.data_devolucao;
        }
        if (!group.earliestReturn || returnDate < new Date(group.earliestReturn)) {
            group.earliestReturn = item.data_devolucao;
        }
    });

    // Convert to array and calculate additional metrics
    const result = Object.values(partGroups).map(group => ({
        ...group,
        uniqueCustomers: group.customers.size,
        uniqueMechanics: group.mechanics.size,
        averageQuantityPerOccurrence: (group.totalQuantity / group.occurrences).toFixed(2),
        customers: Array.from(group.customers),
        mechanics: Array.from(group.mechanics)
    }));

    // Sort by total quantity descending
    return result.sort((a, b) => b.totalQuantity - a.totalQuantity);
}

/**
 * Generate report grouped by customers
 * @param {Array} data - Devolution data
 * @returns {Array} Customer report data
 */
function generateCustomerReport(data) {
    const customerGroups = {};

    data.forEach(item => {
        const key = item.cliente;
        if (!customerGroups[key]) {
            customerGroups[key] = {
                name: item.cliente,
                totalQuantity: 0,
                occurrences: 0,
                parts: new Set(),
                mechanics: new Set(),
                actions: { Alterada: 0, Excluída: 0 },
                latestReturn: null,
                earliestReturn: null,
                salesOrders: new Set()
            };
        }

        const group = customerGroups[key];
        group.totalQuantity += item.quantidade_devolvida;
        group.occurrences++;
        group.parts.add(item.codigo_peca);
        group.mechanics.add(item.mecanico);
        group.actions[item.acao_requisicao]++;
        group.salesOrders.add(item.requisicao_venda);

        // Track date range
        const returnDate = new Date(item.data_devolucao);
        if (!group.latestReturn || returnDate > new Date(group.latestReturn)) {
            group.latestReturn = item.data_devolucao;
        }
        if (!group.earliestReturn || returnDate < new Date(group.earliestReturn)) {
            group.earliestReturn = item.data_devolucao;
        }
    });

    // Convert to array and calculate additional metrics
    const result = Object.values(customerGroups).map(group => ({
        ...group,
        uniqueParts: group.parts.size,
        uniqueMechanics: group.mechanics.size,
        uniqueSalesOrders: group.salesOrders.size,
        averageQuantityPerOccurrence: (group.totalQuantity / group.occurrences).toFixed(2),
        parts: Array.from(group.parts),
        mechanics: Array.from(group.mechanics)
    }));

    // Sort by total quantity descending
    return result.sort((a, b) => b.totalQuantity - a.totalQuantity);
}

/**
 * Generate report grouped by mechanics
 * @param {Array} data - Devolution data
 * @returns {Array} Mechanic report data
 */
function generateMechanicReport(data) {
    const mechanicGroups = {};

    data.forEach(item => {
        const key = item.mecanico;
        if (!mechanicGroups[key]) {
            mechanicGroups[key] = {
                name: item.mecanico,
                totalQuantity: 0,
                occurrences: 0,
                customers: new Set(),
                parts: new Set(),
                actions: { Alterada: 0, Excluída: 0 },
                latestReturn: null,
                earliestReturn: null,
                salesOrders: new Set()
            };
        }

        const group = mechanicGroups[key];
        group.totalQuantity += item.quantidade_devolvida;
        group.occurrences++;
        group.customers.add(item.cliente);
        group.parts.add(item.codigo_peca);
        group.actions[item.acao_requisicao]++;
        group.salesOrders.add(item.requisicao_venda);

        // Track date range
        const returnDate = new Date(item.data_devolucao);
        if (!group.latestReturn || returnDate > new Date(group.latestReturn)) {
            group.latestReturn = item.data_devolucao;
        }
        if (!group.earliestReturn || returnDate < new Date(group.earliestReturn)) {
            group.earliestReturn = item.data_devolucao;
        }
    });

    // Convert to array and calculate additional metrics
    const result = Object.values(mechanicGroups).map(group => ({
        ...group,
        uniqueCustomers: group.customers.size,
        uniqueParts: group.parts.size,
        uniqueSalesOrders: group.salesOrders.size,
        averageQuantityPerOccurrence: (group.totalQuantity / group.occurrences).toFixed(2),
        customers: Array.from(group.customers),
        parts: Array.from(group.parts)
    }));

    // Sort by total quantity descending
    return result.sort((a, b) => b.totalQuantity - a.totalQuantity);
}

/**
 * Generate report grouped by action types
 * @param {Array} data - Devolution data
 * @returns {Array} Action report data
 */
function generateActionReport(data) {
    const actionGroups = {};

    data.forEach(item => {
        const key = item.acao_requisicao;
        if (!actionGroups[key]) {
            actionGroups[key] = {
                action: key,
                totalQuantity: 0,
                occurrences: 0,
                customers: new Set(),
                parts: new Set(),
                mechanics: new Set()
            };
        }

        const group = actionGroups[key];
        group.totalQuantity += item.quantidade_devolvida;
        group.occurrences++;
        group.customers.add(item.cliente);
        group.parts.add(item.codigo_peca);
        group.mechanics.add(item.mecanico);
    });

    const totalOccurrences = data.length;
    const totalQuantity = data.reduce((sum, item) => sum + item.quantidade_devolvida, 0);

    // Convert to array and calculate percentages
    const result = Object.values(actionGroups).map(group => ({
        ...group,
        uniqueCustomers: group.customers.size,
        uniqueParts: group.parts.size,
        uniqueMechanics: group.mechanics.size,
        percentageOfOccurrences: totalOccurrences > 0 ? ((group.occurrences / totalOccurrences) * 100).toFixed(1) : 0,
        percentageOfQuantity: totalQuantity > 0 ? ((group.totalQuantity / totalQuantity) * 100).toFixed(1) : 0,
        averageQuantityPerOccurrence: (group.totalQuantity / group.occurrences).toFixed(2)
    }));

    // Sort by total quantity descending
    return result.sort((a, b) => b.totalQuantity - a.totalQuantity);
}

/**
 * Generate time-based analysis report
 * @param {Array} data - Devolution data
 * @returns {Object} Time analysis data
 */
function generateTimeAnalysisReport(data) {
    if (!data || data.length === 0) {
        return {
            averageDaysBetweenSaleAndReturn: 0,
            monthlyDistribution: {},
            weeklyDistribution: {},
            dayOfWeekDistribution: {}
        };
    }

    let totalDays = 0;
    let validDatePairs = 0;
    const monthlyDistribution = {};
    const weeklyDistribution = {};
    const dayOfWeekDistribution = {
        'Domingo': 0, 'Segunda': 0, 'Terça': 0, 'Quarta': 0,
        'Quinta': 0, 'Sexta': 0, 'Sábado': 0
    };

    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    data.forEach(item => {
        const saleDate = new Date(item.data_venda);
        const returnDate = new Date(item.data_devolucao);

        // Calculate days between sale and return
        if (!isNaN(saleDate.getTime()) && !isNaN(returnDate.getTime())) {
            const daysDiff = Math.ceil((returnDate - saleDate) / (1000 * 60 * 60 * 24));
            totalDays += daysDiff;
            validDatePairs++;
        }

        // Monthly distribution based on return date
        const monthKey = returnDate.toISOString().substring(0, 7); // YYYY-MM
        monthlyDistribution[monthKey] = (monthlyDistribution[monthKey] || 0) + 1;

        // Weekly distribution (by week number)
        const weekNumber = getWeekNumber(returnDate);
        const weekKey = `${returnDate.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
        weeklyDistribution[weekKey] = (weeklyDistribution[weekKey] || 0) + 1;

        // Day of week distribution
        const dayOfWeek = dayNames[returnDate.getDay()];
        dayOfWeekDistribution[dayOfWeek]++;
    });

    return {
        averageDaysBetweenSaleAndReturn: validDatePairs > 0 ? (totalDays / validDatePairs).toFixed(1) : 0,
        monthlyDistribution: monthlyDistribution,
        weeklyDistribution: weeklyDistribution,
        dayOfWeekDistribution: dayOfWeekDistribution
    };
}

/**
 * Generate trend analysis report
 * @param {Array} data - Devolution data
 * @returns {Object} Trend analysis data
 */
function generateTrendReport(data) {
    if (!data || data.length === 0) {
        return {
            monthlyTrend: [],
            topGrowingParts: [],
            topGrowingCustomers: [],
            seasonalPatterns: {}
        };
    }

    // Group by month for trend analysis
    const monthlyData = {};
    data.forEach(item => {
        const monthKey = item.data_devolucao.substring(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                month: monthKey,
                count: 0,
                quantity: 0,
                parts: new Set(),
                customers: new Set()
            };
        }
        monthlyData[monthKey].count++;
        monthlyData[monthKey].quantity += item.quantidade_devolvida;
        monthlyData[monthKey].parts.add(item.codigo_peca);
        monthlyData[monthKey].customers.add(item.cliente);
    });

    // Convert to sorted array
    const monthlyTrend = Object.values(monthlyData)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(month => ({
            ...month,
            uniqueParts: month.parts.size,
            uniqueCustomers: month.customers.size
        }));

    // Analyze seasonal patterns
    const seasonalPatterns = {
        Q1: { months: ['01', '02', '03'], count: 0, quantity: 0 },
        Q2: { months: ['04', '05', '06'], count: 0, quantity: 0 },
        Q3: { months: ['07', '08', '09'], count: 0, quantity: 0 },
        Q4: { months: ['10', '11', '12'], count: 0, quantity: 0 }
    };

    data.forEach(item => {
        const month = item.data_devolucao.substring(5, 7);
        Object.keys(seasonalPatterns).forEach(quarter => {
            if (seasonalPatterns[quarter].months.includes(month)) {
                seasonalPatterns[quarter].count++;
                seasonalPatterns[quarter].quantity += item.quantidade_devolvida;
            }
        });
    });

    return {
        monthlyTrend: monthlyTrend,
        seasonalPatterns: seasonalPatterns
    };
}

/**
 * Export report data to CSV format
 * @param {Array} reportData - Data to export
 * @param {string} reportType - Type of report
 * @param {string} filename - Optional filename
 * @returns {string} CSV content
 */
function exportReportToCSV(reportData, reportType, filename = null) {
    if (!reportData || reportData.length === 0) {
        throw new Error('Nenhum dado disponível para exportação');
    }

    let headers = [];
    let rows = [];
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `relatorio_${reportType}_${timestamp}.csv`;

    switch (reportType) {
        case 'parts':
            headers = [
                'Código da Peça', 'Descrição', 'Quantidade Total', 'Ocorrências',
                'Clientes Únicos', 'Mecânicos Únicos', 'Média por Ocorrência',
                'Primeira Devolução', 'Última Devolução'
            ];
            rows = reportData.map(item => [
                `"${item.codigo}"`,
                `"${item.descricao}"`,
                item.totalQuantity,
                item.occurrences,
                item.uniqueCustomers,
                item.uniqueMechanics,
                item.averageQuantityPerOccurrence,
                item.earliestReturn,
                item.latestReturn
            ]);
            break;

        case 'customers':
            headers = [
                'Cliente', 'Quantidade Total', 'Ocorrências', 'Peças Distintas',
                'Mecânicos Únicos', 'Média por Ocorrência', 'Primeira Devolução', 'Última Devolução'
            ];
            rows = reportData.map(item => [
                `"${item.name}"`,
                item.totalQuantity,
                item.occurrences,
                item.uniqueParts,
                item.uniqueMechanics,
                item.averageQuantityPerOccurrence,
                item.earliestReturn,
                item.latestReturn
            ]);
            break;

        case 'mechanics':
            headers = [
                'Mecânico', 'Quantidade Total', 'Ocorrências', 'Clientes Únicos',
                'Peças Distintas', 'Média por Ocorrência', 'Primeira Devolução', 'Última Devolução'
            ];
            rows = reportData.map(item => [
                `"${item.name}"`,
                item.totalQuantity,
                item.occurrences,
                item.uniqueCustomers,
                item.uniqueParts,
                item.averageQuantityPerOccurrence,
                item.earliestReturn,
                item.latestReturn
            ]);
            break;

        case 'actions':
            headers = [
                'Ação na Requisição', 'Quantidade Total', 'Ocorrências',
                '% das Ocorrências', '% da Quantidade', 'Média por Ocorrência'
            ];
            rows = reportData.map(item => [
                `"${item.action}"`,
                item.totalQuantity,
                item.occurrences,
                `${item.percentageOfOccurrences}%`,
                `${item.percentageOfQuantity}%`,
                item.averageQuantityPerOccurrence
            ]);
            break;

        case 'monthly':
            headers = ['Mês', 'Devoluções', 'Quantidade Total', 'Peças Únicas', 'Clientes Únicos'];
            rows = reportData.map(item => [
                item.month,
                item.count,
                item.quantity,
                item.uniqueParts,
                item.uniqueCustomers
            ]);
            break;

        default:
            throw new Error('Tipo de relatório não suportado para exportação');
    }

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    return {
        content: csvContent,
        filename: filename || defaultFilename
    };
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV content
 * @param {string} filename - Filename for download
 */
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

/**
 * Get week number for a given date
 * @param {Date} date - Date object
 * @returns {number} Week number
 */
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Format large numbers with appropriate suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {Object} Change data
 */
function calculatePercentageChange(current, previous) {
    if (previous === 0) {
        return { change: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'neutral' };
    }
    
    const change = ((current - previous) / previous) * 100;
    return {
        change: Math.abs(change).toFixed(1),
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
}

/**
 * Generate report summary for dashboard display
 * @param {Object} reports - All generated reports
 * @returns {Object} Summary data for dashboard
 */
function generateDashboardSummary(reports) {
    const summary = reports.summary;
    const timeAnalysis = reports.timeAnalysis;
    
    return {
        totalDevolutions: formatNumber(summary.totalDevolutions),
        totalQuantity: formatNumber(summary.totalQuantity),
        uniqueParts: formatNumber(summary.uniqueParts),
        uniqueCustomers: formatNumber(summary.uniqueCustomers),
        averageReturnTime: timeAnalysis.averageDaysBetweenSaleAndReturn,
        topPart: reports.byParts.length > 0 ? reports.byParts[0] : null,
        topCustomer: reports.byCustomers.length > 0 ? reports.byCustomers[0] : null,
        actionDistribution: reports.byActions
    };
}

/**
 * Print Management Functions
 * Handles report printing with formatted layouts
 */

/**
 * Print a formatted report
 * @param {string} reportType - Type of report to print
 * @param {Array|Object} reportData - Report data to print
 * @param {Object} options - Print options
 */
function printReport(reportType, reportData, options = {}) {
    const printWindow = window.open('', '_blank');
    
    const html = generatePrintHTML(reportType, reportData, options);
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };
}

/**
 * Generate HTML for printing
 * @param {string} reportType - Type of report
 * @param {Array|Object} reportData - Report data
 * @param {Object} options - Print options
 * @returns {string} HTML content for printing
 */
function generatePrintHTML(reportType, reportData, options = {}) {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR');
    
    let title = 'Relatório de Devoluções';
    let content = '';
    
    switch (reportType) {
        case 'summary':
            title = 'Relatório Resumo de Devoluções';
            content = generateSummaryPrintContent(reportData);
            break;
        case 'parts':
            title = 'Relatório por Peças';
            content = generatePartsPrintContent(reportData);
            break;
        case 'customers':
            title = 'Relatório por Clientes';
            content = generateCustomersPrintContent(reportData);
            break;
        case 'mechanics':
            title = 'Relatório por Mecânicos';
            content = generateMechanicsPrintContent(reportData);
            break;
        case 'actions':
            title = 'Relatório por Ações';
            content = generateActionsPrintContent(reportData);
            break;
        case 'monthly':
            title = 'Relatório Mensal';
            content = generateMonthlyPrintContent(reportData);
            break;
        case 'detailed':
            title = 'Relatório Detalhado';
            content = generateDetailedPrintContent(reportData);
            break;
        default:
            content = '<p>Tipo de relatório não suportado para impressão.</p>';
    }
    
    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                    line-height: 1.4;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    margin: 0;
                    color: #2c3e50;
                    font-size: 24px;
                }
                .header .subtitle {
                    margin: 5px 0;
                    color: #666;
                    font-size: 14px;
                }
                .print-info {
                    text-align: right;
                    margin-bottom: 20px;
                    font-size: 12px;
                    color: #666;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    font-size: 12px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f8f9fa;
                    font-weight: bold;
                    text-align: center;
                }
                .number {
                    text-align: right;
                }
                .summary-card {
                    background: #f8f9fa;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .summary-item {
                    text-align: center;
                }
                .summary-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2c3e50;
                }
                .summary-label {
                    font-size: 12px;
                    color: #666;
                    margin-top: 5px;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    font-size: 11px;
                    color: #666;
                }
                @media print {
                    body { margin: 15px; }
                    .header { page-break-after: avoid; }
                    table { page-break-inside: avoid; }
                    .summary-card { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Sistema de Controle de Retorno de Peças</h1>
                <div class="subtitle">${title}</div>
            </div>
            
            <div class="print-info">
                Impresso em: ${currentDate} às ${currentTime}
            </div>
            
            ${content}
            
            <div class="footer">
                <p>Este relatório foi gerado automaticamente pelo Sistema de Controle de Retorno de Peças</p>
            </div>
        </body>
        </html>
    `;
}

/**
 * Generate summary print content
 */
function generateSummaryPrintContent(data) {
    return `
        <div class="summary-card">
            <h3>Resumo Geral</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-value">${data.totalDevolutions || 0}</div>
                    <div class="summary-label">Total de Devoluções</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${data.totalQuantity || 0}</div>
                    <div class="summary-label">Quantidade Total</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${data.uniqueParts || 0}</div>
                    <div class="summary-label">Peças Únicas</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${data.uniqueCustomers || 0}</div>
                    <div class="summary-label">Clientes Únicos</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate parts print content
 */
function generatePartsPrintContent(data) {
    const tableRows = data.map(item => `
        <tr>
            <td>${item.codigo}</td>
            <td>${item.descricao}</td>
            <td class="number">${item.totalQuantity}</td>
            <td class="number">${item.occurrences}</td>
            <td class="number">${item.percentageOfTotal}%</td>
            <td class="number">${item.averageQuantityPerOccurrence}</td>
        </tr>
    `).join('');
    
    return `
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Qtd. Total</th>
                    <th>Ocorrências</th>
                    <th>% do Total</th>
                    <th>Média/Ocorrência</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

/**
 * Generate customers print content
 */
function generateCustomersPrintContent(data) {
    const tableRows = data.map(item => `
        <tr>
            <td>${item.cliente}</td>
            <td class="number">${item.totalQuantity}</td>
            <td class="number">${item.occurrences}</td>
            <td class="number">${item.uniqueParts}</td>
            <td class="number">${item.percentageOfTotal}%</td>
        </tr>
    `).join('');
    
    return `
        <table>
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Qtd. Total</th>
                    <th>Devoluções</th>
                    <th>Peças Únicas</th>
                    <th>% do Total</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

/**
 * Generate mechanics print content
 */
function generateMechanicsPrintContent(data) {
    const tableRows = data.map(item => `
        <tr>
            <td>${item.mecanico}</td>
            <td class="number">${item.totalQuantity}</td>
            <td class="number">${item.occurrences}</td>
            <td class="number">${item.uniqueParts}</td>
            <td class="number">${item.percentageOfTotal}%</td>
        </tr>
    `).join('');
    
    return `
        <table>
            <thead>
                <tr>
                    <th>Mecânico</th>
                    <th>Qtd. Total</th>
                    <th>Devoluções</th>
                    <th>Peças Únicas</th>
                    <th>% do Total</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

/**
 * Generate actions print content
 */
function generateActionsPrintContent(data) {
    const tableRows = data.map(item => `
        <tr>
            <td>${item.action}</td>
            <td class="number">${item.totalQuantity}</td>
            <td class="number">${item.occurrences}</td>
            <td class="number">${item.percentageOfOccurrences}%</td>
            <td class="number">${item.averageQuantityPerOccurrence}</td>
        </tr>
    `).join('');
    
    return `
        <table>
            <thead>
                <tr>
                    <th>Ação</th>
                    <th>Qtd. Total</th>
                    <th>Ocorrências</th>
                    <th>% das Ocorrências</th>
                    <th>Média/Ocorrência</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

/**
 * Generate monthly print content
 */
function generateMonthlyPrintContent(data) {
    const tableRows = data.map(item => `
        <tr>
            <td>${item.month}</td>
            <td class="number">${item.count}</td>
            <td class="number">${item.quantity}</td>
            <td class="number">${item.uniqueParts}</td>
            <td class="number">${item.uniqueCustomers}</td>
        </tr>
    `).join('');
    
    return `
        <table>
            <thead>
                <tr>
                    <th>Mês</th>
                    <th>Devoluções</th>
                    <th>Qtd. Total</th>
                    <th>Peças Únicas</th>
                    <th>Clientes Únicos</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

/**
 * Generate detailed print content
 */
function generateDetailedPrintContent(data) {
    const tableRows = data.map(item => `
        <tr>
            <td>${formatDate(item.data_devolucao)}</td>
            <td>${item.codigo_peca}</td>
            <td>${item.descricao_peca}</td>
            <td class="number">${item.quantidade_devolvida}</td>
            <td>${item.cliente}</td>
            <td>${item.mecanico}</td>
            <td>${item.acao_requisicao}</td>
            <td>${item.requisicao_venda}</td>
        </tr>
    `).join('');
    
    return `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Qtd.</th>
                    <th>Cliente</th>
                    <th>Mecânico</th>
                    <th>Ação</th>
                    <th>Req. Venda</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

/**
 * Show print preview in modal
 * @param {string} reportType - Type of report
 * @param {Array|Object} reportData - Report data
 * @param {Object} options - Print options
 */
function showPrintPreview(reportType, reportData, options = {}) {
    const html = generatePrintHTML(reportType, reportData, options);
    
    // Create modal for preview
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'printPreviewModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Visualização de Impressão</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-0">
                    <iframe id="printPreviewFrame" style="width: 100%; height: 600px; border: none;"></iframe>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    <button type="button" class="btn btn-primary" onclick="printFromPreview()">
                        <i class="fas fa-print me-1"></i>Imprimir
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // Load content into iframe
    const iframe = document.getElementById('printPreviewFrame');
    iframe.onload = function() {
        iframe.contentDocument.open();
        iframe.contentDocument.write(html);
        iframe.contentDocument.close();
    };
    
    // Store HTML for printing
    window.currentPrintHTML = html;
    
    // Clean up on modal close
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
        delete window.currentPrintHTML;
    });
}

/**
 * Print from preview modal
 */
function printFromPreview() {
    if (window.currentPrintHTML) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(window.currentPrintHTML);
        printWindow.document.close();
        
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        };
        
        // Close preview modal
        bootstrap.Modal.getInstance(document.getElementById('printPreviewModal')).hide();
    }
}

// Export functions for global use
window.generateReports = generateReports;
window.generateSummaryReport = generateSummaryReport;
window.generatePartReport = generatePartReport;
window.generateCustomerReport = generateCustomerReport;
window.generateMechanicReport = generateMechanicReport;
window.generateActionReport = generateActionReport;
window.generateTimeAnalysisReport = generateTimeAnalysisReport;
window.generateTrendReport = generateTrendReport;
window.exportReportToCSV = exportReportToCSV;
window.downloadCSV = downloadCSV;
window.formatNumber = formatNumber;
window.calculatePercentageChange = calculatePercentageChange;
window.generateDashboardSummary = generateDashboardSummary;
window.printReport = printReport;
window.showPrintPreview = showPrintPreview;
window.printFromPreview = printFromPreview;

