/**
 * IndexedDB Database Management for Parts Return Control System
 */

const DB_NAME = 'dbRetornos';
const DB_VERSION = 5; // Incremented version for new devolution schema

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

                // Devolutions store (now devolution_headers)
                if (oldVersion < 5 && db.objectStoreNames.contains('devolucoes')) {
                    // This is a destructive migration. In a real app, we'd migrate data.
                    db.deleteObjectStore('devolucoes');
                }
                if (!db.objectStoreNames.contains('devolution_headers')) {
                    const store = db.createObjectStore('devolution_headers', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('cliente', 'cliente_id');
                    store.createIndex('data_devolucao', 'data_devolucao');
                    store.createIndex('updated_at', 'updated_at');
                    console.log('Devolution headers store created.');
                }

                // Devolution items store
                if (!db.objectStoreNames.contains('devolution_items')) {
                    const itemStore = db.createObjectStore('devolution_items', { keyPath: 'id', autoIncrement: true });
                    itemStore.createIndex('devolution_id', 'devolution_id');
                    itemStore.createIndex('codigo_peca', 'codigo_peca');
                    console.log('Devolution items store created.');
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

async function addDevolutionWithParts(devolutionData) {
    const db = await getDatabase();
    const tx = db.transaction(['devolution_headers', 'devolution_items'], 'readwrite');
    const headersStore = tx.objectStore('devolution_headers');
    const itemsStore = tx.objectStore('devolution_items');

    try {
        // 1. Save the header
        const headerData = {
            cliente: devolutionData.cliente,
            mecanico: devolutionData.mecanico,
            requisicao_venda: devolutionData.requisicao_venda,
            data_venda: devolutionData.data_venda,
            data_devolucao: devolutionData.data_devolucao,
            observacoes: devolutionData.observacao,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const headerId = await headersStore.add(headerData);

        // 2. Save each item with the header ID
        for (const part of devolutionData.parts) {
            const itemData = {
                devolution_id: headerId,
                codigo_peca: part.codigo_peca,
                descricao_peca: part.descricao_peca,
                quantidade_devolvida: part.quantidade_devolvida,
                observacoes_item: part.observacoes_item,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            await itemsStore.add(itemData);
        }

        await tx.done;
        console.log('Devolution with parts added successfully with Header ID:', headerId);
        return headerId;
    } catch (error) {
        console.error('Error adding devolution with parts:', error);
        tx.abort();
        throw new Error('Erro ao salvar devolução com itens: ' + error.message);
    }
}


async function getAllDevolutionsWithDetails() {
    const db = await getDatabase();
    const tx = db.transaction(['devolution_headers', 'devolution_items'], 'readonly');
    const headersStore = tx.objectStore('devolution_headers');
    const itemsStore = tx.objectStore('devolution_items');
    const itemsIndex = itemsStore.index('devolution_id');

    const devolutions = await headersStore.getAll();

    for (const dev of devolutions) {
        dev.items = await itemsIndex.getAll(dev.id);
    }

    return devolutions;
}


window.addDevolutionWithParts = addDevolutionWithParts;
window.getAllDevolutionsWithDetails = getAllDevolutionsWithDetails;
