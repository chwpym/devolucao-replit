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

