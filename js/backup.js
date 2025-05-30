/**
 * Backup and Restore Module for Parts Return Control System
 * Handles data export, import, and database management operations
 */

/**
 * Export backup data to JSON file
 */
async function exportBackup() {
    const exportBtn = document.querySelector('button[onclick="exportBackup()"]');
    const originalText = exportBtn.innerHTML;
    
    try {
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Gerando backup...';

        const includeDevolutions = document.getElementById('includeDevolutions').checked;
        const includePeople = document.getElementById('includePeople').checked;

        if (!includeDevolutions && !includePeople) {
            throw new Error('Selecione pelo menos um tipo de dados para backup');
        }

        const backupData = {
            metadata: {
                exportDate: new Date().toISOString(),
                version: '1.0',
                systemName: 'Sistema de Controle de Retorno de Peças',
                includes: {
                    devolutions: includeDevolutions,
                    people: includePeople
                }
            },
            data: {}
        };

        // Export devolutions
        if (includeDevolutions) {
            try {
                const devolutions = await getAllDevolutions();
                backupData.data.devolutions = devolutions;
                console.log(`Exported ${devolutions.length} devolutions`);
            } catch (error) {
                console.warn('Error exporting devolutions:', error);
                backupData.data.devolutions = [];
            }
        }

        // Export people
        if (includePeople) {
            try {
                const people = await getAllPeople();
                backupData.data.people = people;
                console.log(`Exported ${people.length} people`);
            } catch (error) {
                console.warn('Error exporting people:', error);
                backupData.data.people = [];
            }
        }

        // Create and download file
        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const filename = `backup_sistema_pecas_${timestamp}.json`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert('Backup realizado com sucesso!', 'success');

    } catch (error) {
        console.error('Error exporting backup:', error);
        showAlert('Erro ao gerar backup: ' + error.message, 'danger');
    } finally {
        exportBtn.disabled = false;
        exportBtn.innerHTML = originalText;
    }
}

/**
 * Validate backup file and show information
 */
function validateBackupFile() {
    const fileInput = document.getElementById('backupFile');
    const backupInfo = document.getElementById('backupInfo');
    const backupDetails = document.getElementById('backupDetails');
    const restoreBtn = document.getElementById('restoreBtn');

    if (!fileInput.files[0]) {
        backupInfo.style.display = 'none';
        restoreBtn.disabled = true;
        return;
    }

    const file = fileInput.files[0];
    
    if (!file.name.endsWith('.json')) {
        showAlert('Por favor, selecione um arquivo JSON válido.', 'warning');
        backupInfo.style.display = 'none';
        restoreBtn.disabled = true;
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            // Validate backup structure
            if (!backupData.metadata || !backupData.data) {
                throw new Error('Estrutura de backup inválida');
            }

            // Display backup information
            const metadata = backupData.metadata;
            const data = backupData.data;
            
            let details = `
                <ul class="mb-0">
                    <li><strong>Data do backup:</strong> ${formatDate(metadata.exportDate, true)}</li>
                    <li><strong>Versão:</strong> ${metadata.version || 'N/A'}</li>
            `;

            if (data.devolutions) {
                details += `<li><strong>Devoluções:</strong> ${data.devolutions.length} registros</li>`;
            }

            if (data.people) {
                details += `<li><strong>Pessoas:</strong> ${data.people.length} registros</li>`;
            }

            details += '</ul>';
            
            backupDetails.innerHTML = details;
            backupInfo.style.display = 'block';
            restoreBtn.disabled = false;

            // Store backup data for import
            window.currentBackupData = backupData;

        } catch (error) {
            console.error('Error validating backup file:', error);
            showAlert('Arquivo de backup inválido: ' + error.message, 'danger');
            backupInfo.style.display = 'none';
            restoreBtn.disabled = true;
        }
    };

    reader.readAsText(file);
}

/**
 * Import backup data
 */
async function importBackup() {
    if (!window.currentBackupData) {
        showAlert('Nenhum arquivo de backup válido selecionado.', 'warning');
        return;
    }

    const clearData = document.getElementById('clearBeforeRestore').checked;
    
    // Confirm action
    const confirmMessage = clearData ? 
        'Tem certeza que deseja restaurar o backup? Todos os dados atuais serão apagados!' :
        'Tem certeza que deseja restaurar o backup? Os dados serão adicionados aos existentes.';
    
    const confirmed = await confirmDialog(confirmMessage, 'Confirmar Restauração');
    if (!confirmed) return;

    const restoreBtn = document.getElementById('restoreBtn');
    const originalText = restoreBtn.innerHTML;
    
    try {
        restoreBtn.disabled = true;
        restoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Restaurando...';

        const backupData = window.currentBackupData;
        let importedDevolutions = 0;
        let importedPeople = 0;

        // Clear existing data if requested
        if (clearData) {
            if (backupData.data.devolutions) {
                await clearDevolutionsData();
            }
            if (backupData.data.people) {
                await clearPeopleData();
            }
        }

        // Import people first (they might be referenced by devolutions)
        if (backupData.data.people && backupData.data.people.length > 0) {
            for (const person of backupData.data.people) {
                try {
                    // Remove ID to allow auto-increment
                    const { id, ...personData } = person;
                    personData.imported_at = new Date().toISOString();
                    
                    await addPerson(personData);
                    importedPeople++;
                } catch (error) {
                    console.warn('Error importing person:', error);
                }
            }
        }

        // Import devolutions
        if (backupData.data.devolutions && backupData.data.devolutions.length > 0) {
            for (const devolution of backupData.data.devolutions) {
                try {
                    // Remove ID to allow auto-increment
                    const { id, ...devolutionData } = devolution;
                    devolutionData.imported_at = new Date().toISOString();
                    
                    await addDevolution(devolutionData);
                    importedDevolutions++;
                } catch (error) {
                    console.warn('Error importing devolution:', error);
                }
            }
        }

        showAlert(
            `Backup restaurado com sucesso! Importados: ${importedDevolutions} devoluções, ${importedPeople} pessoas.`,
            'success'
        );

        // Refresh statistics
        await loadDatabaseStatistics();

        // Clear file input
        document.getElementById('backupFile').value = '';
        document.getElementById('backupInfo').style.display = 'none';
        window.currentBackupData = null;

    } catch (error) {
        console.error('Error importing backup:', error);
        showAlert('Erro ao restaurar backup: ' + error.message, 'danger');
    } finally {
        restoreBtn.disabled = true;
        restoreBtn.innerHTML = originalText;
    }
}

/**
 * Load database statistics
 */
async function loadDatabaseStatistics() {
    try {
        const statsContainer = document.getElementById('databaseStats');
        const totalDevolutionsBackup = document.getElementById('totalDevolutionsBackup');
        const totalPeopleBackup = document.getElementById('totalPeopleBackup');

        // Get devolutions count
        let devolutionsCount = 0;
        try {
            const devolutions = await getAllDevolutions();
            devolutionsCount = devolutions.length;
        } catch (error) {
            console.warn('Error getting devolutions count:', error);
        }

        // Get people count
        let peopleCount = 0;
        try {
            const people = await getAllPeople();
            peopleCount = people.length;
        } catch (error) {
            console.warn('Error getting people count:', error);
        }

        // Update backup counters
        if (totalDevolutionsBackup) totalDevolutionsBackup.textContent = devolutionsCount;
        if (totalPeopleBackup) totalPeopleBackup.textContent = peopleCount;

        // Get database statistics
        const stats = await getDatabaseStats();
        
        const statsHtml = `
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                        <h4 class="mb-1">${devolutionsCount}</h4>
                        <small>Total de Devoluções</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="card bg-success text-white">
                    <div class="card-body text-center">
                        <h4 class="mb-1">${peopleCount}</h4>
                        <small>Total de Pessoas</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="card bg-info text-white">
                    <div class="card-body text-center">
                        <h4 class="mb-1">${stats.uniqueParts || 0}</h4>
                        <small>Peças Únicas</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="card bg-warning text-white">
                    <div class="card-body text-center">
                        <h4 class="mb-1">${stats.totalQuantity || 0}</h4>
                        <small>Quantidade Total</small>
                    </div>
                </div>
            </div>
        `;

        statsContainer.innerHTML = statsHtml;

    } catch (error) {
        console.error('Error loading database statistics:', error);
        const statsContainer = document.getElementById('databaseStats');
        statsContainer.innerHTML = `
            <div class="col-12 text-center text-danger">
                <i class="fas fa-exclamation-triangle"></i> Erro ao carregar estatísticas
            </div>
        `;
    }
}

/**
 * Clear devolutions data
 */
async function clearDevolutions() {
    const confirmed = await confirmDialog(
        'Tem certeza que deseja apagar todas as devoluções? Esta ação não pode ser desfeita!',
        'Confirmar Exclusão'
    );
    
    if (!confirmed) return;

    try {
        await clearDevolutionsData();
        showAlert('Todas as devoluções foram apagadas com sucesso.', 'success');
        await loadDatabaseStatistics();
    } catch (error) {
        console.error('Error clearing devolutions:', error);
        showAlert('Erro ao apagar devoluções: ' + error.message, 'danger');
    }
}

/**
 * Clear people data
 */
async function clearPeople() {
    const confirmed = await confirmDialog(
        'Tem certeza que deseja apagar todas as pessoas? Esta ação não pode ser desfeita!',
        'Confirmar Exclusão'
    );
    
    if (!confirmed) return;

    try {
        await clearPeopleData();
        showAlert('Todas as pessoas foram apagadas com sucesso.', 'success');
        await loadDatabaseStatistics();
    } catch (error) {
        console.error('Error clearing people:', error);
        showAlert('Erro ao apagar pessoas: ' + error.message, 'danger');
    }
}

/**
 * Clear all data
 */
async function clearAllData() {
    const confirmed = await confirmDialog(
        'ATENÇÃO: Tem certeza que deseja apagar TODOS os dados do sistema? Esta ação não pode ser desfeita!',
        'CONFIRMAR EXCLUSÃO TOTAL'
    );
    
    if (!confirmed) return;

    // Second confirmation
    const doubleConfirmed = await confirmDialog(
        'Esta é sua última chance! Todos os dados serão perdidos permanentemente. Continuar?',
        'ÚLTIMA CONFIRMAÇÃO'
    );
    
    if (!doubleConfirmed) return;

    try {
        await clearDevolutionsData();
        await clearPeopleData();
        showAlert('Todos os dados foram apagados com sucesso.', 'success');
        await loadDatabaseStatistics();
    } catch (error) {
        console.error('Error clearing all data:', error);
        showAlert('Erro ao apagar dados: ' + error.message, 'danger');
    }
}

/**
 * Clear devolutions data from database
 */
async function clearDevolutionsData() {
    try {
        const db = await getDatabase();
        const tx = db.transaction('devolucoes', 'readwrite');
        const store = tx.objectStore('devolucoes');
        await store.clear();
        await tx.complete;
        console.log('Devolutions data cleared');
    } catch (error) {
        console.error('Error clearing devolutions data:', error);
        throw error;
    }
}

/**
 * Clear people data from database
 */
async function clearPeopleData() {
    try {
        const db = await getDatabase();
        if (db.objectStoreNames.contains(PEOPLE_STORE_NAME)) {
            const tx = db.transaction(PEOPLE_STORE_NAME, 'readwrite');
            const store = tx.objectStore(PEOPLE_STORE_NAME);
            await store.clear();
            await tx.complete;
            console.log('People data cleared');
        }
    } catch (error) {
        console.error('Error clearing people data:', error);
        throw error;
    }
}

// Export functions for global use
window.exportBackup = exportBackup;
window.validateBackupFile = validateBackupFile;
window.importBackup = importBackup;
window.loadDatabaseStatistics = loadDatabaseStatistics;
window.clearDevolutions = clearDevolutions;
window.clearPeople = clearPeople;
window.clearAllData = clearAllData;