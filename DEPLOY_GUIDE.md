# Guia de Implantação e Configuração

Este guia descreve os passos para configurar o banco de dados no Neon e implantar a aplicação na Vercel.

## 1. Configuração do Banco de Dados (Neon)

A aplicação utiliza um banco de dados PostgreSQL serverless hospedado no Neon.

### Passos:

1.  **Crie uma Conta no Neon:**
    *   Acesse [Neon](https://neon.tech/) e crie uma conta gratuita.

2.  **Crie um Novo Projeto:**
    *   No painel do Neon, crie um novo projeto. Dê um nome a ele, por exemplo, `sistema-pecas`.
    *   O Neon provisionará um banco de dados PostgreSQL para você.

3.  **Obtenha a String de Conexão:**
    *   No painel do seu projeto no Neon, vá para a seção **Connection Details**.
    *   Copie a string de conexão que se parece com: `postgres://user:password@host/dbname`.
    *   **Importante:** Esta é a sua variável `DATABASE_URL`. Guarde-a em um local seguro.

## 2. Implantação na Vercel

A Vercel é a plataforma recomendada para implantar esta aplicação, pois ela suporta serverless functions, que são usadas para a API de sincronização.

### Passos:

1.  **Crie uma Conta na Vercel:**
    *   Acesse [Vercel](https://vercel.com/) e crie uma conta (você pode usar sua conta do GitHub, GitLab, etc.).

2.  **Crie um Novo Projeto:**
    *   No seu painel da Vercel, clique em **Add New...** -> **Project**.
    *   Importe o repositório do Git onde este código está hospedado.

3.  **Configure as Variáveis de Ambiente:**
    *   Durante a configuração do projeto, vá para a seção **Environment Variables**.
    *   Crie uma nova variável de ambiente:
        *   **Name:** `DATABASE_URL`
        *   **Value:** Cole a string de conexão do Neon que você copiou anteriormente.
    *   Clique em **Add**.

4.  **Configure o Build e o Deploy:**
    *   A Vercel geralmente detecta a configuração automaticamente (Next.js, etc.). Para este projeto, as configurações padrão devem ser suficientes. O diretório de saída deve ser o raiz do projeto.
    *   Clique em **Deploy**. A Vercel fará o build e a implantação da aplicação.

## 3. Migração do Banco de Dados

Após a primeira implantação, o banco de dados estará vazio. Você precisa executar a migração para criar as tabelas (`people`, `devolutions`, etc.).

### Passos:

1.  **Instale a CLI da Vercel (se ainda não tiver):**
    ```bash
    npm install -g vercel
    ```

2.  **Faça o Link do seu Projeto Local com a Vercel:**
    *   No seu terminal, na raiz do projeto, execute:
        ```bash
        vercel link
        ```
    *   Siga as instruções para conectar-se ao seu projeto na Vercel.

3.  **Puxe as Variáveis de Ambiente:**
    *   Para obter a `DATABASE_URL` do ambiente da Vercel para o seu ambiente local, execute:
        ```bash
        vercel env pull .env.development.local
        ```
    *   Isso criará um arquivo `.env.development.local` com a sua string de conexão.

4.  **Execute a Migração:**
    *   Agora que seu ambiente local tem acesso à `DATABASE_URL`, você pode executar o script de migração:
        ```bash
        npm run db:push
        ```
    *   Este comando usará o `drizzle-kit` para ler o seu schema em `shared/schema.ts` e criar as tabelas correspondentes no seu banco de dados Neon. As tabelas criadas incluem: `people`, `devolutions`, `empresa`, `fornecedores`, e `garantias`.

Após esses passos, sua aplicação estará implantada na Vercel e conectada ao banco de dados Neon, com o schema devidamente configurado. As APIs de sincronização (ex: `/api/sync`, `/api/garantias`) estarão prontas para receber requisições.
