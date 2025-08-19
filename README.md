# Sistema de Controle de Devoluções e Garantias

Um sistema web completo e moderno para gerenciamento de devoluções e garantias de peças automotivas, desenvolvido como Progressive Web App (PWA) com funcionalidades online/offline e capacidade de instalação nativa.

## 🚀 Funcionalidades Principais

### 📦 Gestão de Devoluções
- **Cadastro detalhado** - Informações completas de código, descrição, quantidade e tipo de ação.
- **Validação inteligente** - Verificação automática de dados e prevenção de erros.
- **Histórico completo** - Rastreamento de todas as modificações.

### 🛡️ Gestão de Garantias (Novo!)
- **Módulo Dedicado**: Funcionalidade de garantia totalmente separada das devoluções.
- **Cadastro Completo**: Registre garantias com informações detalhadas como defeito, NF de compra, valor, nota de retorno, e requisições de venda e garantia.
- **Status da Garantia**: Acompanhe o ciclo de vida de cada garantia (ex: "Em análise", "Aprovada", "Rejeitada").
- **Anexo de Arquivos**: Adicione fotos do produto ou cópias de documentos a cada registro de garantia.
- **Controle de Prazos**: O sistema ajuda a visualizar garantias que estão próximas do vencimento.

### 👥 Gestão de Pessoas e Fornecedores
- **Clientes e Mecânicos**: Cadastro unificado com tipos flexíveis (Cliente, Mecânico, Ambos).
- **Fornecedores**: Módulo dedicado para o cadastro e gerenciamento de fornecedores.
- **Códigos Automáticos**: O sistema gera códigos únicos para pessoas.
- **Consulta Otimizada**: Interfaces otimizadas para consulta e gerenciamento.

### 📊 Relatórios e Análises
- **Geração de PDF (Novo!)**: Exporte relatórios e itens individuais em formato PDF com cabeçalho personalizado da sua empresa.
- **Múltiplos Formatos**: Além de PDF, exportação em CSV e visualização em tela.
- **Relatórios Personalizados**: Filtros avançados por período, cliente, fornecedor, status da garantia, etc.
- **Análises de Garantia**: Novos relatórios focados em garantias, como defeitos mais comuns e valores por fornecedor.

### ⚙️ Configurações da Empresa (Novo!)
- **Personalização**: Adicione os dados da sua empresa (nome, CNPJ, endereço, logo) para personalizar os documentos gerados.

### 📱 Progressive Web App (PWA)
- **Funciona Offline**: Utiliza o banco de dados local (IndexedDB) para acesso e registro de dados sem internet.
- **Sincronização Automática**: Os dados registrados offline são sincronizados com o servidor assim que a conexão é restaurada.
- **Instalação Nativa**: Pode ser instalado como um aplicativo no seu dispositivo (desktop ou mobile).

## 📋 Requisitos do Sistema
- Navegador web moderno (Chrome, Firefox, Safari, Edge).
- JavaScript habilitado.

## 🛠️ Instalação e Deploy
Para instruções detalhadas sobre como fazer o deploy da aplicação na Vercel e configurar o banco de dados, consulte o arquivo **`DEPLOY_GUIDE.md`**.

## 🎨 Interface e Experiência
- **Design Responsivo**: Adaptado para desktop, tablet e celular.
- **Feedback Visual**: Indicadores visuais para status de sincronização e outras operações.
- **Cores e Identidade**:
    - **Azul primário**: #0066FF (confiança e profissionalismo)
    - **Verde**: Sucesso e confirmações
    - **Vermelho**: Alertas e erros

## 🔧 Funcionalidades Técnicas

### Armazenamento de Dados
- **Modo Híbrido**: O sistema opera com um banco de dados local (IndexedDB) para agilidade e funcionalidade offline, e sincroniza com um banco de dados PostgreSQL (Neon) na nuvem para segurança e acesso multi-dispositivo.

### Tecnologias Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Ícones**: Font Awesome
- **Banco de Dados Local**: IndexedDB com wrapper `idb`
- **Banco de Dados na Nuvem**: PostgreSQL (via Neon)
- **API**: Express.js rodando em ambiente Serverless (Vercel)
- **ORM**: Drizzle ORM
- **Geração de PDF**: `jsPDF`, `jspdf-autotable`, `pdf-lib`
- **Offline**: Service Workers e Cache API
- **Testes**: Vitest, JSDOM

---

**Versão**: 2.0.0
**Última atualização**: Agosto 2025
**Compatibilidade**: Navegadores modernos com suporte a PWA