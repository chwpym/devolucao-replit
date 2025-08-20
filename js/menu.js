/**
 * Dynamic Menu Generation
 * Populates the navigation bar and sidebar based on a single source of truth.
 */

function populateMenu(activePage = '', basePath = '') {
    const navContainer = document.querySelector('nav.navbar .container');
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (!navContainer || !sidebarMenu) return;

    const menuItems = {
        dashboard: { href: `${basePath}index.html`, icon: 'fa-home', text: 'Dashboard' },
        cadastros: {
            text: 'Cadastros', icon: 'fa-plus-circle',
            dropdown: [
                { href: `${basePath}pages/cadastro.html`, icon: 'fa-undo', text: 'Nova Devolução' },
                { href: `${basePath}pages/cadastro-pessoas.html`, icon: 'fa-user', text: 'Clientes/Mecânicos' },
                { href: `${basePath}pages/cadastro-fornecedor.html`, icon: 'fa-truck', text: 'Fornecedores' },
            ]
        },
        garantias: {
            text: 'Garantias', icon: 'fa-shield-alt',
            dropdown: [
                { href: `${basePath}pages/cadastro-garantia.html`, icon: 'fa-plus', text: 'Nova Garantia' },
                { href: `${basePath}pages/consulta-garantia.html`, icon: 'fa-search', text: 'Consultar Garantias' },
                { href: `${basePath}pages/relatorio-garantia.html`, icon: 'fa-chart-line', text: 'Relatório de Garantias' },
            ]
        },
        consultas: {
            text: 'Consultas', icon: 'fa-search',
            dropdown: [
                { href: `${basePath}pages/consulta.html`, icon: 'fa-undo', text: 'Consultar Devoluções' },
                { href: `${basePath}pages/consulta-garantia.html`, icon: 'fa-shield-alt', text: 'Consultar Garantias' },
            ]
        },
        relatorios: { href: `${basePath}pages/relatorio.html`, icon: 'fa-chart-bar', text: 'Relatórios' },
        configuracoes: { href: `${basePath}pages/configuracoes.html`, icon: 'fa-cog', text: 'Configurações' },
        backup: { href: `${basePath}pages/backup.html`, icon: 'fa-database', text: 'Backup' },
    };

    // --- Populate Top Navbar ---
    let topMenuHtml = `
        <button class="sidebar-toggle" onclick="toggleSidebar()"><i class="fas fa-bars"></i></button>
        <a class="navbar-brand" href="${basePath}index.html"><i class="fas fa-tools me-2"></i>Sistema de Controle</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"><span class="navbar-toggler-icon"></span></button>
        <div class="collapse navbar-collapse" id="navbarNav"><ul class="navbar-nav ms-auto">`;

    Object.entries(menuItems).forEach(([key, item]) => {
        const isActive = activePage.includes(key);
        if (item.dropdown) {
            topMenuHtml += `<li class="nav-item dropdown"><a class="nav-link dropdown-toggle ${isActive ? 'active' : ''}" href="#" role="button" data-bs-toggle="dropdown"><i class="fas ${item.icon} me-1"></i>${item.text}</a><ul class="dropdown-menu">${item.dropdown.map(d => `<li><a class="dropdown-item" href="${d.href}"><i class="fas ${d.icon} me-2"></i>${d.text}</a></li>`).join('')}</ul></li>`;
        } else {
            topMenuHtml += `<li class="nav-item"><a class="nav-link ${isActive ? 'active' : ''}" href="${item.href}"><i class="fas ${item.icon} me-1"></i>${item.text}</a></li>`;
        }
    });
    topMenuHtml += `</ul></div>`;
    navContainer.innerHTML = topMenuHtml;

    // --- Populate Sidebar Menu ---
    let sidebarHtml = '';
    Object.entries(menuItems).forEach(([key, item]) => {
        const isActive = activePage.includes(key);
        if (item.dropdown) {
            sidebarHtml += `<a class="nav-link" href="${item.dropdown[0].href}"><i class="fas ${item.icon}"></i>${item.text}</a>`;
        } else {
            sidebarHtml += `<a class="nav-link ${isActive ? 'active' : ''}" href="${item.href}"><i class="fas ${item.icon}"></i>${item.text}</a>`;
        }
    });
    sidebarMenu.innerHTML = sidebarHtml;
}