/**
 * Menu and Navigation Functions
 * Handles sidebar toggle and navigation across all pages
 */

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) {
        sidebar.classList.add('show');
    }
    if (overlay) {
        overlay.classList.add('show');
    }
}

/**
 * Close sidebar
 */
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) {
        sidebar.classList.remove('show');
    }
    if (overlay) {
        overlay.classList.remove('show');
    }
}

/**
 * Initialize menu functionality
 */
function initMenu() {
    // Handle ESC key to close sidebar
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
    
    // Handle clicks on overlay to close sidebar
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    
    // Handle sidebar toggle button
    const toggleBtn = document.querySelector('.sidebar-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
    
    // Handle close button
    const closeBtn = document.querySelector('.sidebar-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }
}

// Initialize menu when DOM is loaded
document.addEventListener('DOMContentLoaded', initMenu);

// Export functions for global use
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.initMenu = initMenu;