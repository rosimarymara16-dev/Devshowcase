# DevShowcase API — Grupo 2

API REST para uma vitrine de projetos de desenvolvedores: perfis cadastram projetos, marcam as tecnologias usadas e recebem curtidas (upvotes) e feedbacks com nota de 1 a 5.

Esta é a versão final (etapa 2): endpoints de feedback, upvote e listagem com filtro e paginação, tratamento global de erros, documentação Swagger e deploy com PostgreSQL no Render.

**Integrantes:** Rosimary de Sousa Carvalho (Mara) · Elda de Sousa Carvalho

**API em produção:** `https://SEU-SERVICO.onrender.com` _(preencher depois do deploy)_

**Swagger em produção:** `https://SEU-SERVICO.onrender.com/docs`

## Tecnologias

- Node.js 18+ com Express 4
- PostgreSQL com o pacote `pg` (JavaScript puro, não precisa compilar nada na instalação)
- Zod para validação dos DTOs de entrada (corpo, query string e id da rota)
- swagger-ui-express com a especificação OpenAPI 3 escrita em `src/docs/openapi.js`
- dotenv para carregar o arquivo `.env` no ambiente local

## Como rodar localmente

Pré-requisitos: Node.js 18 ou mais novo e um PostgreSQL rodando na máquina.

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um banco vazio (pelo pgAdmin ou pelo `psql`):
   ```sql
   CREATE DATABASE devshowcase;
   ```
3. Copie o `.env.example` para `.env` e ajuste a URL com o seu usuário e senha do PostgreSQL:
   ```bash
   cp .env.example .env
   ```
   ```env
   DATABASE_URL=postgresql://usuario:senha@localhost:5432/devshowcase
   PORT=3000
   DATABASE_SSL=false
   ```
4. Suba a API:
   ```bash
   npm start
   ```
   Para desenvolvimento com recarga automática use `npm run dev`.

As tabelas são criadas automaticamente na inicialização (o `schema.sql` usa `CREATE TABLE IF NOT EXISTS`), então um banco novo já funciona sem nenhum script manual.

A API sobe em `http://localhost:3000` e a raiz `/` redireciona para a documentação em `/docs`.

| Variável | Obrigatória | Padrão | Para que serve |
|---|---|---|---|
| `DATABASE_URL` | sim | — | URL de conexão do PostgreSQL |
| `PORT` | não | `3000` | Porta HTTP (no Render é definida automaticamente) |
| `DATABASE_SSL` | não | `false` | Use `true` quando o banco exige SSL (URL externa do Render, Supabase etc.) |

Se a `DATABASE_URL` não estiver definida, a API não sobe e mostra a mensagem:

```
Erro de configuração: a variável de ambiente DATABASE_URL não foi definida.
```

O arquivo `.env` está no `.gitignore` e nunca deve ir para o repositório. Para zerar o banco local, apague e crie de novo o banco `devshowcase`.

## Documentação interativa (Swagger)

| Rota | O que tem |
|---|---|
| `/docs` | Swagger UI com todas as rotas, exemplos de corpo e respostas de erro (dá para testar pelo navegador) |
| `/openapi.json` | Especificação OpenAPI 3 em JSON |
| `/` | Redireciona para `/docs` |
| `/health` | Responde `{ "status": "ok" }` |

## Modelo de domínio

| Entidade | Campos principais | Relacionamentos |
|---|---|---|
| Profile | name, email, bio, githubUrl | 1:N com Project |
| Project | title, description, repositoryUrl, demoUrl, upvotes, averageRating | N:1 com Profile, N:N com Technology, 1:N com Feedback |
| Technology | name, category | N:N com Project (tabela `project_technologies`) |
| Feedback | authorName, comment, rating (1 a 5) | N:1 com Project |

No banco: e-mail de perfil e nome de tecnologia são únicos sem diferenciar maiúsculas/minúsculas, `upvotes` começa em 0, `average_rating` é `NUMERIC(3,2)` e fica `null` até o primeiro feedback, e as chaves estrangeiras usam `ON DELETE CASCADE`.

## Estrutura do projeto

```
src/
├── config/         variáveis de ambiente (porta, DATABASE_URL, SSL)
├── database/       pool do PostgreSQL, helper de transação e schema.sql
├── repositories/   acesso ao banco (um por entidade)
├── dtos/           schemas de entrada (validação) e formatadores de saída
├── services/       regras de negócio (média dos feedbacks, paginação...)
├── controllers/    recebem a requisição e devolvem a resposta
├── routes/         definição dos endpoints
├── middlewares/    validação, asyncHandler, manipulador global de erros e 404
├── docs/           especificação OpenAPI usada pelo Swagger
├── app.js          configuração do Express
└── server.js       cria as tabelas e inicia o servidor
```

## Endpoints

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| GET | `/api/projects` | Lista projetos com filtro por tecnologia e paginação | 200 |
| POST | `/api/projects` | Cria um projeto vinculado a um perfil e a tecnologias | 201 |
| PUT | `/api/projects/{id}/upvote` | Soma 1 curtida no projeto | 200 |
| POST | `/api/projects/{id}/feedbacks` | Registra um feedback e recalcula a nota média | 201 |
| POST | `/api/profiles` | Cria um perfil | 201 |
| GET | `/api/profiles/{id}` | Busca um perfil com seus projetos | 200 |
| POST | `/api/technologies` | Cadastra uma tecnologia | 201 |
| GET | `/api/technologies` | Lista as tecnologias | 200 |

### Listagem com filtro e paginação

`GET /api/projects?technology=react&page=1&limit=10`

| Parâmetro | Padrão | Regra |
|---|---|---|
| `technology` | — | Nome da tecnologia, sem diferenciar maiúsculas/minúsculas (`react`, `React` e `REACT` dão o mesmo resultado) |
| `page` | `1` | Inteiro maior ou igual a 1 |
| `limit` | `10` | Inteiro de 1 a 50 |

A query string só aceita esses três parâmetros: **qualquer outro responde `400`** (veja o exemplo logo abaixo). `page` e `limit` precisam ser só dígitos, então valores como `1e1`, `0x2` ou `" 10"` também dão `400`.

Os projetos vêm do mais novo para o mais antigo. Resposta `200`:

```json
{
  "data": [
    {
      "id": 2,
      "title": "Controle de Estoque",
      "description": "Entrada e saída de produtos com alerta de estoque baixo",
      "repositoryUrl": "https://github.com/elda/controle-estoque",
      "demoUrl": null,
      "upvotes": 1,
      "averageRating": null,
      "totalFeedbacks": 0,
      "createdAt": "2026-10-01T14:05:22.310Z",
      "owner": { "id": 2, "name": "Elda de Sousa Carvalho" },
      "technologies": [
        { "id": 1, "name": "Node.js", "category": "Backend" },
        { "id": 4, "name": "PostgreSQL", "category": "Banco de dados" },
        { "id": 3, "name": "React", "category": "Frontend" }
      ],
      "feedbacks": []
    }
  ],
  "pagination": { "page": 1, "limit": 10, "totalItems": 1, "totalPages": 1 }
}
```

- Página além do fim (ex.: `?page=99`) responde `200` com `"data": []`.
- `page=0`, `limit=100`, `page=abc` ou `page=1e1` respondem `400` (veja [Erros](#erros)).
- Parâmetro fora da lista (ex.: `?pagina=2`) responde `400`:

```json
{
  "status": 400,
  "error": "Requisição inválida",
  "message": "Parâmetros de consulta inválidos",
  "details": [
    { "field": "(query)", "message": "campo(s) não permitido(s): pagina" }
  ],
  "path": "/api/projects?pagina=2",
  "timestamp": "2026-10-01T14:30:45.208Z"
}
```

### Upvote

`PUT /api/projects/1/upvote` (sem corpo). O incremento é feito direto no banco (`UPDATE projects SET upvotes = upvotes + 1 ... RETURNING *`), então duas curtidas ao mesmo tempo não se perdem. Resposta `200` com o projeto completo:

```json
{
  "id": 1,
  "title": "Agenda de Consultas",
  "description": "Agendamento de consultas para clínicas pequenas, com lembrete por e-mail",
  "repositoryUrl": "https://github.com/rosimary/agenda-consultas",
  "demoUrl": "https://agenda-consultas.onrender.com",
  "upvotes": 3,
  "averageRating": null,
  "totalFeedbacks": 0,
  "createdAt": "2026-10-01T14:05:21.184Z",
  "owner": { "id": 1, "name": "Rosimary de Sousa Carvalho" },
  "technologies": [
    { "id": 2, "name": "Express", "category": "Framework" },
    { "id": 1, "name": "Node.js", "category": "Backend" },
    { "id": 4, "name": "PostgreSQL", "category": "Banco de dados" }
  ],
  "feedbacks": []
}
```

Projeto inexistente responde `404`.

### Feedbacks

`POST /api/projects/1/feedbacks`

```json
{ "authorName": "Elda de Sousa Carvalho", "comment": "Interface simples e o agendamento funciona muito bem.", "rating": 5 }
```

- `authorName`: texto obrigatório (até 120 caracteres)
- `comment`: texto obrigatório (até 1000 caracteres)
- `rating`: inteiro de 1 a 5

O service grava o feedback e atualiza a média do projeto **na mesma transação**. A linha do projeto é travada com `SELECT ... FOR UPDATE`, então dois feedbacks simultâneos no mesmo projeto não calculam a média errada. A média tem 2 casas decimais.

Resposta `201` depois de uma nota 5 e uma nota 3 no mesmo projeto:

```json
{
  "feedback": {
    "id": 2,
    "projectId": 1,
    "authorName": "Visitante",
    "comment": "Faltou a opção de cancelar a consulta pelo celular.",
    "rating": 3,
    "createdAt": "2026-10-01T14:11:40.093Z"
  },
  "project": { "id": 1, "averageRating": 4, "totalFeedbacks": 2 }
}
```

Projeto inexistente responde `404`.

### Perfis, tecnologias e projetos (etapa 1)

`POST /api/profiles`
```json
{ "name": "Rosimary de Sousa Carvalho", "email": "rosimary@devshowcase.com", "bio": "Desenvolvedora back-end", "githubUrl": "https://github.com/rosimary" }
```

`POST /api/technologies`
```json
{ "name": "Node.js", "category": "Backend" }
```

`POST /api/projects`
```json
{ "title": "Agenda de Consultas", "description": "Agendamento de consultas para clínicas pequenas", "repositoryUrl": "https://github.com/rosimary/agenda-consultas", "profileId": 1, "technologyIds": [1, 2, 4] }
```

Validações mantidas da etapa 1:

- Títulos e nomes não podem ser vazios (espaços em branco não contam).
- URLs precisam ser válidas e começar com `http://` ou `https://`.
- E-mail de perfil e nome de tecnologia não podem se repetir (409).
- Campos desconhecidos no corpo são rejeitados (400).
- Perfil inexistente ao criar projeto retorna 404; tecnologia inexistente retorna 400.

## Erros

Todos os erros passam por um único manipulador global (`src/middlewares/errorHandler.js`) e seguem o mesmo formato:

```json
{
  "status": 400,
  "error": "Requisição inválida",
  "message": "Dados inválidos",
  "details": [
    { "field": "comment", "message": "comment não pode ser vazio" },
    { "field": "rating", "message": "rating deve ser no máximo 5" }
  ],
  "path": "/api/projects/1/feedbacks",
  "timestamp": "2026-10-01T14:32:10.512Z"
}
```

`details` só aparece quando há campos a corrigir.

| Status | Quando acontece |
|---|---|
| 400 | Corpo inválido, JSON malformado, `id` da rota não numérico, `page`/`limit` inválidos, parâmetro de consulta fora da lista, tecnologia inexistente ao criar projeto |
| 404 | Projeto, perfil ou rota inexistente |
| 409 | E-mail de perfil ou nome de tecnologia já cadastrado |
| 500 | Erro inesperado (a resposta não mostra detalhes internos; o erro fica só no log do servidor) |

Exemplo de `404`:

```json
{ "status": 404, "error": "Não encontrado", "message": "Projeto 999 não encontrado", "path": "/api/projects/999/upvote", "timestamp": "2026-10-01T14:33:02.117Z" }
```

## Postman

Importe `postman/DevShowcase-Grupo2.postman_collection.json`. A URL fica na variável da coleção `baseUrl` (padrão `http://localhost:3000`); para gravar o vídeo em produção, troque o valor para a URL do Render.

As pastas estão na ordem da apresentação:

1. **0. Preparação** – cadastra tecnologias, os perfis da Mara e da Elda e os projetos, guardando os ids em variáveis (pode rodar de novo no mesmo banco: tecnologia repetida aceita 201 ou 409 e os e-mails levam um número único)
2. **1. Listagem** – filtro por tecnologia (maiúsculas e minúsculas), paginação e página além do fim
3. **2. Upvote** – curtidas no projeto (o teste confere +1 em relação às curtidas lidas logo antes do envio)
4. **3. Feedbacks** – nota 5 e depois nota 3 no mesmo projeto (com o banco zerado, média 5 e depois 4); o teste recalcula a média esperada a partir da soma das notas e da quantidade de feedbacks de antes do envio, e a última requisição confere na listagem a média, o total de feedbacks e as curtidas
5. **4. Erros** – 400 de validação, JSON malformado, id e query inválidos; 404 de projeto e de rota inexistente
6. **5. Etapa 1** – endpoints e validações da etapa 1

Toda requisição tem `pm.test` conferindo o status esperado, e as respostas de erro também conferem o formato padrão (`status`, `error`, `message`, `path`, `timestamp`). A coleção inteira roda pelo Runner.

### Regravando um trecho do vídeo

Curtidas, médias, a página 2 e a página além do fim são conferidas em relação ao que a API tinha logo antes do envio: um script lê a listagem com `pm.sendRequest`, guarda o valor atual numa variável e o teste compara com ele. Assim, sem zerar o banco:

- **reenviar uma requisição** ou **rodar de novo uma pasta** não deixa teste vermelho;
- **rodar uma pasta sozinha com as variáveis vazias** (coleção recém-importada, por exemplo) também funciona: os projetos da preparação são procurados pelo título na listagem, os perfis da pasta 5 pelo dono desses projetos, e os dois 400 de feedback da pasta 4 usam o id 1 (o corpo é validado antes de a API procurar o projeto);
- **reenviar só o cadastro de um perfil** limpa as variáveis dos projetos daquele perfil, porque o perfil novo começa sem projetos; a busca desse perfil na pasta 5 passa a conferir só que `projects` é uma lista, até os projetos serem cadastrados de novo.

O que a coleção não resolve sozinha: a pasta **0. Preparação** precisa ter rodado pelo menos uma vez no banco usado, e as requisições dela dependem umas das outras (com as variáveis vazias, rode a pasta inteira, não uma requisição solta). Depois de zerar o banco ou trocar a `baseUrl` para outro servidor, rode a pasta 0 antes das outras, porque os ids guardados deixam de existir.

## Deploy no Render

1. Com o código no GitHub, entre em [render.com](https://render.com) e faça login com a conta do GitHub.
2. **Banco:** clique em **New → Postgres**.
   - Name: `devshowcase-db`
   - Region: escolha uma (ex.: Ohio) e use a **mesma** no Web Service
   - Plan: **Free**
   - Clique em **Create Database** e, quando ficar disponível, copie a **Internal Database URL**.
3. **API:** clique em **New → Web Service** e selecione este repositório.
   - Name: `devshowcase-api-grupo2`
   - Region: a mesma do banco
   - Branch: `main`
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free**
4. Em **Environment Variables**, adicione `DATABASE_URL` com a **Internal Database URL** copiada no passo 2. Não precisa definir `PORT` (o Render define sozinho) nem `DATABASE_SSL` (a URL interna não usa SSL).
5. Em **Advanced**, deixe **Auto-Deploy** como **On Commit**: todo push na branch `main` gera um deploy novo.
6. Clique em **Create Web Service** e acompanhe os logs até aparecer `DevShowcase API rodando...`. As tabelas são criadas automaticamente nessa primeira subida.
7. Teste `https://SEU-SERVICO.onrender.com/health` e `https://SEU-SERVICO.onrender.com/docs`, troque a `baseUrl` do Postman e rode a coleção.

Observações:

- No plano Free a API "dorme" depois de 15 minutos sem uso; a primeira requisição depois disso demora cerca de 1 minuto (as seguintes voltam ao normal). Antes de gravar o vídeo, abra `/health` uma vez para acordar o serviço.
- O PostgreSQL Free do Render expira 30 dias após a criação. Grave o vídeo e entregue dentro desse prazo; se precisar de mais tempo, crie outro banco Free e troque a `DATABASE_URL` do Web Service (as tabelas são recriadas sozinhas na próxima subida).
- Para acessar o banco do Render de fora (pelo pgAdmin ou rodando a API local), use a **External Database URL** com `DATABASE_SSL=true`.
