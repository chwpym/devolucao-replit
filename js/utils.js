/**
 * Utility Functions for Parts Return Control System
 * Common helper functions used throughout the application
 */

/**
 * Format date for display in Brazilian format
 * @param {string|Date} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
function formatDate(date, includeTime = false) {
    if (!date) return '-';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Data inválida';
    
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Sao_Paulo'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return dateObj.toLocaleDateString('pt-BR', options);
}

/**
 * Format currency values in Brazilian Real
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Format numbers with Brazilian locale
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
function formatNumber(value, decimals = 0) {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate Brazilian CPF format
 * @param {string} cpf - CPF to validate
 * @returns {boolean} True if valid CPF
 */
function isValidCPF(cpf) {
    if (typeof cpf !== 'string') return false;
    
    // Remove formatting
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Check length
    if (cpf.length !== 11) return false;
    
    // Check for repeated digits
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validate checksum
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;
    
    if (parseInt(cpf.charAt(9)) !== digit1) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;
    
    return parseInt(cpf.charAt(10)) === digit2;
}

/**
 * Validate Brazilian CNPJ format
 * @param {string} cnpj - CNPJ to validate
 * @returns {boolean} True if valid CNPJ
 */
function isValidCNPJ(cnpj) {
    if (typeof cnpj !== 'string') return false;
    
    // Remove formatting
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    // Check length
    if (cnpj.length !== 14) return false;
    
    // Check for repeated digits
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validate first checksum digit
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
        sum += parseInt(cnpj.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
    }
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    if (parseInt(cnpj.charAt(12)) !== digit1) return false;
    
    // Validate second checksum digit
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
        sum += parseInt(cnpj.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
    }
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return parseInt(cnpj.charAt(13)) === digit2;
}

/**
 * Format phone number in Brazilian format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
function formatPhone(phone) {
    if (typeof phone !== 'string') return '';
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
        // (11) 1234-5678
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
        // (11) 12345-6789
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
}

/**
 * Format CPF for display
 * @param {string} cpf - CPF to format
 * @returns {string} Formatted CPF
 */
function formatCPF(cpf) {
    if (typeof cpf !== 'string') return '';
    
    const cleaned = cpf.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return cpf;
}

/**
 * Format CNPJ for display
 * @param {string} cnpj - CNPJ to format
 * @returns {string} Formatted CNPJ
 */
function formatCNPJ(cnpj) {
    if (typeof cnpj !== 'string') return '';
    
    const cleaned = cnpj.replace(/\D/g, '');
    
    if (cleaned.length === 14) {
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return cnpj;
}

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate a random ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID
 */
function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
    return obj;
}

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get browser information
 * @returns {Object} Browser information
 */
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    
    if (ua.indexOf('Chrome') > -1) {
        browser = 'Chrome';
        version = ua.match(/Chrome\/(\d+)/)[1];
    } else if (ua.indexOf('Firefox') > -1) {
        browser = 'Firefox';
        version = ua.match(/Firefox\/(\d+)/)[1];
    } else if (ua.indexOf('Safari') > -1) {
        browser = 'Safari';
        version = ua.match(/Version\/(\d+)/)[1];
    } else if (ua.indexOf('Edge') > -1) {
        browser = 'Edge';
        version = ua.match(/Edge\/(\d+)/)[1];
    }
    
    return { browser, version };
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification alert alert-${type === 'error' ? 'danger' : type} position-fixed`;
    toast.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    const icon = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    }[type] || 'info-circle';
    
    toast.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${icon} me-2"></i>
            <span>${sanitizeString(message)}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }, duration);
}

/**
 * Show loading indicator
 * @param {string} message - Loading message
 * @returns {Object} Loading control object
 */
function showLoading(message = 'Carregando...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    overlay.innerHTML = `
        <div class="bg-white p-4 rounded shadow text-center">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div>${sanitizeString(message)}</div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Animate in
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);
    
    return {
        hide: () => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentElement) {
                    overlay.parentElement.removeChild(overlay);
                }
            }, 300);
        },
        updateMessage: (newMessage) => {
            const messageElement = overlay.querySelector('div div:last-child');
            if (messageElement) {
                messageElement.textContent = newMessage;
            }
        }
    };
}

/**
 * Confirm dialog
 * @param {string} message - Confirmation message
 * @param {string} title - Dialog title
 * @returns {Promise<boolean>} User's choice
 */
function confirmDialog(message, title = 'Confirmação') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${sanitizeString(title)}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${sanitizeString(message)}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary confirm-btn">Confirmar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const bootstrapModal = new bootstrap.Modal(modal);
        
        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            resolve(true);
            bootstrapModal.hide();
        });
        
        modal.addEventListener('hidden.bs.modal', () => {
            resolve(false);
            document.body.removeChild(modal);
        });
        
        bootstrapModal.show();
    });
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Texto copiado para a área de transferência', 'success');
        return true;
    } catch (error) {
        console.error('Failed to copy text:', error);
        showToast('Erro ao copiar texto', 'error');
        return false;
    }
}

/**
 * Calculate time ago from a date
 * @param {string|Date} date - Date to calculate from
 * @returns {string} Time ago string
 */
function timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutos atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} horas atrás`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} meses atrás`;
    return `${Math.floor(diffInSeconds / 31536000)} anos atrás`;
}

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Set query parameter in URL
 * @param {string} param - Parameter name
 * @param {string} value - Parameter value
 */
function setQueryParam(param, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
}

/**
 * Storage helper functions for localStorage
 */
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Export functions for global use
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.sanitizeString = sanitizeString;
window.isValidEmail = isValidEmail;
window.isValidCPF = isValidCPF;
window.isValidCNPJ = isValidCNPJ;
window.formatPhone = formatPhone;
window.formatCPF = formatCPF;
window.formatCNPJ = formatCNPJ;
window.debounce = debounce;
window.throttle = throttle;
window.generateId = generateId;
window.deepClone = deepClone;
window.isMobile = isMobile;
window.getBrowserInfo = getBrowserInfo;
window.showToast = showToast;
window.showLoading = showLoading;
window.confirmDialog = confirmDialog;
window.copyToClipboard = copyToClipboard;
window.timeAgo = timeAgo;
window.getQueryParam = getQueryParam;
window.setQueryParam = setQueryParam;
window.storage = storage;

/**
 * Generate a v4 UUID
 * @returns {string} UUID
 */
function generateUUID() {
    if (crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers or non-secure contexts
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
window.generateUUID = generateUUID;

/**
 * Initialize backup reminder popup
 */
function initBackupReminder() {
    let hasShownReminder = sessionStorage.getItem('backupReminderShown') === 'true';
    
    // Show reminder when user tries to close/leave the page
    window.addEventListener('beforeunload', function(event) {
        // Don't show multiple times in same session
        if (hasShownReminder) return;
        
        // Check if there's any data to backup
        checkDataForBackup().then(hasData => {
            if (hasData && !hasShownReminder) {
                hasShownReminder = true;
                sessionStorage.setItem('backupReminderShown', 'true');
                event.preventDefault();
                event.returnValue = 'Você tem dados importantes no sistema. Lembre-se de fazer backup antes de sair!';
                return event.returnValue;
            }
        });
    });

    // Also show a gentle reminder popup after some activity
    setTimeout(() => {
        if (!hasShownReminder) {
            checkDataForBackup().then(hasData => {
                if (hasData) {
                    showBackupReminderModal();
                    hasShownReminder = true;
                    sessionStorage.setItem('backupReminderShown', 'true');
                }
            });
        }
    }, 180000); // Show after 3 minutes of activity
}

/**
 * Check if there's data worth backing up
 */
async function checkDataForBackup() {
    try {
        if (typeof getAllDevolutions === 'function') {
            const devolutions = await getAllDevolutions();
            if (devolutions && devolutions.length > 0) return true;
        }
        
        if (typeof getAllPeople === 'function') {
            const people = await getAllPeople();
            if (people && people.length > 0) return true;
        }
        
        return false;
    } catch (error) {
        console.warn('Could not check data for backup:', error);
        return false;
    }
}

/**
 * Show backup reminder modal
 */
function showBackupReminderModal() {
    // Don't show if already exists
    if (document.getElementById('backupReminderModal')) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'backupReminderModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-warning text-dark">
                    <h5 class="modal-title">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Lembrete de Backup
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Importante:</strong> Seus dados são armazenados localmente no navegador.
                    </div>
                    <p>Para evitar perda de dados, recomendamos fazer backup regularmente:</p>
                    <ul>
                        <li>Acesse a página de <strong>Backup</strong> no menu</li>
                        <li>Clique em <strong>"Exportar Backup"</strong></li>
                        <li>Salve o arquivo em local seguro</li>
                    </ul>
                    <div class="alert alert-warning mb-0">
                        <small>
                            <i class="fas fa-warning me-1"></i>
                            Dados podem ser perdidos se o navegador for resetado ou cookies forem limpos.
                        </small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        Lembrar mais tarde
                    </button>
                    <button type="button" class="btn btn-warning" onclick="goToBackupPage()">
                        <i class="fas fa-download me-1"></i>
                        Fazer Backup Agora
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

/**
 * Navigate to backup page
 */
function goToBackupPage() {
    const modal = document.getElementById('backupReminderModal');
    if (modal) {
        bootstrap.Modal.getInstance(modal).hide();
    }
    window.location.href = '/pages/backup.html';
}

// Make functions available globally
window.initBackupReminder = initBackupReminder;
window.showBackupReminderModal = showBackupReminderModal;
window.goToBackupPage = goToBackupPage;

/**
 * Parses a date string (YYYY-MM-DD) to a Date object in local timezone,
 * avoiding timezone conversion issues.
 * @param {string} dateString - The date string from an input.
 * @returns {Date | null} The parsed date or null if invalid.
 */
function parseLocalDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return null;
    const parts = dateString.split('-');
    if (parts.length !== 3) return null;

    const [year, month, day] = parts.map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    // Creates the date based on local timezone
    return new Date(year, month - 1, day);
}
window.parseLocalDate = parseLocalDate;
