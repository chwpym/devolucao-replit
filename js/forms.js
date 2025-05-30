/**
 * Form Handling and Validation for Parts Return Control System
 * Manages form submission, validation, and user interaction
 */

/**
 * Initialize form validation for the devolution registration form
 */
function initFormValidation() {
    const form = document.getElementById('devolutionForm');
    if (!form) return;

    // Add custom validation styles
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        event.stopPropagation();

        // Remove previous validation classes
        form.classList.remove('was-validated');

        // Validate form
        if (await validateForm()) {
            await submitForm();
        } else {
            form.classList.add('was-validated');
            scrollToFirstError();
        }
    });

    // Add real-time validation for specific fields
    addRealTimeValidation();
}

/**
 * Validate the entire form
 * @returns {Promise<boolean>} True if form is valid
 */
async function validateForm() {
    const form = document.getElementById('devolutionForm');
    let isValid = true;

    // Get all form fields
    const fields = {
        codigoPeca: document.getElementById('codigoPeca'),
        descricaoPeca: document.getElementById('descricaoPeca'),
        quantidadeDevolvida: document.getElementById('quantidadeDevolvida'),
        cliente: document.getElementById('cliente'),
        mecanico: document.getElementById('mecanico'),
        requisicaoVenda: document.getElementById('requisicaoVenda'),
        acaoRequisicao: document.getElementById('acaoRequisicao'),
        dataVenda: document.getElementById('dataVenda'),
        dataDevolucao: document.getElementById('dataDevolucao')
    };

    // Validate required fields
    for (const [fieldName, field] of Object.entries(fields)) {
        if (!field) continue;

        const value = field.value.trim();
        
        // Clear previous custom validation
        field.setCustomValidity('');
        
        // Skip mechanic field for required validation since it's now optional
        if (field.hasAttribute('required') && fieldName !== 'mecanico' && !value) {
            field.setCustomValidity('Este campo é obrigatório.');
            isValid = false;
            continue;
        }

        // Field-specific validations
        switch (fieldName) {
            case 'quantidadeDevolvida':
                if (value && (isNaN(value) || parseInt(value) <= 0)) {
                    field.setCustomValidity('A quantidade deve ser um número maior que zero.');
                    isValid = false;
                }
                break;

            case 'dataVenda':
            case 'dataDevolucao':
                if (value && !isValidDate(value)) {
                    field.setCustomValidity('Data inválida.');
                    isValid = false;
                }
                break;

            case 'codigoPeca':
                if (value && value.length < 2) {
                    field.setCustomValidity('Código da peça deve ter pelo menos 2 caracteres.');
                    isValid = false;
                }
                break;

            case 'descricaoPeca':
                if (value && value.length < 3) {
                    field.setCustomValidity('Descrição deve ter pelo menos 3 caracteres.');
                    isValid = false;
                }
                break;

            case 'cliente':
            case 'mecanico':
                if (value && value.length < 2) {
                    field.setCustomValidity('Nome deve ter pelo menos 2 caracteres.');
                    isValid = false;
                }
                break;

            case 'requisicaoVenda':
                if (value && value.length < 2) {
                    field.setCustomValidity('Código da requisição deve ter pelo menos 2 caracteres.');
                    isValid = false;
                }
                break;
        }
    }

    // Cross-field validation: return date should not be before sale date
    const dataVenda = fields.dataVenda.value;
    const dataDevolucao = fields.dataDevolucao.value;
    
    if (dataVenda && dataDevolucao && new Date(dataDevolucao) < new Date(dataVenda)) {
        fields.dataDevolucao.setCustomValidity('Data da devolução não pode ser anterior à data da venda.');
        isValid = false;
    }

    // Check if return date is not in the future
    if (dataDevolucao && new Date(dataDevolucao) > new Date()) {
        fields.dataDevolucao.setCustomValidity('Data da devolução não pode ser no futuro.');
        isValid = false;
    }

    return isValid;
}

/**
 * Submit the form data to the database
 */
async function submitForm() {
    const submitButton = document.querySelector('#devolutionForm button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Salvando...';

        // Collect form data
        const formData = {
            codigo_peca: document.getElementById('codigoPeca').value.trim(),
            descricao_peca: document.getElementById('descricaoPeca').value.trim(),
            quantidade_devolvida: parseInt(document.getElementById('quantidadeDevolvida').value),
            cliente: document.getElementById('cliente').value.trim(),
            mecanico: document.getElementById('mecanico').value.trim() || document.getElementById('cliente').value.trim(),
            requisicao_venda: document.getElementById('requisicaoVenda').value.trim(),
            acao_requisicao: document.getElementById('acaoRequisicao').value,
            data_venda: document.getElementById('dataVenda').value,
            data_devolucao: document.getElementById('dataDevolucao').value,
            observacao: document.getElementById('observacao').value.trim()
        };

        // Check if editing or creating
        if (window.editingDevolutionId) {
            // Update existing devolution
            await updateDevolution(window.editingDevolutionId, formData);
            showAlert('Devolução atualizada com sucesso!', 'success');
            
            // Redirect back to search page after successful update
            setTimeout(() => {
                window.location.href = 'consulta.html';
            }, 1500);
        } else {
            // Save new devolution to database
            const newId = await addDevolution(formData);
            showAlert('Devolução registrada com sucesso!', 'success');

            // Reset form
            document.getElementById('devolutionForm').reset();
            document.getElementById('devolutionForm').classList.remove('was-validated');
            
            // Reset date to today
            document.getElementById('dataDevolucao').value = getTodayDate();

            // Clear any validation messages
            clearValidationMessages();

            console.log('Devolution saved successfully with ID:', newId);
        }

    } catch (error) {
        console.error('Error saving devolution:', error);
        showAlert('Erro ao salvar devolução: ' + error.message, 'danger');
    } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

/**
 * Add real-time validation to form fields
 */
function addRealTimeValidation() {
    const form = document.getElementById('devolutionForm');
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
            validateField(this);
        });
    });

    // Special handling for date fields
    const dataVenda = document.getElementById('dataVenda');
    const dataDevolucao = document.getElementById('dataDevolucao');

    if (dataVenda && dataDevolucao) {
        [dataVenda, dataDevolucao].forEach(dateField => {
            dateField.addEventListener('change', function() {
                // Re-validate both date fields when either changes
                validateDateFields();
            });
        });
    }

    // Auto-format and validate quantity field
    const quantidadeField = document.getElementById('quantidadeDevolvida');
    if (quantidadeField) {
        quantidadeField.addEventListener('input', function() {
            // Remove non-numeric characters
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Validate quantity
            if (this.value && parseInt(this.value) <= 0) {
                this.setCustomValidity('Quantidade deve ser maior que zero.');
            } else {
                this.setCustomValidity('');
            }
        });
    }
}

/**
 * Validate a specific form field
 * @param {HTMLElement} field - The field to validate
 */
function validateField(field) {
    const value = field.value.trim();
    
    // Clear previous validation
    field.setCustomValidity('');
    
    // Check required fields
    if (field.hasAttribute('required') && !value) {
        field.setCustomValidity('Este campo é obrigatório.');
        return false;
    }

    // Field-specific validation
    switch (field.id) {
        case 'quantidadeDevolvida':
            if (value && (isNaN(value) || parseInt(value) <= 0)) {
                field.setCustomValidity('A quantidade deve ser um número maior que zero.');
                return false;
            }
            break;

        case 'codigoPeca':
            if (value && value.length < 2) {
                field.setCustomValidity('Código da peça deve ter pelo menos 2 caracteres.');
                return false;
            }
            break;

        case 'descricaoPeca':
            if (value && value.length < 3) {
                field.setCustomValidity('Descrição deve ter pelo menos 3 caracteres.');
                return false;
            }
            break;

        case 'cliente':
        case 'mecanico':
            if (value && value.length < 2) {
                field.setCustomValidity('Nome deve ter pelo menos 2 caracteres.');
                return false;
            }
            break;

        case 'requisicaoVenda':
            if (value && value.length < 2) {
                field.setCustomValidity('Código da requisição deve ter pelo menos 2 caracteres.');
                return false;
            }
            break;
    }

    return field.checkValidity();
}

/**
 * Validate date fields together for cross-field validation
 */
function validateDateFields() {
    const dataVenda = document.getElementById('dataVenda');
    const dataDevolucao = document.getElementById('dataDevolucao');
    
    if (!dataVenda || !dataDevolucao) return;

    const saleDate = dataVenda.value;
    const returnDate = dataDevolucao.value;

    // Clear previous validations
    dataVenda.setCustomValidity('');
    dataDevolucao.setCustomValidity('');

    if (saleDate && returnDate) {
        if (new Date(returnDate) < new Date(saleDate)) {
            dataDevolucao.setCustomValidity('Data da devolução não pode ser anterior à data da venda.');
        }
    }

    if (returnDate && new Date(returnDate) > new Date()) {
        dataDevolucao.setCustomValidity('Data da devolução não pode ser no futuro.');
    }

    // Update visual validation state
    [dataVenda, dataDevolucao].forEach(field => {
        if (field.checkValidity()) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }
    });
}

/**
 * Scroll to the first field with validation errors
 */
function scrollToFirstError() {
    const firstInvalidField = document.querySelector('.is-invalid, :invalid');
    if (firstInvalidField) {
        firstInvalidField.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        firstInvalidField.focus();
    }
}

/**
 * Clear all validation messages and classes
 */
function clearValidationMessages() {
    const form = document.getElementById('devolutionForm');
    if (!form) return;

    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        field.setCustomValidity('');
        field.classList.remove('is-valid', 'is-invalid');
    });
}

/**
 * Validate a date string
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Show alert message to user
 * @param {string} message - Message to display
 * @param {string} type - Alert type (success, danger, warning, info)
 */
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${getAlertIcon(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    alertContainer.innerHTML = alertHtml;

    // Auto-dismiss after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }

    // Scroll to alert
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Get appropriate icon for alert type
 * @param {string} type - Alert type
 * @returns {string} Icon class name
 */
function getAlertIcon(type) {
    const icons = {
        success: 'check-circle',
        danger: 'exclamation-triangle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

/**
 * Pre-fill form with data (for editing functionality)
 * @param {Object} data - Data to pre-fill
 */
function prefillForm(data) {
    const fields = [
        'codigoPeca', 'descricaoPeca', 'quantidadeDevolvida',
        'cliente', 'mecanico', 'requisicaoVenda', 'acaoRequisicao',
        'dataVenda', 'dataDevolucao', 'observacao'
    ];

    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const dataKey = fieldId.replace(/([A-Z])/g, '_$1').toLowerCase();
        
        if (field && data[dataKey] !== undefined) {
            field.value = data[dataKey];
        }
    });

    // Clear validation state
    clearValidationMessages();
}

/**
 * Auto-complete functionality for form fields
 */
function initAutoComplete() {
    // This could be enhanced to provide auto-complete suggestions
    // based on previously entered data from the database
    const textFields = [
        'codigoPeca', 'descricaoPeca', 'cliente', 
        'mecanico', 'requisicaoVenda'
    ];

    textFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                // Future enhancement: implement auto-complete dropdown
                // with suggestions from existing database records
            });
        }
    });
}

// Export functions for global use
window.initFormValidation = initFormValidation;
window.validateForm = validateForm;
window.submitForm = submitForm;
window.prefillForm = prefillForm;
window.showAlert = showAlert;
window.clearValidationMessages = clearValidationMessages;
window.getTodayDate = getTodayDate;

