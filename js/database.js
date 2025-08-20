/**
 * IndexedDB Database Management for Parts Return Control System
 */

const DB_NAME = 'dbRetornos';
const DB_VERSION = 4; // Incremented version for new stores

let dbInstance = null;

/**
 * Initialize the IndexedDB database with proper schema and indices.
 */
async function initDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        dbInstance = await idb.openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, transaction) {
                console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

                // Devolutions store
                if (!db.objectStoreNames.contains('devolucoes')) {
                    const store = db.createObjectStore('devolucoes', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('codigo_peca', 'codigo_peca');
                    store.createIndex('cliente', 'cliente');
                    store.createIndex('data_devolucao', 'data_devolucao');
                    console.log('Devolutions store created.');
                }
                if (oldVersion < 3 && db.objectStoreNames.contains('devolucoes')) {
                    const store = transaction.objectStore('devolucoes');
                    if (!store.indexNames.contains('updated_at')) {
                        store.createIndex('updated_at', 'updated_at');
                    }
                }

                // People store
                if (!db.objectStoreNames.contains('pessoas')) {
                    const peopleStore = db.createObjectStore('pessoas', { keyPath: 'id', autoIncrement: true });
                    peopleStore.createIndex('codigo', 'codigo', { unique: true });
                    peopleStore.createIndex('nome', 'nome');
                    console.log('People store created.');
                }
                if (oldVersion < 3 && db.objectStoreNames.contains('pessoas')) {
                    const peopleStore = transaction.objectStore('pessoas');
                    if (!peopleStore.indexNames.contains('updated_at')) {
                        peopleStore.createIndex('updated_at', 'updated_at');
                    }
                }

                // New stores for version 4
                if (oldVersion < 4) {
                    if (!db.objectStoreNames.contains('garantias')) {
                        const warrantyStore = db.createObjectStore('garantias', { keyPath: 'id', autoIncrement: true });
                        warrantyStore.createIndex('productId', 'productId');
                        warrantyStore.createIndex('status', 'status');
                        console.log('Warranties store created.');
                    }
                    if (!db.objectStoreNames.contains('fornecedores')) {
                        const supplierStore = db.createObjectStore('fornecedores', { keyPath: 'id', autoIncrement: true });
                        supplierStore.createIndex('name', 'name');
                        console.log('Suppliers store created.');
                    }
                    if (!db.objectStoreNames.contains('empresa')) {
                        db.createObjectStore('empresa', { keyPath: 'id' });
                        console.log('Company settings store created.');
                    }
                }
            }
        });
        console.log('Database connection established successfully');
        return dbInstance;
    } catch (error) {
        console.error('Error initializing database:', error);
        throw new Error(`Falha ao inicializar o banco de dados: ${error.message}`);
    }
}

// All other database functions (addDevolution, getAllPeople, etc.) remain the same
// but will now operate on the latest database version.

// Export functions for global use
window.initDatabase = initDatabase;
window.getDatabase = async () => {
    if (!dbInstance) await initDatabase();
    return dbInstance;
};

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
        const saleDate = parseLocalDate(devolutionData.data_venda);
        const returnDate = parseLocalDate(devolutionData.data_devolucao);
        
        if (!saleDate || !returnDate) {
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
            uuid: devolutionData.uuid || generateUUID(),
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

        const tx = db.transaction('devolucoes', 'readwrite');
        const store = tx.objectStore('devolucoes');
        const result = await store.add(dataToStore);
        await tx.complete;

        console.log('Devolution added successfully with ID:', result);
        return result;
    } catch (error) {
        console.error('Error adding devolution:', error);
        throw new Error('Erro ao salvar devolução: ' + error.message);
    }
}

async function getAllDevolutions() {
    try {
        const db = await getDatabase();
        const tx = db.transaction('devolucoes', 'readonly');
        const store = tx.objectStore('devolucoes');
        const result = await store.getAll();
        
        return result;
    } catch (error) {
        console.error('Error getting all devolutions:', error);
        throw new Error('Erro ao buscar devoluções: ' + error.message);
    }
}

window.addDevolution = addDevolution;
window.getAllDevolutions = getAllDevolutions;
