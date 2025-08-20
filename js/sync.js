// This file handles the data synchronization between the local IndexedDB and the remote server.

function getLastSyncTimestamp() { return localStorage.getItem('lastSyncTimestamp'); }

function setLastSyncTimestamp(timestamp) { localStorage.setItem('lastSyncTimestamp', timestamp); }

async function triggerSync() { if (!navigator.onLine) { console.log('Sync deferred: App is offline.'); updateSyncStatus('Offline. Sincronização pendente.'); return; }

console.log('Starting synchronization...');
updateSyncStatus('Sincronizando...');

try {
    const db = await getDatabase();
    
    const localPeople = await db.getAll('people');
    const localDevolutions = await db.getAll('devolucoes');
    const localGarantias = await db.getAll('garantias');
    const localFornecedores = await db.getAll('fornecedores');

    const payload = {
        people: localPeople,
        devolutions: localDevolutions,
        warranties: localGarantias,
        suppliers: localFornecedores,
    };

    const lastSync = getLastSyncTimestamp();
    const url = lastSync ? `/api/sync?lastSyncTimestamp=${encodeURIComponent(lastSync)}` : '/api/sync';

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Sync failed with status: ${response.status}`);
    }

    const { serverUpdates, newSyncTimestamp } = await response.json();

    if (serverUpdates) {
        const tx = db.transaction(['people', 'devolucoes', 'garantias', 'fornecedores'], 'readwrite');
        
        if (serverUpdates.people && serverUpdates.people.length > 0) {
            for (const person of serverUpdates.people) {
                await tx.objectStore('people').put(person);
            }
        }
        if (serverUpdates.devolutions && serverUpdates.devolutions.length > 0) {
            for (const devolution of serverUpdates.devolutions) {
                await tx.objectStore('devolucoes').put(devolution);
            }
        }
         if (serverUpdates.warranties && serverUpdates.warranties.length > 0) {
            for (const warranty of serverUpdates.warranties) {
                await tx.objectStore('garantias').put(warranty);
            }
        }
         if (serverUpdates.suppliers && serverUpdates.suppliers.length > 0) {
            for (const supplier of serverUpdates.suppliers) {
                await tx.objectStore('fornecedores').put(supplier);
            }
        }

        await tx.done;
        console.log('Local database updated with server changes.');
    }

    setLastSyncTimestamp(newSyncTimestamp);
    updateSyncStatus('Sincronizado com o servidor.');
    console.log('Synchronization complete.');

} catch (error) {
    console.error('Error during synchronization:', error);
    updateSyncStatus(`Erro na sincronização: ${error.message}`);
}
}

function updateSyncStatus(message) { const statusElement = document.getElementById('syncStatus'); if (statusElement) { statusElement.textContent = message; } }

window.addEventListener('online', triggerSync); window.addEventListener('offline', () => updateSyncStatus('Offline. Sincronização pendente.'));

if (typeof self !== 'undefined') { self.triggerSync = triggerSync; }
