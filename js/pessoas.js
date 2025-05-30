/**
 * People Management Module for Parts Return Control System
 * Handles person (customer/mechanic) registration and management
 */

const PEOPLE_STORE_NAME = 'pessoas';

/**
 * Initialize the people database store
 */
async function initPeopleDatabase() {
    try {
        const db = await getDatabase();
        
        // People store should now be created automatically in main database init
        // Just verify it exists
        if (!db.objectStoreNames.contains(PEOPLE_STORE_NAME)) {
            console.warn('People store not found in database - this should be handled by main database initialization');
        }
        
        console.log('People database initialized successfully');
    } catch (error) {
        console.error('Error initializing people database:', error);
        throw new Error('Erro ao inicializar banco de pessoas: ' + error.message);
    }
}

/**
 * Add a new person to the database
 * @param {Object} personData - The person data to be stored
 * @returns {Promise<number>} The ID of the newly created record
 */
async function addPerson(personData) {
    try {
        const db = await getDatabase();
        
        // Validate required fields
        if (!personData.nome || personData.nome.trim() === '') {
            throw new Error('Nome é obrigatório');
        }
        
        if (!personData.tipo || personData.tipo === '') {
            throw new Error('Tipo é obrigatório');
        }

        // Validate email format if provided
        if (personData.email && !isValidEmail(personData.email)) {
            throw new Error('Formato de e-mail inválido');
        }

        // Validate document if provided
        if (personData.documento && personData.documento.trim() !== '') {
            const cleanDoc = personData.documento.replace(/\D/g, '');
            if (cleanDoc.length === 11 && !isValidCPF(personData.documento)) {
                throw new Error('CPF inválido');
            } else if (cleanDoc.length === 14 && !isValidCNPJ(personData.documento)) {
                throw new Error('CNPJ inválido');
            } else if (cleanDoc.length !== 11 && cleanDoc.length !== 14 && cleanDoc.length > 0) {
                throw new Error('Documento deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos)');
            }
        }

        // Prepare data for storage
        const dataToStore = {
            nome: personData.nome.toString().trim(),
            tipo: personData.tipo,
            telefone: personData.telefone ? personData.telefone.toString().trim() : '',
            email: personData.email ? personData.email.toString().trim() : '',
            documento: personData.documento ? personData.documento.toString().trim() : '',
            endereco: personData.endereco ? personData.endereco.toString().trim() : '',
            observacoes: personData.observacoes ? personData.observacoes.toString().trim() : '',
            status: personData.status || 'Ativo',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const tx = db.transaction(PEOPLE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(PEOPLE_STORE_NAME);
        const result = await store.add(dataToStore);
        await tx.complete;

        console.log('Person added successfully with ID:', result);
        return result;
    } catch (error) {
        console.error('Error adding person:', error);
        throw new Error('Erro ao salvar pessoa: ' + error.message);
    }
}

/**
 * Get all people from database
 * @returns {Promise<Array>} Array of all people records
 */
async function getAllPeople() {
    try {
        const db = await getDatabase();
        
        // Check if people store exists
        if (!db.objectStoreNames.contains(PEOPLE_STORE_NAME)) {
            console.warn('People store does not exist yet');
            return [];
        }
        
        const tx = db.transaction(PEOPLE_STORE_NAME, 'readonly');
        const store = tx.objectStore(PEOPLE_STORE_NAME);
        const result = await store.getAll();
        
        return result;
    } catch (error) {
        console.error('Error getting all people:', error);
        return [];
    }
}

/**
 * Get people by type (Cliente, Mecânico, or Ambos)
 * @param {string} type - Type to filter by
 * @returns {Promise<Array>} Array of people matching the type
 */
async function getPeopleByType(type) {
    try {
        const allPeople = await getAllPeople();
        return allPeople.filter(person => 
            person.tipo === type || person.tipo === 'Ambos'
        );
    } catch (error) {
        console.error('Error getting people by type:', error);
        throw new Error('Erro ao buscar pessoas por tipo: ' + error.message);
    }
}

/**
 * Get active customers for dropdown lists
 * @returns {Promise<Array>} Array of active customers
 */
async function getActiveCustomers() {
    try {
        const allPeople = await getAllPeople();
        return allPeople.filter(person => 
            person.status === 'Ativo' && 
            (person.tipo === 'Cliente' || person.tipo === 'Ambos')
        ).sort((a, b) => a.nome.localeCompare(b.nome));
    } catch (error) {
        console.error('Error getting active customers:', error);
        return [];
    }
}

/**
 * Get active mechanics for dropdown lists
 * @returns {Promise<Array>} Array of active mechanics
 */
async function getActiveMechanics() {
    try {
        const allPeople = await getAllPeople();
        return allPeople.filter(person => 
            person.status === 'Ativo' && 
            (person.tipo === 'Mecânico' || person.tipo === 'Ambos')
        ).sort((a, b) => a.nome.localeCompare(b.nome));
    } catch (error) {
        console.error('Error getting active mechanics:', error);
        return [];
    }
}

/**
 * Initialize form validation for the person registration form
 */
function initPersonFormValidation() {
    const form = document.getElementById('personForm');
    if (!form) return;

    // Add custom validation styles
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        event.stopPropagation();

        // Remove previous validation classes
        form.classList.remove('was-validated');

        // Validate form
        if (await validatePersonForm()) {
            await submitPersonForm();
        } else {
            form.classList.add('was-validated');
            scrollToFirstError();
        }
    });

    // Add real-time validation
    addPersonRealTimeValidation();
}

/**
 * Validate the person form
 * @returns {Promise<boolean>} True if form is valid
 */
async function validatePersonForm() {
    const form = document.getElementById('personForm');
    let isValid = true;

    // Get all form fields
    const fields = {
        nome: document.getElementById('nome'),
        tipo: document.getElementById('tipo'),
        telefone: document.getElementById('telefone'),
        email: document.getElementById('email'),
        documento: document.getElementById('documento')
    };

    // Clear previous custom validation
    Object.values(fields).forEach(field => {
        if (field) field.setCustomValidity('');
    });

    // Validate required fields
    if (!fields.nome.value.trim()) {
        fields.nome.setCustomValidity('Nome é obrigatório.');
        isValid = false;
    } else if (fields.nome.value.trim().length < 2) {
        fields.nome.setCustomValidity('Nome deve ter pelo menos 2 caracteres.');
        isValid = false;
    }

    if (!fields.tipo.value) {
        fields.tipo.setCustomValidity('Tipo é obrigatório.');
        isValid = false;
    }

    // Validate email if provided
    if (fields.email.value && !isValidEmail(fields.email.value)) {
        fields.email.setCustomValidity('Formato de e-mail inválido.');
        isValid = false;
    }

    // Validate document if provided
    if (fields.documento.value.trim()) {
        const cleanDoc = fields.documento.value.replace(/\D/g, '');
        if (cleanDoc.length === 11 && !isValidCPF(fields.documento.value)) {
            fields.documento.setCustomValidity('CPF inválido.');
            isValid = false;
        } else if (cleanDoc.length === 14 && !isValidCNPJ(fields.documento.value)) {
            fields.documento.setCustomValidity('CNPJ inválido.');
            isValid = false;
        } else if (cleanDoc.length !== 11 && cleanDoc.length !== 14 && cleanDoc.length > 0) {
            fields.documento.setCustomValidity('Documento deve ser um CPF ou CNPJ válido.');
            isValid = false;
        }
    }

    return isValid;
}

/**
 * Submit the person form data to the database
 */
async function submitPersonForm() {
    const submitButton = document.querySelector('#personForm button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Salvando...';

        // Collect form data
        const formData = {
            nome: document.getElementById('nome').value.trim(),
            tipo: document.getElementById('tipo').value,
            telefone: document.getElementById('telefone').value.trim(),
            email: document.getElementById('email').value.trim(),
            documento: document.getElementById('documento').value.trim(),
            endereco: document.getElementById('endereco').value.trim(),
            observacoes: document.getElementById('observacoes').value.trim(),
            status: document.getElementById('status').value
        };

        let personId;
        
        // Check if we're editing or creating
        if (window.editingPersonId) {
            // Update existing person
            await updatePerson(window.editingPersonId, formData);
            personId = window.editingPersonId;
            if (typeof showAlert === 'function') {
                showAlert('Pessoa atualizada com sucesso!', 'success');
            } else {
                alert('Pessoa atualizada com sucesso!');
            }
            console.log('Person updated successfully with ID:', personId);
            
            // Reset editing mode
            window.editingPersonId = null;
        } else {
            // Create new person
            personId = await addPerson(formData);
            if (typeof showAlert === 'function') {
                showAlert('Pessoa cadastrada com sucesso!', 'success');
            } else {
                alert('Pessoa cadastrada com sucesso!');
            }
            console.log('Person added successfully with ID:', personId);
        }

        // Reset form
        resetPersonForm();

        // Reload recent people
        try {
            await loadRecentPeople();
        } catch (loadError) {
            console.warn('Could not load recent people:', loadError);
        }

    } catch (error) {
        console.error('Error saving person:', error);
        if (typeof showAlert === 'function') {
            showAlert('Erro ao salvar pessoa: ' + error.message, 'danger');
        } else {
            alert('Erro ao salvar pessoa: ' + error.message);
        }
    } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

/**
 * Add real-time validation to person form fields
 */
function addPersonRealTimeValidation() {
    const form = document.getElementById('personForm');
    if (!form) return;

    // Add input event listeners for real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Clear custom validity on input
            this.setCustomValidity('');
            
            // Remove invalid class if input is now valid
            if (this.checkValidity()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });

        input.addEventListener('blur', function() {
            // Validate on blur for better UX
            validatePersonField(this);
        });
    });

    // Format document field
    const documentField = document.getElementById('documento');
    if (documentField) {
        documentField.addEventListener('input', function() {
            // Auto-format CPF/CNPJ
            const cleanValue = this.value.replace(/\D/g, '');
            if (cleanValue.length <= 11) {
                // Format as CPF
                this.value = cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else {
                // Format as CNPJ
                this.value = cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            }
        });
    }

    // Format phone field
    const phoneField = document.getElementById('telefone');
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            this.value = formatPhone(this.value);
        });
    }
}

/**
 * Validate a specific person form field
 * @param {HTMLElement} field - The field to validate
 */
function validatePersonField(field) {
    const value = field.value.trim();
    
    // Clear previous validation
    field.setCustomValidity('');
    
    // Field-specific validation
    switch (field.id) {
        case 'nome':
            if (field.hasAttribute('required') && !value) {
                field.setCustomValidity('Nome é obrigatório.');
                return false;
            }
            if (value && value.length < 2) {
                field.setCustomValidity('Nome deve ter pelo menos 2 caracteres.');
                return false;
            }
            break;

        case 'email':
            if (value && !isValidEmail(value)) {
                field.setCustomValidity('Formato de e-mail inválido.');
                return false;
            }
            break;

        case 'documento':
            if (value) {
                const cleanDoc = value.replace(/\D/g, '');
                if (cleanDoc.length === 11 && !isValidCPF(value)) {
                    field.setCustomValidity('CPF inválido.');
                    return false;
                } else if (cleanDoc.length === 14 && !isValidCNPJ(value)) {
                    field.setCustomValidity('CNPJ inválido.');
                    return false;
                } else if (cleanDoc.length !== 11 && cleanDoc.length !== 14 && cleanDoc.length > 0) {
                    field.setCustomValidity('Documento deve ser um CPF ou CNPJ válido.');
                    return false;
                }
            }
            break;
    }

    return field.checkValidity();
}

/**
 * Load recent people for display
 */
async function loadRecentPeople() {
    try {
        const people = await getAllPeople();
        const container = document.getElementById('recentPeople');
        
        if (!container) {
            console.warn('Recent people container not found');
            return;
        }
        
        // Sort by created date and get last 5
        const recentPeople = people
            .sort((a, b) => new Date(b.created_at || new Date()) - new Date(a.created_at || new Date()))
            .slice(0, 5);

        if (recentPeople.length === 0) {
            container.innerHTML = '<p class="text-muted small">Nenhuma pessoa cadastrada ainda.</p>';
            return;
        }

        container.innerHTML = recentPeople.map(person => `
            <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                <div>
                    <div class="fw-bold small">${person.nome || 'N/A'}</div>
                    <div class="text-muted small">${person.tipo || 'N/A'}</div>
                </div>
                <span class="badge bg-${person.status === 'Ativo' ? 'success' : 'secondary'} small">
                    ${person.status || 'Ativo'}
                </span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading recent people:', error);
        const container = document.getElementById('recentPeople');
        if (container) {
            container.innerHTML = '<p class="text-muted small">Erro ao carregar pessoas recentes.</p>';
        }
    }
}

// Export functions for global use
window.initPeopleDatabase = initPeopleDatabase;
window.addPerson = addPerson;
window.getAllPeople = getAllPeople;
window.getPeopleByType = getPeopleByType;
window.getActiveCustomers = getActiveCustomers;
window.getActiveMechanics = getActiveMechanics;
window.initPersonFormValidation = initPersonFormValidation;
window.loadRecentPeople = loadRecentPeople;

/**
 * Update a person record in the database
 * @param {number} id - The ID of the person to update
 * @param {Object} personData - The person data to update
 * @returns {Promise<boolean>} True if successful
 */
async function updatePerson(id, personData) {
    try {
        const db = await getDatabase();
        
        // Add updated timestamp
        personData.updated_at = new Date().toISOString();
        
        await db.put(PEOPLE_STORE_NAME, { ...personData, id });
        console.log('Person updated successfully with ID:', id);
        return true;
    } catch (error) {
        console.error('Error updating person:', error);
        throw new Error('Erro ao atualizar pessoa: ' + error.message);
    }
}

// Make updatePerson available globally
window.updatePerson = updatePerson;