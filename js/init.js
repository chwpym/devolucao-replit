/**
 * Initialization helper functions
 * Ensures all required functions are available before calling them
 */

/**
 * Safe function caller with retry mechanism
 * @param {string} functionName - Name of the function to call
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 */
function safeCallFunction(functionName, maxRetries = 5, delay = 100) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const tryCall = () => {
            attempts++;
            
            if (typeof window[functionName] === 'function') {
                try {
                    window[functionName]();
                    resolve();
                } catch (error) {
                    console.error(`Error calling ${functionName}:`, error);
                    reject(error);
                }
            } else if (attempts < maxRetries) {
                console.log(`${functionName} not ready, retrying... (${attempts}/${maxRetries})`);
                setTimeout(tryCall, delay);
            } else {
                console.warn(`${functionName} not available after ${maxRetries} attempts`);
                resolve(); // Don't reject, just continue
            }
        };
        
        tryCall();
    });
}

/**
 * Initialize multiple parts functionality safely
 */
async function safeInitMultipleParts() {
    await safeCallFunction('initMultipleParts');
}

/**
 * Initialize backup reminder functionality safely
 */
async function safeInitBackupReminder() {
    await safeCallFunction('initBackupReminder');
}

// Export functions globally
window.safeInitMultipleParts = safeInitMultipleParts;
window.safeInitBackupReminder = safeInitBackupReminder;
window.safeCallFunction = safeCallFunction;