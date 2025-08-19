/**
 * Menu and Navigation Functions
 * Handles sidebar toggle and dynamic menu population across all pages
 */

function populateMenu(activePage = '') {
    const nav = document.querySelector('nav.navbar');
    if (!nav) return;

    const menuItems = {
        dashboard: { href: '/index.html', icon: 'fa-home', text: 'Dashboard' },
        cadastros: {
            text: 'Cadastros', icon: 'fa-plus-circle',
            dropdown: [
                { href: '/pages/cadastro.html', icon: 'fa-undo', text: 'Nova Devolução' },
                { href: '/pages/cadastro-pessoas.html', icon: 'fa-user', text: 'Clientes/Mecânicos' },
                { href: '/pages/cadastro-fornecedor.html', icon: 'fa-truck', text: 'Fornecedores' },
            ]
        },
        garantias: {
            text: 'Garantias', icon: 'fa-shield-alt',
            dropdown: [
                { href: '/pages/cadastro-garantia.html', icon: 'fa-plus', text: 'Nova Garantia' },
                { href: '/pages/consulta-garantia.html', icon: 'fa-search', text: 'Consultar Garantias' },
            ]
        },
        relatorios: { href: '/pages/relatorio.html', icon: 'fa-chart-bar', text: 'Relatórios' },
        configuracoes: { href: '/pages/configuracoes.html', icon: 'fa-cog', text: 'Configurações' },
        backup: { href: '/pages/backup.html', icon: 'fa-database', text: 'Backup' },
    };

    let menuHtml = `
        <div class="container">
            <a class="navbar-brand" href="/index.html">
                <i class="fas fa-tools me-2"></i>
                Sistema de Controle
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
    `;

    for (const key in menuItems) {
        const item = menuItems[key];
        const isActive = key === activePage || (item.dropdown && item.dropdown.some(d => d.href.includes(activePage)));

        if (item.dropdown) {
            menuHtml += `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle ${isActive ? 'active' : ''}" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="fas ${item.icon} me-1"></i>${item.text}
                    </a>
                    <ul class="dropdown-menu">
                        ${item.dropdown.map(d => `
                            <li><a class="dropdown-item" href="${d.href}"><i class="fas ${d.icon} me-2"></i>${d.text}</a></li>
                        `).join('')}
                    </ul>
                </li>
            `;
        } else {
            menuHtml += `
                <li class="nav-item">
                    <a class="nav-link ${isActive ? 'active' : ''}" href="${item.href}">
                        <i class="fas ${item.icon} me-1"></i>${item.text}
                    </a>
                </li>
            `;
        }
    }

    menuHtml += `
                </ul>
            </div>
        </div>
    `;

    nav.innerHTML = menuHtml;
}


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
window.populateMenu = populateMenu;