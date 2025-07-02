# Sistema de Controle de Retorno de Peças

Um sistema web completo e moderno para gerenciamento de devoluções de peças automotivas, desenvolvido como Progressive Web App (PWA) com funcionalidades offline e capacidade de instalação nativa.

## 🚀 Funcionalidades Principais

### 📦 Gestão de Devoluções
- **Múltiplas peças por devolução** - Registre várias peças em uma única devolução
- **Cadastro detalhado** - Informações completas de código, descrição, quantidade e tipo de ação
- **Validação inteligente** - Verificação automática de dados e prevenção de erros
- **Histórico completo** - Rastreamento de todas as modificações

### 👥 Gestão de Pessoas
- **Códigos automáticos** - Sistema gera códigos únicos (P0001, P0002, etc.)
- **Clientes e mecânicos** - Cadastro unificado com tipos flexíveis
- **Ordenação alfabética** - Dropdowns organizados automaticamente
- **Consulta sob demanda** - Interface otimizada para dispositivos móveis

### 📊 Relatórios e Análises
- **Relatórios impressos** - Geração de relatórios formatados para impressão
- **Múltiplos formatos** - Exportação em CSV e visualização em tela
- **Análises estatísticas** - Resumos, tendências e análises temporais
- **Relatórios personalizados** - Filtros avançados por período, cliente, peça, etc.

### 📱 Progressive Web App (PWA)
- **Funciona offline** - Utiliza dados locais quando sem internet
- **Instalação nativa** - Pode ser instalado como aplicativo no dispositivo
- **Responsivo** - Interface adaptada para desktop, tablet e celular
- **Menu lateral** - Navegação otimizada para telas pequenas

### 🎯 Tipos de Ação Suportados
- **Troca** - Substituição da peça defeituosa
- **Reembolso** - Devolução do valor pago
- **Reparo** - Conserto da peça original
- **Descarte** - Eliminação da peça danificada
- **Análise** - Investigação técnica do problema

## 📋 Requisitos do Sistema

### Mínimos
- Navegador web moderno (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- JavaScript habilitado
- 50MB de espaço livre para cache offline

### Recomendados
- Conexão com internet para sincronização
- Resolução mínima: 320px (mobile) / 1024px (desktop)
- RAM: 2GB ou superior

## 🛠️ Instalação

### Opção 1: Uso Direto (Recomendado)
1. Acesse o sistema através do navegador
2. O sistema funcionará imediatamente
3. Para instalação como app, clique no botão "Instalar App" quando aparecer

### Opção 2: Instalação como PWA
1. **No Chrome/Edge (Desktop):**
   - Clique no ícone de instalação na barra de endereço
   - Ou vá em Menu → "Instalar [Nome do Sistema]"

2. **No Chrome/Edge (Mobile):**
   - Toque no menu (3 pontos)
   - Selecione "Adicionar à tela inicial"

3. **No Safari (iOS):**
   - Toque no botão de compartilhamento
   - Selecione "Adicionar à Tela de Início"

### Opção 3: Deploy Local
```bash
# Clone ou baixe os arquivos
git clone [repositorio]

# Navegue para a pasta
cd sistema-controle-pecas

# Execute um servidor local
python -m http.server 5000
# ou
npx serve -p 5000

# Acesse http://localhost:5000
```

## 📖 Guia de Uso

### 1. Cadastro de Pessoas

#### Acessando o Cadastro
- No menu principal, clique em "Cadastro de Pessoas"
- Ou use o menu lateral (≡) em dispositivos móveis

#### Cadastrando Nova Pessoa
1. Clique no botão "Nova Pessoa"
2. Preencha os campos obrigatórios:
   - **Nome completo**
   - **Tipo**: Cliente, Mecânico ou Ambos
3. Campos opcionais:
   - E-mail, telefone, endereço
   - Observações específicas
4. O **código** é gerado automaticamente (P0001, P0002, etc.)
5. Clique em "Salvar"

#### Consultando Pessoas
- Clique no botão "Consultar" para exibir a lista
- Use os filtros para buscar por tipo ou nome
- Ordene clicando nos cabeçalhos das colunas
- Pessoas aparecem como "CÓDIGO - NOME" nos dropdowns

### 2. Cadastro de Devoluções

#### Nova Devolução
1. Acesse "Cadastro de Devolução" no menu
2. **Seção de Peças:**
   - Preencha os dados da primeira peça
   - Clique em "Adicionar Peça" para mais itens
   - Use o botão 🗑️ para remover peças (mínimo 1)

#### Campos por Peça
- **Código da peça** (obrigatório)
- **Quantidade** (número inteiro, mínimo 1)
- **Ação** (Troca, Reembolso, Reparo, Descarte, Análise)
- **Descrição** (obrigatória)
- **Observações** (opcional, específicas da peça)

#### Informações Gerais
- **Cliente** (obrigatório, seleção de pessoas cadastradas)
- **Mecânico** (opcional, padrão = mesmo que cliente)
- **Requisição de Venda** (obrigatório)
- **Data de Venda** (opcional)
- **Data de Devolução** (obrigatório, padrão = hoje)
- **Observações Gerais** (opcional)

#### Finalizando
- Sistema valida todos os campos automaticamente
- Mostra erros em tempo real
- Salva todas as peças da devolução simultaneamente
- Exibe confirmação de sucesso

### 3. Consulta e Pesquisa

#### Filtros Disponíveis
- **Período**: Data inicial e final
- **Cliente**: Seleção de clientes cadastrados
- **Mecânico**: Seleção de mecânicos
- **Código da peça**: Busca parcial
- **Descrição**: Busca por texto
- **Número do pedido**: Busca exata ou parcial
- **Tipo de ação**: Filtro por ação específica

#### Visualização dos Resultados
- **Tabela responsiva** com informações principais
- **Ordenação** clicando nos cabeçalhos
- **Paginação** automática para muitos registros
- **Detalhes expandidos** ao clicar na linha
- **Ações**: Editar ou excluir registros

#### Devoluções com Múltiplas Peças
- Cada peça aparece como linha separada
- Identificação visual de devoluções relacionadas
- Informações do cabeçalho (cliente, mecânico, etc.) replicadas

### 4. Relatórios

#### Tipos de Relatórios
1. **Resumo Geral**
   - Total de devoluções e quantidades
   - Peças e clientes únicos
   - Estatísticas consolidadas

2. **Por Peças**
   - Ranking de peças mais devolvidas
   - Quantidade total e ocorrências
   - Percentual do total

3. **Por Clientes**
   - Clientes com mais devoluções
   - Quantidade total por cliente
   - Peças únicas devolvidas

4. **Por Mecânicos**
   - Performance por mecânico
   - Análise de padrões
   - Distribuição de trabalho

5. **Por Ações**
   - Distribuição dos tipos de ação
   - Percentuais e médias
   - Análise de tendências

6. **Mensal**
   - Evolução temporal
   - Comparação entre períodos
   - Identificação de sazonalidade

#### Funcionalidades dos Relatórios
- **Filtros personalizados** por período
- **Visualização interativa** em tela
- **Exportação CSV** para Excel/Planilhas
- **Impressão formatada** com layout profissional
- **Visualização prévia** antes da impressão

#### Imprimindo Relatórios
1. Gere o relatório desejado
2. Clique no botão "Imprimir"
3. Escolha "Visualizar Impressão" para preview
4. Ou "Imprimir Direto" para impressão imediata
5. Layout otimizado para papel A4

### 5. Backup e Restauração

#### Exportando Dados
1. Acesse "Backup de Dados" no menu
2. Clique em "Exportar Backup"
3. Arquivo JSON será baixado automaticamente
4. Contém todas as devoluções e pessoas

#### Importando Dados
1. Na página de backup, clique "Escolher Arquivo"
2. Selecione o arquivo de backup (.json)
3. Sistema valida o arquivo automaticamente
4. Clique "Importar" para restaurar os dados
5. Dados existentes serão preservados (sem duplicação)

#### Limpeza de Dados
- **Limpar Devoluções**: Remove apenas devoluções
- **Limpar Pessoas**: Remove apenas pessoas cadastradas
- **Limpar Tudo**: Reset completo do sistema
- ⚠️ **Atenção**: Operações irreversíveis

## 🔧 Funcionalidades Técnicas

### Armazenamento de Dados
- **IndexedDB**: Banco local para funcionamento offline
- **Cache inteligente**: Recursos essenciais salvos localmente
- **Sincronização**: Preparado para futura integração com servidor

### Validações
- **Tempo real**: Feedback imediato durante digitação
- **Cross-field**: Validação entre campos relacionados
- **Prevenção de erros**: Bloqueio de dados inválidos
- **Mensagens claras**: Instruções específicas para correção

### Performance
- **Carregamento rápido**: Recursos otimizados
- **Busca eficiente**: Índices automáticos no banco
- **Interface responsiva**: Adaptação automática ao dispositivo
- **Cache offline**: Funciona sem internet

### Segurança
- **Sanitização**: Prevenção de XSS e injeções
- **Validação dupla**: Cliente e estrutural
- **Backup seguro**: Dados em formato JSON padrão

## 🎨 Interface e Experiência

### Design Responsivo
- **Mobile First**: Prioridade para dispositivos móveis
- **Menu Hamburger**: Navegação otimizada em telas pequenas
- **Touch Friendly**: Botões e campos adequados para toque
- **Feedback visual**: Animações suaves e indicadores claros

### Acessibilidade
- **Navegação por teclado**: Suporte completo
- **Contrast adequado**: Cores acessíveis
- **Textos alternativos**: Descrições em ícones
- **Estrutura semântica**: HTML apropriado

### Cores e Identidade
- **Azul primário**: #667eea (confiança e profissionalismo)
- **Verde**: Sucesso e confirmações
- **Vermelho**: Alertas e erros
- **Cinza**: Informações neutras

## 🛠️ Solução de Problemas

### Problemas Comuns

#### Sistema não carrega
1. Verifique a conexão com internet (primeira vez)
2. Limpe o cache do navegador
3. Desabilite extensões que bloqueiam JavaScript
4. Tente em modo incógnito/privado

#### Dados não aparecem
1. Verifique se há registros cadastrados
2. Limpe os filtros aplicados
3. Verifique o período selecionado
4. Recarregue a página (F5)

#### Não consigo adicionar peças
1. Preencha todos os campos obrigatórios
2. Verifique se a quantidade é maior que zero
3. Selecione um tipo de ação válido
4. Corrija campos destacados em vermelho

#### Impressão com problemas
1. Use navegadores modernos (Chrome/Edge recomendados)
2. Verifique as configurações de pop-up
3. Desabilite bloqueadores de pop-up temporariamente
4. Tente a visualização prévia primeiro

#### App não instala
1. Use navegador compatível (Chrome/Edge/Safari)
2. Acesse via HTTPS (obrigatório para PWA)
3. Aguarde o prompt de instalação aparecer
4. Verifique se há espaço suficiente no dispositivo

### Limitações Conhecidas
- **Navegadores antigos**: Funcionalidade limitada em IE/versões antigas
- **Impressão no Safari**: Algumas limitações de formatação
- **Offline no iOS**: Cache limitado comparado ao Android

## 📞 Suporte e Feedback

### Como Relatar Problemas
1. Descreva o problema detalhadamente
2. Inclua o navegador e versão utilizada
3. Mencione os passos para reproduzir
4. Anexe screenshots se possível

### Melhorias e Sugestões
- Funcionalidades desejadas
- Problemas de usabilidade
- Sugestões de interface
- Relatórios adicionais necessários

## 📄 Licença e Créditos

Este sistema foi desenvolvido como uma solução completa para gestão de devoluções de peças automotivas, utilizando tecnologias web modernas e práticas de desenvolvimento atuais.

### Tecnologias Utilizadas
- **HTML5/CSS3/JavaScript**: Frontend moderno
- **Bootstrap 5**: Framework de interface
- **Font Awesome**: Ícones profissionais
- **IndexedDB**: Banco de dados local
- **Service Workers**: Funcionalidade offline
- **PWA**: Progressive Web App

---

**Versão**: 1.0.0  
**Última atualização**: Julho 2025  
**Compatibilidade**: Navegadores modernos com suporte a PWA