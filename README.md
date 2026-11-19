# Project Readme

## Perfis de acesso e VIEWER (Visualizador)

O perfil **VIEWER**, identificado como `viewer` no código e na API e como **Visualizador** no cadastro de usuários, permite acompanhar o painel e consultar visitas sem alterar os registros.

### O que o VIEWER vê

As mesmas opções são exibidas no menu principal e no menu móvel:

| Aba | Caminho | Conteúdo e permissões |
| :--- | :--- | :--- |
| Painel | `/Admin` | Indicadores de visitas, visitantes únicos, visitante mais frequente, ranking de visitantes e gráficos por dia da semana e horário. Somente consulta. |
| Visitas | `/Admin/Visits` | Lista com visitante, assunto, responsável pelo registro e data/hora da visita. Permite consultar, filtrar por data e navegar pelas páginas dos resultados. Não permite criar, editar ou excluir visitas. |
| Configurações | `/Admin/Configurations` | Exibe o usuário da conta. Os campos de senha e o botão **Alterar senha** ficam desabilitados para VIEWER. |

O usuário também pode alternar o tema e sair da conta. As abas **Visitantes**, **Usuários** e **Atendimentos** não aparecem para VIEWER. Tentativas de acessar essas páginas diretamente pela URL são redirecionadas para o Painel.

A consulta de visitas mostra informações do visitante associadas aos registros, mas não concede acesso ao cadastro de visitantes.

### Comparação das abas por perfil

Esta tabela descreve a visibilidade no menu; a autorização das operações também é verificada pela API.

| Aba | viewer | user | recepcionist | admin | superadmin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Painel | Sim | Sim | Sim | Sim | Sim |
| Visitas | Sim | Sim | Sim | Sim | Sim |
| Configurações | Sim | Sim | Sim | Sim | Sim |
| Visitantes | Não | Sim | Sim | Sim | Sim |
| Usuários | Não | Não | Não | Sim | Sim |
| Atendimentos | Não | Não | Sim | Sim | Sim |

A inclusão de Visitas para VIEWER preserva as permissões dos demais perfis.

### Autorização na API

Além da visibilidade do menu e da proteção das páginas, o middleware `checkPermissions` autoriza VIEWER somente para `GET` nos recursos `dashboard` e `visits`:

| Método e endpoint | Acesso do VIEWER |
| :--- | :--- |
| `GET /api/v1/visits/dashboard` | Consultar os indicadores do painel. |
| `GET /api/v1/visits/` | Consultar a lista de visitas. |
| `GET /api/v1/visits/visitor/{uuid}` | Consultar o histórico de visitas de um visitante. |
| `POST /api/v1/visits/` | Bloqueado: não pode registrar visitas. |

Os métodos `POST`, `PUT`, `PATCH` e `DELETE` não são autorizados para VIEWER nos recursos `dashboard` e `visits`. A matriz de permissões não cria endpoints: métodos sem rota implementada continuam indisponíveis.

VIEWER também não tem permissão para os recursos `users`, `visitors`, `occurrences`, `subjects` e `attendants`, nem mesmo para leitura. Uma operação rejeitada pelo middleware retorna **403**, com código `FORBIDDEN`.

Autenticação, ativação e gerenciamento da sessão seguem seus próprios fluxos. A alteração da senha pelo endpoint `POST /api/v1/login/alterpwd` é bloqueada para VIEWER também no serviço de usuários, além do bloqueio na tela de Configurações.

### Como atribuir o perfil

Na aba **Usuários**, um administrador ou superadministrador pode selecionar **Visualizador** no campo de perfil ao cadastrar ou editar uma conta, respeitando as regras existentes de gerenciamento de usuários. Na API, o valor deve ser enviado em minúsculas: `"role": "viewer"`.

O banco de dados deve ter a migration `20261116100000-add-viewer-role.ts` aplicada para aceitar o valor `viewer` na coluna `users.role`. Em instalações ainda não atualizadas, utilize o fluxo de migrations do projeto a partir de `api-recepcao`:

```sh
npm run migrate
```

Esse comando aplica as migrations pendentes do projeto. A reversão da migration do VIEWER exige reatribuir previamente as contas que usam esse perfil.

### Testes de acesso

Os testes de regressão cobrem a exibição das abas, o acesso direto às páginas permitidas, o bloqueio das páginas restritas e as permissões de leitura e escrita na API. As descrições desses testes estão em português.

Execute a partir de `web-admin`:

```sh
npm test -- src/pages/nav/Nav.test.jsx src/middleware/ProtectRouter.test.jsx
```

Execute a partir de `api-recepcao`:

```sh
node --import tsx --test src/core/middleware/checkPermissions.test.ts
```

Arquivos de referência: `web-admin/src/pages/nav/Nav.jsx`, `web-admin/src/middleware/ProtectRouter.jsx`, `web-admin/src/pages/admin/Visits/Visits.jsx`, `web-admin/src/pages/admin/config/Config.jsx`, `api-recepcao/src/core/middleware/checkPermissions.ts` e `api-recepcao/src/application/service/UserService.ts`.

## Web-App

### Description

Is the part responsible to generate the front end

```
Source: /web-admin
```

### Instalation

1. Acess the project folder:

```
cd ./web-admin
```

2. Install the dependencies:

   npm i

3. Alter the proxi to target your API

```
Source: /web-admin/vite.config.js ->
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  [...]
  server: {
    host: "0.0.0.0", //Acesso externo
    port: 5173,
    proxy: {
      "/api/v1": {
        target: "Your API here",
        changeOrigin: false,
        secure: false,
      }
    }
  }
  [...]
})
```

4. Execute the project:

```
#### Inside web-admin project's Folder
  npm run dev
```

5. To generate Build, execute:

```
###inside web-admin folder
  npm run build
```

### Dependencies

```
"@fontsource/roboto": "^5.2.6",
"@headlessui/react": "^2.2.4",
"@heroicons/react": "^2.2.0",
"@tailwindcss/vite": "^4.1.11",
"axios": "^1.10.0",
"moment": "^2.30.1",
"primeicons": "^7.0.0",
"primereact": "^10.9.6",
"react": "^19.1.0",
"react-dom": "^19.1.0",
"react-hook-form": "^7.59.0",
"react-router-dom": "^7.6.3",
"react-webcam": "^7.2.0",
"tailwindcss": "^4.1.11"
```

### Project's structure

```
...
├── src/
│   ├── API/ -> API connection with Axios
│   ├── assets/ -> Project stilization
│   ├── components/ -> Components t ouse inside project
│   ├── context/ -> Application's context
│   └── middleware/ -> Application's middleware
|   └── pages/ -> Application Pages
|   └── service/ -> Services responsible to consume API

```

# API

# Documentação da API Recepção

**Versão: 1.0.0**

Este documento fornece uma descrição detalhada da API Recepção, utilizada para gerenciar usuários, visitantes e visitas. A documentação foi gerada com base em uma especificação OpenAPI, utilizando Fastify.

## URL Base

Todas as URLs mencionadas nesta documentação são relativas à seguinte URL base:

```
http://192.168.16.13:3333
```

## Autenticação

A maioria das rotas protegidas requer um token de autenticação JWT. Após realizar o login com sucesso na rota `/api/v1/login/`, um token será retornado. Para autenticar as requisições subsequentes, inclua este token no cabeçalho `Authorization` como um "Bearer token".

**Exemplo de Header:**

```
Authorization: Bearer seu_token_jwt_aqui
```

---

## Endpoints da API

### Índice

1.  [Login]
2.  [User (Usuário)]
3.  [Visitor (Visitante)]
4.  [Visits (Visitas)]

---

### Login

Endpoints relacionados à autenticação e gerenciamento de sessão.

#### `POST /api/v1/login/`

Realiza o login na aplicação utilizando `username` e `password`.

**Corpo da Requisição (`application/json`)**
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `username` | string | Sim | Nome de usuário para login. |
| `password` | string | Sim | Senha do usuário. |

**Exemplo de Requisição:**

```json
{
  "username": "seu.usuario",
  "password": "sua_senha"
}
```

**Respostas:**

- **`200 OK`** - Login bem-sucedido.
  ```json
  {
    "message": "Login sucess",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Nome do Usuario",
      "role": "Admin",
      "firstLogin": false
    },
    "ip": "192.168.16.1"
  }
  ```

#### `POST /api/v1/login/verify`

Verifica a integridade e validade de um token JWT.

**Corpo da Requisição (`application/json`)**
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `token` | string | Sim | O token JWT a ser verificado. |

**Exemplo de Requisição:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respostas:**

- **`200 OK`** - Token válido.
- **`401 Unauthorized`** - Token inválido.
- **`500 Internal Server Error`** - Erro interno.

#### `POST /api/v1/login/alterpwd`

Permite que um usuário autenticado altere sua própria senha.

**Corpo da Requisição (`application/json`)**
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `old_password` | string | Sim | Senha atual do usuário. |
| `new_password` | string | Sim | Nova senha desejada. |

**Exemplo de Requisição:**

```json
{
  "old_password": "senha_antiga_123",
  "new_password": "nova_senha_forte_456"
}
```

**Respostas:**

- **`200 OK`** - Senha alterada com sucesso.
- **`401 Unauthorized`** - Credenciais inválidas (senha antiga incorreta).
- **`500 Internal Server Error`** - Erro interno.

---

### User (Usuário)

Endpoints para o gerenciamento de usuários do sistema.

#### `POST /api/v1/user/`

Cria um novo usuário no sistema.

**Corpo da Requisição (`application/json`)**
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `first_name` | string | Sim | Primeiro nome do usuário. |
| `last_name` | string | Sim | Sobrenome do usuário. |
| `role` | string | Sim | Perfil de acesso: `viewer`, `user`, `recepcionist`, `admin` ou `superadmin` (valores em minúsculas). |
| `email` | string | Sim | E-mail do usuário (deve ser único). |
| `cpf` | string | Sim | CPF do usuário (deve ser único). |
| `password` | string | Não | Senha inicial. Se não for fornecida, uma padrão pode ser gerada, só leva em conta a criação de uma senha sem ser padrão caso em ambiente de desenvolvimento para configurar a aplicação. |

**Respostas:**

- **`201 Created`** - Usuário criado com sucesso.
- **`400 Bad Request`** - Dados de entrada inválidos.
- **`403 Forbidden`** - O usuário (email ou CPF) já existe.

#### `GET /api/v1/user/`

Retorna uma lista de todos os usuários cadastrados.

**Respostas:**

- **`200 OK`** - Lista de usuários retornada com sucesso.
  ```json
  {
    "user": [
      {
        "uuid": "123e4567-e89b-12d3-a456-426614174000",
        "first_name": "João",
        "last_name": "Silva",
        "role": "Admin",
        "email": "joao.silva@example.com",
        "username": "joao.silva"
      }
    ],
    "count": 1,
    "message": "List of users"
  }
  ```

#### `PUT /api/v1/user/{uuid}`

Atualiza os dados de um usuário existente.

**Parâmetros de URL**
| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `uuid` | string | UUID do usuário a ser atualizado. |

**Corpo da Requisição (`application/json`)**
_Similar ao `POST`, mas sem os campos `cpf` e `password`._

**Respostas:**

- **`200 OK`** - Usuário atualizado com sucesso.
- **`404 Not Found`** - Usuário não encontrado.

#### `DELETE /api/v1/user/{uuid}`

Exclui um usuário do sistema.

**Parâmetros de URL**
| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `uuid` | string | UUID do usuário a ser excluído. |

**Respostas:**

- **`200 OK`** - Usuário excluído com sucesso.
- **`404 Not Found`** - Usuário não encontrado.

---

### Visitor (Visitante)

Endpoints para o gerenciamento de visitantes.

#### `POST /api/v1/visitors/`

Cadastra um novo visitante.

**Corpo da Requisição (`application/json`)**
| Campo | Tipo | Obrigatório |
| :--- | :--- | :--- |
| `name` | string | Sim |
| `cpf` | string | Sim |
| `photo` | string | Não |
| `email` | string | Não |
| `phone` | string | Não |
| `address` | string | Não |
| `city` | string | Não |
| `state` | string | Não |
| `zipCode` | string | Não |

**Respostas:**

- **`201 Created`** - Visitante criado com sucesso.

#### `GET /api/v1/visitors/`

Retorna uma lista de todos os visitantes.

**Respostas:**

- **`200 OK`** - Lista retornada com sucesso.

#### `PUT /api/v1/visitors/{uuid}`

Atualiza os dados de um visitante existente.

**Parâmetros de URL**
| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `uuid` | string | UUID do visitante a ser atualizado. |

**Respostas:**

- **`200 OK`** - Visitante atualizado com sucesso.

#### `DELETE /api/v1/visitors/{uuid}`

Exclui um visitante.

**Parâmetros de URL**
| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `uuid` | string | UUID do visitante a ser excluído. |

**Respostas:**

- **`200 OK`** - Visitante excluído com sucesso.

---

### Visits (Visitas)

Endpoints para o gerenciamento de registros de visitas.

#### `POST /api/v1/visits/`

Cria um novo registro de visita.

**Corpo da Requisição (`application/json`)**
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `visitor_uuid` | string | Sim | UUID do visitante. |
| `subject` | string | Sim | Assunto/motivo da visita. |
| `date` | string (date-time) | Sim | Data e hora da visita. |

**Exemplo de Requisição:**

```json
{
  "visitor_uuid": "123e4567-e89b-12d3-a456-426614174000",
  "subject": "Reunião com o departamento financeiro",
  "date": "2025-08-20T15:30:00Z"
}
```

**Respostas:**

- **`200 OK`** - Visita registrada com sucesso.

#### `GET /api/v1/visits/`

Retorna uma lista de todos os registros de visita.

**Respostas:**

- **`200 OK`** - Lista de visitas retornada com sucesso.

#### `GET /api/v1/visits/visitor/{uuid}`

Retorna todos os registros de visita de um visitante específico.

**Parâmetros de URL**
| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `uuid` | string | UUID do visitante. |

**Respostas:**

- **`200 OK`** - Histórico de visitas do visitante.
  ```json
  {
    "message": "Success",
    "visits": [
      {
        "subject": "Reunião com assessor",
        "date": "2023-10-01T12:00:00Z"
      }
    ]
  }
  ```
