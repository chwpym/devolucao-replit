/**
 * Backup and Restore Module
 * Handles exporting and importing of application data.
 */

// DOM Elements
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const importBtn = document.getElementById('importBtn');

// Checkboxes for export
const includeDevolutionsCheck = document.getElementById('includeDevolutions');
const includePeopleCheck = document.getElementById('includePeople');
const includeWarrantiesCheck = document.getElementById('includeWarranties');
const includeSuppliersCheck = document.getElementById('includeSuppliers');

// Counters
const totalDevolutionsBackup = document.getElementById('totalDevolutionsBackup');
const totalPeopleBackup = document.getElementById('totalPeopleBackup');

/**
 * Initializes the backup page, updating counters.
 */
async function initBackupPage() {
    try {
        const [devolutions, people] = await Promise.all([
            getAllDevolutions(),
            getAllPeople()
        ]);
        if (totalDevolutionsBackup) totalDevolutionsBackup.textContent = devolutions.length;
        if (totalPeopleBackup) totalPeopleBackup.textContent = people.length;
    } catch (error) {
        console.error("Failed to initialize backup counters:", error);
    }
}

/**
 * Handles the export of data to a JSON file.
 */
async function exportBackup() {
    try {
        const dataToExport = {
            version: '1.1.0',
            exportDate: new Date().toISOString(),
            data: {}
        };

        if (includeDevolutionsCheck.checked) {
            dataToExport.data.devolutions = await getAllDevolutions();
        }
        if (includePeopleCheck.checked) {
            dataToExport.data.people = await getAllPeople();
        }
        if (includeWarrantiesCheck.checked) {
            dataToExport.data.warranties = await db.getAll('garantias');
        }
        if (includeSuppliersCheck.checked) {
            dataToExport.data.suppliers = await db.getAll('fornecedores');
        }

        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-sistema-devolucoes-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Export failed:", error);
        alert("Ocorreu um erro ao exportar os dados.");
    }
}

/**
 * Handles the import of data from a JSON file.
 */
async function importBackup() {
    const file = importFile.files[0];
    if (!file) {
        alert("Por favor, selecione um arquivo de backup.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(event) {
        try {
            const data = JSON.parse(event.target.result);
            
            if (!data.version || !data.data) {
                throw new Error("Formato de arquivo de backup inválido.");
            }
            
            const confirmed = confirm(`Isso substituirá todos os dados existentes. Deseja continuar?`);
            if (!confirmed) return;

            const db = await getDatabase();
            const tx = db.transaction(['devolucoes', 'pessoas', 'garantias', 'fornecedores'], 'readwrite');

            if (data.data.devolutions) {
                await tx.objectStore('devolucoes').clear();
                for (const item of data.data.devolutions) {
                    await tx.objectStore('devolucoes').add(item);
                }
            }
            if (data.data.people) {
                await tx.objectStore('pessoas').clear();
                for (const item of data.data.people) {
                    await tx.objectStore('pessoas').add(item);
                }
            }
            if (data.data.warranties) {
                await tx.objectStore('garantias').clear();
                for (const item of data.data.warranties) {
                    await tx.objectStore('garantias').add(item);
                }
            }
            if (data.data.suppliers) {
                await tx.objectStore('fornecedores').clear();
                for (const item of data.data.suppliers) {
                    await tx.objectStore('fornecedores').add(item);
                }
            }

            await tx.done;
            alert("Dados importados com sucesso!");
            location.reload();

        } catch (error) {
            console.error("Import failed:", error);
            alert(`Ocorreu um erro ao importar os dados: ${error.message}`);
        }
    };
    reader.readAsText(file);
}

// Event Listeners
if (exportBtn) exportBtn.addEventListener('click', exportBackup);
if (importFile) importFile.addEventListener('change', () => {
    importBtn.disabled = importFile.files.length === 0;
});
if (importBtn) importBtn.addEventListener('click', importBackup);

// Initialize page
document.addEventListener('DOMContentLoaded', initBackupPage);