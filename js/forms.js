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

        // Validate parts first
        if (!validateParts()) {
            throw new Error('Por favor, corrija os erros nas informações das peças.');
        }

        // Collect parts data
        const partsData = getPartsData();
        if (partsData.length === 0) {
            throw new Error('Pelo menos uma peça deve ser informada.');
        }

        // Collect header form data
        const formData = {
            cliente: document.getElementById('cliente').value.trim(),
            mecanico: document.getElementById('mecanico').value.trim() || document.getElementById('cliente').value.trim(),
            requisicao_venda: document.getElementById('requisicaoVenda').value.trim(),
            data_venda: document.getElementById('dataVenda').value,
            data_devolucao: document.getElementById('dataDevolucao').value,
            observacao: document.getElementById('observacao').value.trim(),
            parts: partsData
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
            const newId = await addDevolutionWithParts(formData);
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

/**
 * Multiple Parts Management
 * Handles adding, removing, and validating multiple parts in a devolution
 */

let partCounter = 1;

/**
 * Initialize multiple parts functionality
 */
function initMultipleParts() {
    const addPartBtn = document.getElementById('addPartBtn');
    if (addPartBtn) {
        addPartBtn.addEventListener('click', addNewPart);
    }
    
    // Setup event delegation for remove buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-part-btn') || e.target.closest('.remove-part-btn')) {
            const button = e.target.classList.contains('remove-part-btn') ? e.target : e.target.closest('.remove-part-btn');
            const partRow = button.closest('.part-row');
            removePart(partRow);
        }
    });
    
    updatePartButtons();
}

/**
 * Add a new part row
 */
function addNewPart() {
    const container = document.getElementById('partsContainer');
    const partCount = container.children.length + 1;
    partCounter++;
    
    const partRow = document.createElement('div');
    partRow.className = 'part-row border rounded p-3 mb-3';
    partRow.setAttribute('data-part-index', partCounter - 1);
    
    partRow.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0 text-primary">Peça #${partCount}</h6>
            <button type="button" class="btn btn-outline-danger btn-sm remove-part-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="row">
            <div class="col-md-4 mb-3">
                <label class="form-label">
                    Código da Peça <span class="text-danger">*</span>
                </label>
                <input type="text" class="form-control codigo-peca" name="parts[${partCounter - 1}][codigo_peca]" required>
                <div class="invalid-feedback">
                    Por favor, informe o código da peça.
                </div>
            </div>
            <div class="col-md-2 mb-3">
                <label class="form-label">
                    Quantidade <span class="text-danger">*</span>
                </label>
                <input type="number" class="form-control quantidade-devolvida" name="parts[${partCounter - 1}][quantidade_devolvida]" min="1" required>
                <div class="invalid-feedback">
                    Informe uma quantidade válida.
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <label class="form-label">
                    Ação <span class="text-danger">*</span>
                </label>
                <select class="form-select tipo-acao" name="parts[${partCounter - 1}][tipo_acao]" required>
                    <option value="">Selecione...</option>
                    <option value="Troca">Troca</option>
                    <option value="Reembolso">Reembolso</option>
                    <option value="Reparo">Reparo</option>
                    <option value="Descarte">Descarte</option>
                    <option value="Análise">Análise</option>
                </select>
                <div class="invalid-feedback">
                    Por favor, selecione o tipo de ação.
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <label class="form-label">Descrição da Peça <span class="text-danger">*</span></label>
                <input type="text" class="form-control descricao-peca" name="parts[${partCounter - 1}][descricao_peca]" required>
                <div class="invalid-feedback">
                    Por favor, informe a descrição.
                </div>
            </div>
            <div class="col-12 mb-3">
                <label class="form-label">Observações da Peça</label>
                <textarea class="form-control observacoes-item" name="parts[${partCounter - 1}][observacoes_item]" rows="2" placeholder="Observações específicas desta peça..."></textarea>
            </div>
        </div>
    `;
    
    container.appendChild(partRow);
    
    // Add animation
    partRow.style.opacity = '0';
    partRow.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        partRow.style.transition = 'all 0.3s ease';
        partRow.style.opacity = '1';
        partRow.style.transform = 'translateY(0)';
    }, 10);
    
    updatePartButtons();
    updatePartNumbers();
}

/**
 * Remove a part row
 */
function removePart(partRow) {
    const container = document.getElementById('partsContainer');
    
    // Don't allow removing if it's the only part
    if (container.children.length <= 1) {
        showAlert('Deve haver pelo menos uma peça na devolução.', 'warning');
        return;
    }
    
    // Animate removal
    partRow.style.transition = 'all 0.3s ease';
    partRow.style.opacity = '0';
    partRow.style.transform = 'translateX(-100%)';
    
    setTimeout(() => {
        partRow.remove();
        updatePartButtons();
        updatePartNumbers();
    }, 300);
}

/**
 * Update part buttons visibility
 */
function updatePartButtons() {
    const container = document.getElementById('partsContainer');
    const partRows = container.querySelectorAll('.part-row');
    
    partRows.forEach((row, index) => {
        const removeBtn = row.querySelector('.remove-part-btn');
        if (partRows.length > 1) {
            removeBtn.classList.remove('d-none');
        } else {
            removeBtn.classList.add('d-none');
        }
    });
}

/**
 * Update part numbers in headers
 */
function updatePartNumbers() {
    const container = document.getElementById('partsContainer');
    const partRows = container.querySelectorAll('.part-row');
    
    partRows.forEach((row, index) => {
        const header = row.querySelector('h6');
        if (header) {
            header.textContent = `Peça #${index + 1}`;
        }
        
        // Update form field names
        const inputs = row.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const name = input.getAttribute('name');
            if (name && name.startsWith('parts[')) {
                const newName = name.replace(/parts\[\d+\]/, `parts[${index}]`);
                input.setAttribute('name', newName);
            }
        });
        
        row.setAttribute('data-part-index', index);
    });
}

/**
 * Get parts data from form
 */
function getPartsData() {
    const parts = [];
    const partRows = document.querySelectorAll('.part-row');
    
    partRows.forEach((row, index) => {
        const codigoPeca = row.querySelector('.codigo-peca').value.trim();
        const descricaoPeca = row.querySelector('.descricao-peca').value.trim();
        const quantidadeDevolvida = parseInt(row.querySelector('.quantidade-devolvida').value);
        const tipoAcao = row.querySelector('.tipo-acao').value;
        const observacoesItem = row.querySelector('.observacoes-item').value.trim();
        
        if (codigoPeca && descricaoPeca && quantidadeDevolvida && tipoAcao) {
            parts.push({
                codigo_peca: codigoPeca,
                descricao_peca: descricaoPeca,
                quantidade_devolvida: quantidadeDevolvida,
                tipo_acao: tipoAcao,
                observacoes_item: observacoesItem || null
            });
        }
    });
    
    return parts;
}

/**
 * Validate all parts
 */
function validateParts() {
    const partRows = document.querySelectorAll('.part-row');
    let isValid = true;
    
    partRows.forEach((row, index) => {
        const codigoPeca = row.querySelector('.codigo-peca');
        const descricaoPeca = row.querySelector('.descricao-peca');
        const quantidadeDevolvida = row.querySelector('.quantidade-devolvida');
        const tipoAcao = row.querySelector('.tipo-acao');
        
        // Clear previous validation
        [codigoPeca, descricaoPeca, quantidadeDevolvida, tipoAcao].forEach(field => {
            field.classList.remove('is-invalid');
        });
        
        // Validate required fields
        if (!codigoPeca.value.trim()) {
            codigoPeca.classList.add('is-invalid');
            isValid = false;
        }
        
        if (!descricaoPeca.value.trim()) {
            descricaoPeca.classList.add('is-invalid');
            isValid = false;
        }
        
        if (!quantidadeDevolvida.value || parseInt(quantidadeDevolvida.value) < 1) {
            quantidadeDevolvida.classList.add('is-invalid');
            isValid = false;
        }
        
        if (!tipoAcao.value) {
            tipoAcao.classList.add('is-invalid');
            isValid = false;
        }
    });
    
    return isValid;
}

// Export functions for global use
window.initFormValidation = initFormValidation;
window.validateForm = validateForm;
window.submitForm = submitForm;
window.prefillForm = prefillForm;
window.showAlert = showAlert;
window.clearValidationMessages = clearValidationMessages;
window.getTodayDate = getTodayDate;
window.initMultipleParts = initMultipleParts;
window.getPartsData = getPartsData;
window.validateParts = validateParts;

