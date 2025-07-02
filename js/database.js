/**
 * IndexedDB Database Management for Parts Return Control System
 * Handles all database operations including initialization, CRUD operations, and indexing
 */

const DB_NAME = 'dbRetornos';
const DB_VERSION = 2;
const STORE_NAME = 'devolucoes';

let dbInstance = null;

/**
 * Initialize the IndexedDB database with proper schema and indices
 */
async function initDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        dbInstance = await idb.openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, transaction) {
                console.log(`Database upgrade from version ${oldVersion} to ${newVersion}`);
                
                // Create the main store for devolutions if it doesn't exist
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    // Create indices for fast searching
                    store.createIndex('codigo_peca', 'codigo_peca', { unique: false });
                    store.createIndex('cliente', 'cliente', { unique: false });
                    store.createIndex('mecanico', 'mecanico', { unique: false });
                    store.createIndex('requisicao_venda', 'requisicao_venda', { unique: false });
                    store.createIndex('acao_requisicao', 'acao_requisicao', { unique: false });
                    store.createIndex('data_venda', 'data_venda', { unique: false });
                    store.createIndex('data_devolucao', 'data_devolucao', { unique: false });
                    store.createIndex('descricao_peca', 'descricao_peca', { unique: false });

                    console.log('Devolutions store created with indices');
                }

                // Create people store if it doesn't exist (version 2+)
                if (newVersion >= 2 && !db.objectStoreNames.contains('pessoas')) {
                    const peopleStore = db.createObjectStore('pessoas', {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    // Create indices for people store
                    peopleStore.createIndex('codigo', 'codigo', { unique: true });
                    peopleStore.createIndex('nome', 'nome', { unique: false });
                    peopleStore.createIndex('tipo', 'tipo', { unique: false });
                    peopleStore.createIndex('status', 'status', { unique: false });
                    peopleStore.createIndex('documento', 'documento', { unique: false });
                    
                    console.log('People store created with indices');
                }

                console.log('Database initialized with proper schema and indices');
            }
        });

        console.log('Database connection established successfully');
        return dbInstance;
    } catch (error) {
        console.error('Error initializing database:', error);
        throw new Error('Falha ao inicializar o banco de dados: ' + error.message);
    }
}

/**
 * Get the database instance
 */
async function getDatabase() {
    if (!dbInstance) {
        await initDatabase();
    }
    return dbInstance;
}

/**
 * Add a new devolution record to the database
 * @param {Object} devolutionData - The devolution data to be stored
 * @returns {Promise<number>} The ID of the newly created record
 */
async function addDevolution(devolutionData) {
    try {
        const db = await getDatabase();
        
        // Validate required fields (mechanic is now optional)
        const requiredFields = [
            'codigo_peca', 'descricao_peca', 'quantidade_devolvida',
            'cliente', 'requisicao_venda', 'acao_requisicao',
            'data_venda', 'data_devolucao'
        ];

        for (const field of requiredFields) {
            if (!devolutionData[field] || devolutionData[field].toString().trim() === '') {
                throw new Error(`Campo obrigatório não preenchido: ${field}`);
            }
        }

        // Validate quantity is a positive number
        const quantity = parseInt(devolutionData.quantidade_devolvida);
        if (isNaN(quantity) || quantity <= 0) {
            throw new Error('Quantidade deve ser um número positivo');
        }

        // Validate dates
        const saleDate = new Date(devolutionData.data_venda);
        const returnDate = new Date(devolutionData.data_devolucao);
        
        if (isNaN(saleDate.getTime()) || isNaN(returnDate.getTime())) {
            throw new Error('Datas inválidas fornecidas');
        }

        if (returnDate < saleDate) {
            throw new Error('Data da devolução não pode ser anterior à data da venda');
        }

        // Validate action type
        const validActions = ['Alterada', 'Excluída'];
        if (!validActions.includes(devolutionData.acao_requisicao)) {
            throw new Error('Ação na requisição deve ser "Alterada" ou "Excluída"');
        }

        // Prepare data for storage
        const dataToStore = {
            codigo_peca: devolutionData.codigo_peca.toString().trim(),
            descricao_peca: devolutionData.descricao_peca.toString().trim(),
            quantidade_devolvida: quantity,
            cliente: devolutionData.cliente.toString().trim(),
            mecanico: devolutionData.mecanico ? devolutionData.mecanico.toString().trim() : devolutionData.cliente.toString().trim(),
            requisicao_venda: devolutionData.requisicao_venda.toString().trim(),
            acao_requisicao: devolutionData.acao_requisicao,
            data_venda: devolutionData.data_venda,
            data_devolucao: devolutionData.data_devolucao,
            observacao: devolutionData.observacao ? devolutionData.observacao.toString().trim() : '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const result = await store.add(dataToStore);
        await tx.complete;

        console.log('Devolution added successfully with ID:', result);
        return result;
    } catch (error) {
        console.error('Error adding devolution:', error);
        throw new Error('Erro ao salvar devolução: ' + error.message);
    }
}

/**
 * Get a devolution record by ID
 * @param {number} id - The ID of the devolution record
 * @returns {Promise<Object|null>} The devolution record or null if not found
 */
async function getDevolution(id) {
    try {
        const db = await getDatabase();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const result = await store.get(id);
        
        return result || null;
    } catch (error) {
        console.error('Error getting devolution:', error);
        throw new Error('Erro ao buscar devolução: ' + error.message);
    }
}

/**
 * Get all devolution records
 * @returns {Promise<Array>} Array of all devolution records
 */
async function getAllDevolutions() {
    try {
        const db = await getDatabase();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const result = await store.getAll();
        
        return result;
    } catch (error) {
        console.error('Error getting all devolutions:', error);
        throw new Error('Erro ao buscar devoluções: ' + error.message);
    }
}

/**
 * Update a devolution record
 * @param {number} id - The ID of the record to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<boolean>} True if successful
 */
async function updateDevolution(id, updateData) {
    try {
        const db = await getDatabase();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        // Get existing record
        const existingRecord = await store.get(id);
        if (!existingRecord) {
            throw new Error('Registro não encontrado');
        }

        // Merge with update data
        const updatedRecord = {
            ...existingRecord,
            ...updateData,
            updated_at: new Date().toISOString()
        };

        await store.put(updatedRecord);
        await tx.complete;

        console.log('Devolution updated successfully:', id);
        return true;
    } catch (error) {
        console.error('Error updating devolution:', error);
        throw new Error('Erro ao atualizar devolução: ' + error.message);
    }
}

/**
 * Delete a devolution record
 * @param {number} id - The ID of the record to delete
 * @returns {Promise<boolean>} True if successful
 */
async function deleteDevolution(id) {
    try {
        const db = await getDatabase();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        await store.delete(id);
        await tx.complete;

        console.log('Devolution deleted successfully:', id);
        return true;
    } catch (error) {
        console.error('Error deleting devolution:', error);
        throw new Error('Erro ao excluir devolução: ' + error.message);
    }
}

/**
 * Search devolutions by various criteria
 * @param {Object} searchCriteria - Object containing search parameters
 * @returns {Promise<Array>} Array of matching devolution records
 */
async function searchDevolutions(searchCriteria) {
    try {
        const db = await getDatabase();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        
        let results = await store.getAll();

        // Apply filters
        if (searchCriteria.codigo_peca) {
            const searchTerm = searchCriteria.codigo_peca.toLowerCase();
            results = results.filter(item => 
                item.codigo_peca.toLowerCase().includes(searchTerm)
            );
        }

        if (searchCriteria.cliente) {
            const searchTerm = searchCriteria.cliente.toLowerCase();
            results = results.filter(item => 
                item.cliente.toLowerCase().includes(searchTerm)
            );
        }

        if (searchCriteria.mecanico) {
            const searchTerm = searchCriteria.mecanico.toLowerCase();
            results = results.filter(item => 
                item.mecanico.toLowerCase().includes(searchTerm)
            );
        }

        if (searchCriteria.requisicao_venda) {
            const searchTerm = searchCriteria.requisicao_venda.toLowerCase();
            results = results.filter(item => 
                item.requisicao_venda.toLowerCase().includes(searchTerm)
            );
        }

        if (searchCriteria.acao_requisicao) {
            results = results.filter(item => 
                item.acao_requisicao === searchCriteria.acao_requisicao
            );
        }

        if (searchCriteria.data_venda_inicio) {
            results = results.filter(item => 
                item.data_venda >= searchCriteria.data_venda_inicio
            );
        }

        if (searchCriteria.data_venda_fim) {
            results = results.filter(item => 
                item.data_venda <= searchCriteria.data_venda_fim
            );
        }

        if (searchCriteria.data_devolucao_inicio) {
            results = results.filter(item => 
                item.data_devolucao >= searchCriteria.data_devolucao_inicio
            );
        }

        if (searchCriteria.data_devolucao_fim) {
            results = results.filter(item => 
                item.data_devolucao <= searchCriteria.data_devolucao_fim
            );
        }

        return results;
    } catch (error) {
        console.error('Error searching devolutions:', error);
        throw new Error('Erro ao buscar devoluções: ' + error.message);
    }
}

/**
 * Get devolutions grouped by a specific field
 * @param {string} groupByField - Field to group by
 * @returns {Promise<Object>} Object with grouped results
 */
async function getDevolutionsGroupedBy(groupByField) {
    try {
        const allDevolutions = await getAllDevolutions();
        const grouped = {};

        allDevolutions.forEach(devolution => {
            const key = devolution[groupByField];
            if (!grouped[key]) {
                grouped[key] = {
                    items: [],
                    totalQuantity: 0,
                    count: 0
                };
            }
            grouped[key].items.push(devolution);
            grouped[key].totalQuantity += devolution.quantidade_devolvida;
            grouped[key].count++;
        });

        return grouped;
    } catch (error) {
        console.error('Error grouping devolutions:', error);
        throw new Error('Erro ao agrupar devoluções: ' + error.message);
    }
}

/**
 * Export all data to JSON format
 * @returns {Promise<string>} JSON string of all data
 */
async function exportData() {
    try {
        const allDevolutions = await getAllDevolutions();
        return JSON.stringify({
            exportDate: new Date().toISOString(),
            version: DB_VERSION,
            data: allDevolutions
        }, null, 2);
    } catch (error) {
        console.error('Error exporting data:', error);
        throw new Error('Erro ao exportar dados: ' + error.message);
    }
}

/**
 * Import data from JSON format
 * @param {string} jsonData - JSON string containing data to import
 * @returns {Promise<number>} Number of records imported
 */
async function importData(jsonData) {
    try {
        const importData = JSON.parse(jsonData);
        
        if (!importData.data || !Array.isArray(importData.data)) {
            throw new Error('Formato de dados inválido');
        }

        const db = await getDatabase();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        let importedCount = 0;
        
        for (const record of importData.data) {
            // Remove ID to allow auto-increment
            const { id, ...recordData } = record;
            recordData.imported_at = new Date().toISOString();
            
            await store.add(recordData);
            importedCount++;
        }

        await tx.complete;
        
        console.log(`Successfully imported ${importedCount} records`);
        return importedCount;
    } catch (error) {
        console.error('Error importing data:', error);
        throw new Error('Erro ao importar dados: ' + error.message);
    }
}

/**
 * Clear all data from the database
 * @returns {Promise<boolean>} True if successful
 */
async function clearAllData() {
    try {
        const db = await getDatabase();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        await store.clear();
        await tx.complete;

        console.log('All data cleared successfully');
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        throw new Error('Erro ao limpar dados: ' + error.message);
    }
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Object containing various statistics
 */
async function getDatabaseStats() {
    try {
        const allDevolutions = await getAllDevolutions();
        
        const stats = {
            totalRecords: allDevolutions.length,
            totalQuantity: allDevolutions.reduce((sum, dev) => sum + dev.quantidade_devolvida, 0),
            uniqueParts: new Set(allDevolutions.map(dev => dev.codigo_peca)).size,
            uniqueCustomers: new Set(allDevolutions.map(dev => dev.cliente)).size,
            uniqueMechanics: new Set(allDevolutions.map(dev => dev.mecanico)).size,
            dateRange: {
                earliestSale: allDevolutions.length > 0 ? 
                    Math.min(...allDevolutions.map(dev => new Date(dev.data_venda).getTime())) : null,
                latestSale: allDevolutions.length > 0 ? 
                    Math.max(...allDevolutions.map(dev => new Date(dev.data_venda).getTime())) : null,
                earliestReturn: allDevolutions.length > 0 ? 
                    Math.min(...allDevolutions.map(dev => new Date(dev.data_devolucao).getTime())) : null,
                latestReturn: allDevolutions.length > 0 ? 
                    Math.max(...allDevolutions.map(dev => new Date(dev.data_devolucao).getTime())) : null
            }
        };

        // Convert timestamps back to dates
        if (stats.dateRange.earliestSale) {
            stats.dateRange.earliestSale = new Date(stats.dateRange.earliestSale).toISOString().split('T')[0];
        }
        if (stats.dateRange.latestSale) {
            stats.dateRange.latestSale = new Date(stats.dateRange.latestSale).toISOString().split('T')[0];
        }
        if (stats.dateRange.earliestReturn) {
            stats.dateRange.earliestReturn = new Date(stats.dateRange.earliestReturn).toISOString().split('T')[0];
        }
        if (stats.dateRange.latestReturn) {
            stats.dateRange.latestReturn = new Date(stats.dateRange.latestReturn).toISOString().split('T')[0];
        }

        return stats;
    } catch (error) {
        console.error('Error getting database stats:', error);
        throw new Error('Erro ao obter estatísticas: ' + error.message);
    }
}

// Export functions for use in other modules
window.initDatabase = initDatabase;
/**
 * Add a new devolution with multiple parts
 * @param {Object} devolutionData - The devolution data with parts array
 * @returns {Promise<number>} The ID of the newly created record
 */
async function addDevolutionWithParts(devolutionData) {
    try {
        const db = await getDatabase();

        // Validate required fields
        if (!devolutionData.cliente || devolutionData.cliente.trim() === '') {
            throw new Error('Cliente é obrigatório');
        }

        if (!devolutionData.requisicao_venda || devolutionData.requisicao_venda.trim() === '') {
            throw new Error('Número da requisição de venda é obrigatório');
        }

        if (!devolutionData.data_devolucao) {
            throw new Error('Data da devolução é obrigatória');
        }

        if (!devolutionData.parts || !Array.isArray(devolutionData.parts) || devolutionData.parts.length === 0) {
            throw new Error('Pelo menos uma peça deve ser informada');
        }

        // Validate each part
        devolutionData.parts.forEach((part, index) => {
            if (!part.codigo_peca || part.codigo_peca.trim() === '') {
                throw new Error(`Código da peça ${index + 1} é obrigatório`);
            }
            if (!part.descricao_peca || part.descricao_peca.trim() === '') {
                throw new Error(`Descrição da peça ${index + 1} é obrigatória`);
            }
            if (!part.quantidade_devolvida || part.quantidade_devolvida < 1) {
                throw new Error(`Quantidade da peça ${index + 1} deve ser maior que zero`);
            }
            if (!part.tipo_acao || part.tipo_acao.trim() === '') {
                throw new Error(`Tipo de ação da peça ${index + 1} é obrigatório`);
            }
        });

        // Validate dates
        const returnDate = new Date(devolutionData.data_devolucao);
        if (devolutionData.data_venda) {
            const saleDate = new Date(devolutionData.data_venda);
            if (returnDate < saleDate) {
                throw new Error('Data da devolução não pode ser anterior à data da venda');
            }
        }

        // For compatibility with existing system, create separate records for each part
        // This maintains backward compatibility while supporting multiple parts
        const devolutionIds = [];
        
        for (let i = 0; i < devolutionData.parts.length; i++) {
            const part = devolutionData.parts[i];
            
            const dataToStore = {
                codigo_peca: part.codigo_peca.toString().trim(),
                descricao_peca: part.descricao_peca.toString().trim(),
                quantidade_devolvida: parseInt(part.quantidade_devolvida),
                cliente: devolutionData.cliente.toString().trim(),
                mecanico: devolutionData.mecanico ? devolutionData.mecanico.toString().trim() : devolutionData.cliente.toString().trim(),
                requisicao_venda: devolutionData.requisicao_venda.toString().trim(),
                acao_requisicao: part.tipo_acao, // Map tipo_acao to acao_requisicao for compatibility
                data_venda: devolutionData.data_venda || null,
                data_devolucao: devolutionData.data_devolucao,
                observacao: part.observacoes_item || devolutionData.observacao || '',
                // Add metadata to identify related parts
                is_multi_part: true,
                part_number: i + 1,
                total_parts: devolutionData.parts.length,
                multi_part_group: Date.now().toString(), // Unique identifier for this devolution group
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const result = await store.add(dataToStore);
            await tx.complete;
            
            devolutionIds.push(result);
        }

        console.log('Multi-part devolution added successfully with IDs:', devolutionIds);
        return devolutionIds[0]; // Return the first ID as primary
    } catch (error) {
        console.error('Error adding multi-part devolution:', error);
        throw new Error('Erro ao salvar devolução: ' + error.message);
    }
}

/**
 * Get grouped devolutions (for displaying multi-part devolutions together)
 * @returns {Promise<Array>} Array of grouped devolution records
 */
async function getGroupedDevolutions() {
    try {
        const db = await getDatabase();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const allDevolutions = await store.getAll();
        await tx.complete;

        // Group devolutions by multi_part_group
        const grouped = {};
        const singleDevolutions = [];

        allDevolutions.forEach(dev => {
            if (dev.is_multi_part && dev.multi_part_group) {
                if (!grouped[dev.multi_part_group]) {
                    grouped[dev.multi_part_group] = [];
                }
                grouped[dev.multi_part_group].push(dev);
            } else {
                singleDevolutions.push(dev);
            }
        });

        // Sort grouped devolutions by part_number
        Object.keys(grouped).forEach(groupId => {
            grouped[groupId].sort((a, b) => (a.part_number || 0) - (b.part_number || 0));
        });

        return {
            grouped: grouped,
            single: singleDevolutions
        };
    } catch (error) {
        console.error('Error getting grouped devolutions:', error);
        throw new Error('Erro ao buscar devoluções agrupadas: ' + error.message);
    }
}

window.getDatabase = getDatabase;
window.addDevolution = addDevolution;
window.addDevolutionWithParts = addDevolutionWithParts;
window.getGroupedDevolutions = getGroupedDevolutions;
window.getDevolution = getDevolution;
window.getAllDevolutions = getAllDevolutions;
window.updateDevolution = updateDevolution;
window.deleteDevolution = deleteDevolution;
window.searchDevolutions = searchDevolutions;
window.getDevolutionsGroupedBy = getDevolutionsGroupedBy;
window.exportData = exportData;
window.importData = importData;
window.clearAllData = clearAllData;
window.getDatabaseStats = getDatabaseStats;
