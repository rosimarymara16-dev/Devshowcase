# DevShowcase API — Grupo 2

API REST para uma vitrine de projetos de desenvolvedores (etapa 1: modelagem de domínio, persistência e endpoints básicos).

**Integrantes:** Elda de Sousa Carvalho · Wilque Vito Ribeiro · Rosimary de Sousa Carvalho

## Tecnologias

- Node.js 18+ com Express
- SQLite via `sql.js` (JavaScript/WebAssembly puro, sem compilação na instalação), com o banco salvo em `data/devshowcase.db`, criado automaticamente
- Zod para validação dos DTOs de entrada

## Como rodar

```bash
npm install
npm start
```

A API sobe em `http://localhost:3000`. Para desenvolvimento com recarga automática use `npm run dev`.

Para zerar o banco, pare o servidor e apague o arquivo `data/devshowcase.db`.

## Modelo de domínio

| Entidade | Campos principais | Relacionamentos |
|---|---|---|
| Profile | name, email, bio, githubUrl | 1:N com Project |
| Project | title, description, repositoryUrl, demoUrl | N:1 com Profile, N:N com Technology, 1:N com Feedback |
| Technology | name, category | N:N com Project (tabela `project_technologies`) |
| Feedback | authorName, comment, rating (1 a 5) | N:1 com Project |

## Estrutura do projeto

```
src/
├── config/         variáveis de ambiente (porta, arquivo do banco)
├── database/       conexão SQLite e schema.sql
├── repositories/   acesso ao banco (um por entidade)
├── dtos/           schemas de entrada (validação) e formatadores de saída
├── services/       regras de negócio
├── controllers/    recebem a requisição e devolvem a resposta
├── routes/         definição dos endpoints
├── middlewares/    validação, tratamento de erros e 404
├── app.js          configuração do Express
└── server.js       inicia o servidor
```

## Endpoints

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| POST | `/api/profiles` | Cria um perfil | 201 |
| GET | `/api/profiles/{id}` | Busca um perfil com seus projetos | 200 |
| POST | `/api/technologies` | Cadastra uma tecnologia | 201 |
| GET | `/api/technologies` | Lista as tecnologias | 200 |
| POST | `/api/projects` | Cria um projeto vinculado a um perfil e a tecnologias | 201 |
| GET | `/api/projects` | Lista projetos com dono, tecnologias e feedbacks | 200 |

### Exemplos de corpo

`POST /api/profiles`
```json
{ "name": "Elda de Sousa Carvalho", "email": "elda@devshowcase.com", "bio": "Desenvolvedora back-end", "githubUrl": "https://github.com/elda" }
```

`POST /api/technologies`
```json
{ "name": "Node.js", "category": "Backend" }
```

`POST /api/projects`
```json
{ "title": "API de Tarefas", "description": "API REST de tarefas", "repositoryUrl": "https://github.com/elda/api-tarefas", "profileId": 1, "technologyIds": [1, 2] }
```

## Validações e erros

- Títulos e nomes não podem ser vazios (espaços em branco não contam).
- URLs precisam ser válidas e começar com `http://` ou `https://`.
- E-mail de perfil e nome de tecnologia não podem se repetir (409).
- Campos desconhecidos no corpo são rejeitados (400).
- Perfil ou tecnologia inexistente ao criar projeto retorna 404 ou 400.

Formato padrão de erro:
```json
{ "status": 400, "error": "Dados inválidos", "details": [{ "field": "title", "message": "title não pode ser vazio" }] }
```

## Postman

Importe `postman/DevShowcase-Grupo2.postman_collection.json`. As requisições estão na ordem da demonstração (tecnologias → perfis → projetos, cada pasta com casos de erro no final). Rode com o banco zerado para os ids baterem.
