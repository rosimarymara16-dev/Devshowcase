// Especificação OpenAPI 3 da DevShowcase API (servida em /docs e /openapi.json)

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Id numérico (inteiro positivo)',
  schema: { type: 'integer', minimum: 1, example: 1 },
};

const errorExample = (status, error, message, path, details) => ({
  status,
  error,
  message,
  ...(details ? { details } : {}),
  path,
  timestamp: '2026-10-01T14:32:10.512Z',
});

const jsonContent = (schema, examples) => ({
  'application/json': { schema, ...(examples ? { examples } : {}) },
});

const errorResponse = (description, examples) => ({
  description,
  content: jsonContent({ $ref: '#/components/schemas/Erro' }, examples),
});

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });

const example = (summary, value) => ({ summary, value });

const badIdExample = (path, value = 'abc') =>
  example(
    'Id não numérico',
    errorExample(400, 'Requisição inválida', 'O id deve ser um número inteiro positivo', path, [
      { field: 'id', message: `valor recebido "${value}" não é um id válido` },
    ])
  );

const internalError = errorResponse('Erro inesperado no servidor (sem detalhes internos)', {
  erroInterno: example(
    'Erro interno',
    errorExample(500, 'Erro interno do servidor', 'Ocorreu um erro inesperado. Tente novamente em instantes.', '/api/projects')
  ),
});

const malformedJson = (path) =>
  example(
    'JSON malformado',
    errorExample(400, 'Requisição inválida', 'JSON inválido no corpo da requisição. Confira aspas, vírgulas e chaves.', path)
  );

const projectExample = {
  id: 1,
  title: 'Agenda de Consultas',
  description: 'Agendamento de consultas para clínicas pequenas, com lembrete por e-mail',
  repositoryUrl: 'https://github.com/rosimary/agenda-consultas',
  demoUrl: 'https://agenda-consultas.onrender.com',
  upvotes: 2,
  averageRating: 4,
  totalFeedbacks: 2,
  createdAt: '2026-10-01T14:05:21.184Z',
  owner: { id: 1, name: 'Rosimary de Sousa Carvalho' },
  technologies: [
    { id: 2, name: 'Express', category: 'Framework' },
    { id: 1, name: 'Node.js', category: 'Backend' },
    { id: 4, name: 'PostgreSQL', category: 'Banco de dados' },
  ],
  feedbacks: [
    {
      id: 1,
      projectId: 1,
      authorName: 'Elda de Sousa Carvalho',
      comment: 'Interface simples e o agendamento funciona muito bem.',
      rating: 5,
      createdAt: '2026-10-01T14:10:02.771Z',
    },
    {
      id: 2,
      projectId: 1,
      authorName: 'Visitante',
      comment: 'Faltou a opção de cancelar a consulta pelo celular.',
      rating: 3,
      createdAt: '2026-10-01T14:11:40.093Z',
    },
  ],
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'DevShowcase API — Grupo 2',
    version: '2.0.0',
    description: [
      'API REST de uma **vitrine de projetos de desenvolvedores**: perfis cadastram projetos, marcam as tecnologias usadas e recebem curtidas (upvotes) e feedbacks com nota de 1 a 5.',
      '',
      '**Integrantes:** Rosimary de Sousa Carvalho (Mara) e Elda de Sousa Carvalho.',
      '',
      '**Tecnologias:** Node.js, Express, PostgreSQL (pacote `pg`) e Zod.',
      '',
      '### Formato de erro',
      'Todos os erros (validação, JSON malformado, id inválido, recurso ou rota inexistente, conflito e erro interno) seguem o mesmo formato:',
      '```json',
      '{ "status": 400, "error": "Requisição inválida", "message": "Dados inválidos", "details": [{ "field": "rating", "message": "rating deve ser no máximo 5" }], "path": "/api/projects/1/feedbacks", "timestamp": "2026-10-01T14:32:10.512Z" }',
      '```',
      '`details` só aparece quando há campos a corrigir.',
    ].join('\n'),
    license: { name: 'MIT' },
  },
  servers: [{ url: '/', description: 'Servidor atual (local ou Render)' }],
  tags: [
    { name: 'Projetos', description: 'Cadastro, listagem com filtro por tecnologia e paginação, e curtidas (upvote)' },
    { name: 'Feedbacks', description: 'Avaliações com nota de 1 a 5; cada feedback recalcula a nota média do projeto' },
    { name: 'Perfis', description: 'Perfis dos desenvolvedores donos dos projetos' },
    { name: 'Tecnologias', description: 'Catálogo de tecnologias que podem ser vinculadas aos projetos' },
    { name: 'Sistema', description: 'Verificação de funcionamento da API' },
  ],
  paths: {
    '/api/projects': {
      get: {
        tags: ['Projetos'],
        summary: 'Lista projetos com filtro por tecnologia e paginação',
        description:
          'Retorna os projetos do mais novo para o mais antigo. O filtro `technology` compara o nome da tecnologia sem diferenciar maiúsculas/minúsculas (`react`, `React` e `REACT` dão o mesmo resultado). Uma página além do fim retorna `200` com `data` vazio.\n\n' +
          'A query string só aceita `technology`, `page` e `limit`: **qualquer outro parâmetro** (ex.: `?pagina=2`) responde `400`. `page` e `limit` precisam ser só dígitos (`1e1`, `0x2` ou `" 10"` também dão `400`).',
        parameters: [
          {
            name: 'technology',
            in: 'query',
            required: false,
            description: 'Nome da tecnologia (sem diferenciar maiúsculas/minúsculas)',
            schema: { type: 'string', maxLength: 60, example: 'react' },
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            description: 'Número da página (começa em 1)',
            schema: { type: 'integer', minimum: 1, default: 1, example: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Itens por página (de 1 a 50)',
            schema: { type: 'integer', minimum: 1, maximum: 50, default: 10, example: 10 },
          },
        ],
        responses: {
          200: {
            description: 'Página de projetos',
            content: jsonContent(ref('PaginaDeProjetos'), {
              filtrado: example('?technology=postgresql&page=1&limit=10', {
                data: [projectExample],
                pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
              }),
              alemDoFim: example('Página além do fim (?page=99)', {
                data: [],
                pagination: { page: 99, limit: 10, totalItems: 3, totalPages: 1 },
              }),
            }),
          },
          400: errorResponse('Parâmetro de consulta inválido ou não permitido', {
            paginaZero: example(
              'page=0',
              errorExample(400, 'Requisição inválida', 'Parâmetros de consulta inválidos', '/api/projects?page=0', [
                { field: 'page', message: 'page deve ser maior ou igual a 1' },
              ])
            ),
            limiteAlto: example(
              'limit=100',
              errorExample(400, 'Requisição inválida', 'Parâmetros de consulta inválidos', '/api/projects?limit=100', [
                { field: 'limit', message: 'limit deve ser entre 1 e 50' },
              ])
            ),
            texto: example(
              'page=abc',
              errorExample(400, 'Requisição inválida', 'Parâmetros de consulta inválidos', '/api/projects?page=abc', [
                { field: 'page', message: 'page deve ser um número inteiro' },
              ])
            ),
            parametroDesconhecido: example(
              'Parâmetro fora da lista (?pagina=2)',
              errorExample(400, 'Requisição inválida', 'Parâmetros de consulta inválidos', '/api/projects?pagina=2', [
                { field: '(query)', message: 'campo(s) não permitido(s): pagina' },
              ])
            ),
          }),
          500: internalError,
        },
      },
      post: {
        tags: ['Projetos'],
        summary: 'Cria um projeto vinculado a um perfil e a tecnologias',
        requestBody: {
          required: true,
          content: jsonContent(ref('NovoProjeto'), {
            agenda: example('Agenda de Consultas', {
              title: 'Agenda de Consultas',
              description: 'Agendamento de consultas para clínicas pequenas, com lembrete por e-mail',
              repositoryUrl: 'https://github.com/rosimary/agenda-consultas',
              demoUrl: 'https://agenda-consultas.onrender.com',
              profileId: 1,
              technologyIds: [1, 2, 4],
            }),
          }),
        },
        responses: {
          201: {
            description: 'Projeto criado',
            content: jsonContent(ref('Projeto'), {
              criado: example('Projeto recém-criado', {
                ...projectExample,
                upvotes: 0,
                averageRating: null,
                totalFeedbacks: 0,
                feedbacks: [],
              }),
            }),
          },
          400: errorResponse('Dados inválidos, JSON malformado ou tecnologia inexistente', {
            validacao: example(
              'Título vazio e URL inválida',
              errorExample(400, 'Requisição inválida', 'Dados inválidos', '/api/projects', [
                { field: 'title', message: 'title não pode ser vazio' },
                { field: 'repositoryUrl', message: 'repositoryUrl deve ser uma URL válida (ex.: https://github.com/usuario)' },
              ])
            ),
            tecnologia: example(
              'Tecnologia inexistente',
              errorExample(400, 'Requisição inválida', 'Tecnologia(s) não encontrada(s)', '/api/projects', [
                { field: 'technologyIds', message: 'ids inexistentes: 99' },
              ])
            ),
            json: malformedJson('/api/projects'),
          }),
          404: errorResponse('Perfil dono do projeto não existe', {
            perfil: example('Perfil inexistente', errorExample(404, 'Não encontrado', 'Perfil 999 não encontrado', '/api/projects')),
          }),
          500: internalError,
        },
      },
    },
    '/api/projects/{id}/upvote': {
      put: {
        tags: ['Projetos'],
        summary: 'Curte um projeto (soma 1 em upvotes)',
        description:
          'O incremento é feito direto no banco (`SET upvotes = upvotes + 1`), então curtidas simultâneas não se perdem. Não precisa de corpo.',
        parameters: [idParam],
        responses: {
          200: { description: 'Projeto atualizado', content: jsonContent(ref('Projeto'), { curtido: example('Projeto com a nova contagem', projectExample) }) },
          400: errorResponse('Id inválido', { id: badIdExample('/api/projects/abc/upvote') }),
          404: errorResponse('Projeto não existe', {
            projeto: example('Projeto inexistente', errorExample(404, 'Não encontrado', 'Projeto 999 não encontrado', '/api/projects/999/upvote')),
          }),
          500: internalError,
        },
      },
    },
    '/api/projects/{id}/feedbacks': {
      post: {
        tags: ['Feedbacks'],
        summary: 'Avalia um projeto e recalcula a nota média',
        description:
          'Grava o feedback e atualiza `averageRating` do projeto na **mesma transação**. A média é arredondada para 2 casas decimais. Ex.: notas 5 e 3 → média 4.',
        parameters: [idParam],
        requestBody: {
          required: true,
          content: jsonContent(ref('NovoFeedback'), {
            nota5: example('Nota 5', {
              authorName: 'Elda de Sousa Carvalho',
              comment: 'Interface simples e o agendamento funciona muito bem.',
              rating: 5,
            }),
            nota3: example('Nota 3', {
              authorName: 'Visitante',
              comment: 'Faltou a opção de cancelar a consulta pelo celular.',
              rating: 3,
            }),
          }),
        },
        responses: {
          201: {
            description: 'Feedback registrado com a nova média do projeto',
            content: jsonContent(ref('FeedbackCriado'), {
              segundo: example('Depois das notas 5 e 3', {
                feedback: projectExample.feedbacks[1],
                project: { id: 1, averageRating: 4, totalFeedbacks: 2 },
              }),
            }),
          },
          400: errorResponse('Dados inválidos, JSON malformado ou id inválido', {
            validacao: example(
              'Nota fora do intervalo e comentário vazio',
              errorExample(400, 'Requisição inválida', 'Dados inválidos', '/api/projects/1/feedbacks', [
                { field: 'comment', message: 'comment não pode ser vazio' },
                { field: 'rating', message: 'rating deve ser no máximo 5' },
              ])
            ),
            json: malformedJson('/api/projects/1/feedbacks'),
            id: badIdExample('/api/projects/abc/feedbacks'),
          }),
          404: errorResponse('Projeto não existe', {
            projeto: example('Projeto inexistente', errorExample(404, 'Não encontrado', 'Projeto 999 não encontrado', '/api/projects/999/feedbacks')),
          }),
          500: internalError,
        },
      },
    },
    '/api/profiles': {
      post: {
        tags: ['Perfis'],
        summary: 'Cria um perfil de desenvolvedor',
        requestBody: {
          required: true,
          content: jsonContent(ref('NovoPerfil'), {
            mara: example('Perfil da Mara', {
              name: 'Rosimary de Sousa Carvalho',
              email: 'rosimary@devshowcase.com',
              bio: 'Desenvolvedora back-end, gosta de APIs e bancos de dados',
              githubUrl: 'https://github.com/rosimary',
            }),
          }),
        },
        responses: {
          201: {
            description: 'Perfil criado (o cabeçalho Location aponta para o novo perfil)',
            content: jsonContent(ref('Perfil')),
          },
          400: errorResponse('Dados inválidos ou JSON malformado', {
            validacao: example(
              'Nome vazio e e-mail inválido',
              errorExample(400, 'Requisição inválida', 'Dados inválidos', '/api/profiles', [
                { field: 'name', message: 'name não pode ser vazio' },
                { field: 'email', message: 'email deve ser um e-mail válido' },
              ])
            ),
            json: malformedJson('/api/profiles'),
          }),
          409: errorResponse('E-mail já cadastrado', {
            email: example('E-mail repetido', errorExample(409, 'Conflito', 'Já existe um perfil com esse e-mail', '/api/profiles')),
          }),
          500: internalError,
        },
      },
    },
    '/api/profiles/{id}': {
      get: {
        tags: ['Perfis'],
        summary: 'Busca um perfil com a lista dos seus projetos',
        parameters: [idParam],
        responses: {
          200: { description: 'Perfil encontrado', content: jsonContent(ref('Perfil')) },
          400: errorResponse('Id inválido', { id: badIdExample('/api/profiles/abc') }),
          404: errorResponse('Perfil não existe', {
            perfil: example('Perfil inexistente', errorExample(404, 'Não encontrado', 'Perfil 999 não encontrado', '/api/profiles/999')),
          }),
          500: internalError,
        },
      },
    },
    '/api/technologies': {
      get: {
        tags: ['Tecnologias'],
        summary: 'Lista as tecnologias em ordem alfabética',
        responses: {
          200: {
            description: 'Lista de tecnologias',
            content: jsonContent({ type: 'array', items: ref('Tecnologia') }, {
              lista: example('Tecnologias cadastradas', [
                { id: 2, name: 'Express', category: 'Framework' },
                { id: 1, name: 'Node.js', category: 'Backend' },
                { id: 4, name: 'PostgreSQL', category: 'Banco de dados' },
                { id: 3, name: 'React', category: 'Frontend' },
              ]),
            }),
          },
          500: internalError,
        },
      },
      post: {
        tags: ['Tecnologias'],
        summary: 'Cadastra uma tecnologia',
        description: 'O nome é único sem diferenciar maiúsculas/minúsculas (`node.js` conflita com `Node.js`).',
        requestBody: {
          required: true,
          content: jsonContent(ref('NovaTecnologia'), {
            node: example('Node.js', { name: 'Node.js', category: 'Backend' }),
          }),
        },
        responses: {
          201: { description: 'Tecnologia criada', content: jsonContent(ref('Tecnologia')) },
          400: errorResponse('Dados inválidos ou JSON malformado', {
            validacao: example(
              'Nome vazio',
              errorExample(400, 'Requisição inválida', 'Dados inválidos', '/api/technologies', [
                { field: 'name', message: 'name não pode ser vazio' },
              ])
            ),
            json: malformedJson('/api/technologies'),
          }),
          409: errorResponse('Nome já cadastrado', {
            nome: example(
              'Tecnologia repetida',
              errorExample(409, 'Conflito', 'Já existe uma tecnologia com esse nome', '/api/technologies')
            ),
          }),
          500: internalError,
        },
      },
    },
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Verifica se a API está no ar',
        responses: {
          200: {
            description: 'API funcionando',
            content: jsonContent(
              { type: 'object', properties: { status: { type: 'string', example: 'ok' } } },
              { ok: example('No ar', { status: 'ok' }) }
            ),
          },
        },
      },
    },
  },
  components: {
    schemas: {
      NovoPerfil: {
        type: 'object',
        required: ['name', 'email'],
        additionalProperties: false,
        properties: {
          name: { type: 'string', maxLength: 120, example: 'Elda de Sousa Carvalho' },
          email: { type: 'string', format: 'email', example: 'elda@devshowcase.com' },
          bio: { type: 'string', maxLength: 500, nullable: true, example: 'Desenvolvedora front-end' },
          githubUrl: { type: 'string', format: 'uri', nullable: true, example: 'https://github.com/elda' },
        },
      },
      Perfil: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 2 },
          name: { type: 'string', example: 'Elda de Sousa Carvalho' },
          email: { type: 'string', example: 'elda@devshowcase.com' },
          bio: { type: 'string', nullable: true, example: 'Desenvolvedora front-end' },
          githubUrl: { type: 'string', nullable: true, example: 'https://github.com/elda' },
          createdAt: { type: 'string', format: 'date-time' },
          projects: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 2 },
                title: { type: 'string', example: 'Controle de Estoque' },
                repositoryUrl: { type: 'string', example: 'https://github.com/elda/controle-estoque' },
              },
            },
          },
        },
      },
      NovaTecnologia: {
        type: 'object',
        required: ['name'],
        additionalProperties: false,
        properties: {
          name: { type: 'string', maxLength: 60, example: 'React' },
          category: { type: 'string', maxLength: 60, nullable: true, example: 'Frontend' },
        },
      },
      Tecnologia: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 3 },
          name: { type: 'string', example: 'React' },
          category: { type: 'string', nullable: true, example: 'Frontend' },
        },
      },
      NovoProjeto: {
        type: 'object',
        required: ['title', 'repositoryUrl', 'profileId'],
        additionalProperties: false,
        properties: {
          title: { type: 'string', maxLength: 150, example: 'Controle de Estoque' },
          description: { type: 'string', maxLength: 1000, nullable: true, example: 'Entrada e saída de produtos com alerta de estoque baixo' },
          repositoryUrl: { type: 'string', format: 'uri', example: 'https://github.com/elda/controle-estoque' },
          demoUrl: { type: 'string', format: 'uri', nullable: true, example: 'https://controle-estoque.onrender.com' },
          profileId: { type: 'integer', minimum: 1, example: 2 },
          technologyIds: { type: 'array', items: { type: 'integer', minimum: 1 }, default: [], example: [1, 3, 4] },
        },
      },
      Projeto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          repositoryUrl: { type: 'string' },
          demoUrl: { type: 'string', nullable: true },
          upvotes: { type: 'integer', description: 'Quantidade de curtidas', example: 2 },
          averageRating: { type: 'number', nullable: true, description: 'Nota média (null até o primeiro feedback)', example: 4 },
          totalFeedbacks: { type: 'integer', example: 2 },
          createdAt: { type: 'string', format: 'date-time' },
          owner: {
            type: 'object',
            properties: { id: { type: 'integer', example: 1 }, name: { type: 'string', example: 'Rosimary de Sousa Carvalho' } },
          },
          technologies: { type: 'array', items: ref('Tecnologia') },
          feedbacks: { type: 'array', items: ref('Feedback') },
        },
      },
      Paginacao: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalItems: { type: 'integer', example: 3 },
          totalPages: { type: 'integer', example: 1 },
        },
      },
      PaginaDeProjetos: {
        type: 'object',
        properties: {
          data: { type: 'array', items: ref('Projeto') },
          pagination: ref('Paginacao'),
        },
      },
      NovoFeedback: {
        type: 'object',
        required: ['authorName', 'comment', 'rating'],
        additionalProperties: false,
        properties: {
          authorName: { type: 'string', maxLength: 120, example: 'Elda de Sousa Carvalho' },
          comment: { type: 'string', maxLength: 1000, example: 'Interface simples e o agendamento funciona muito bem.' },
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
        },
      },
      Feedback: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          projectId: { type: 'integer', example: 1 },
          authorName: { type: 'string', example: 'Elda de Sousa Carvalho' },
          comment: { type: 'string', example: 'Interface simples e o agendamento funciona muito bem.' },
          rating: { type: 'integer', example: 5 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      FeedbackCriado: {
        type: 'object',
        properties: {
          feedback: ref('Feedback'),
          project: {
            type: 'object',
            description: 'Situação do projeto depois deste feedback',
            properties: {
              id: { type: 'integer', example: 1 },
              averageRating: { type: 'number', example: 4 },
              totalFeedbacks: { type: 'integer', example: 2 },
            },
          },
        },
      },
      Erro: {
        type: 'object',
        required: ['status', 'error', 'path', 'timestamp'],
        properties: {
          status: { type: 'integer', example: 404 },
          error: { type: 'string', description: 'Tipo do erro', example: 'Não encontrado' },
          message: { type: 'string', description: 'Explicação do que aconteceu', example: 'Projeto 999 não encontrado' },
          details: {
            type: 'array',
            description: 'Campos com problema (só em erros de validação)',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'rating' },
                message: { type: 'string', example: 'rating deve ser no máximo 5' },
              },
            },
          },
          path: { type: 'string', example: '/api/projects/999/upvote' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};
