# aprende-ai v2.1

Projeto próprio do **aprende.AI**, separado do **r-agent2**, mas preparado para integração futura seguindo o mesmo padrão técnico principal:

- **backend** com Node.js + Express + Sequelize
- **frontend** com React + Vite
- **multi-tenant** por `x-tenant-slug`
- autenticação JWT
- registro modular de rotas
- base para integração por eventos
- estrutura pronta para evolução de learning, assessment, ai, knowledge e integration

## Estrutura

```text
api/
  config/
  core/
  db/
    migrations/
    models/
    seeds/
  modules/
    system/
    auth/
    learning/
    assessment/
    competency/
    ai/
    knowledge/
    integration/
frontend/
  src/
    components/
    context/
    pages/
    services/
    styles/
docs/
scripts/
```

## Como subir o backend

### Requisitos
- Node.js 20+
- PostgreSQL 14+

### Configuração
Copie `api/.env.example` para `api/.env`.

### Instalação
```bash
cd api
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

### Seed demo
- tenant slug: `demo`
- usuário: `admin@aprende.ai`
- senha: `admin123`

### Headers usados pela API
- `x-tenant-slug: demo`
- `Authorization: Bearer <token>`

### Endpoints de autenticação
- `POST /api/auth/login`
- `GET /api/auth/me`

Compatibilidade legada:
- `POST /auth/login`
- `GET /auth/me`

## Como subir o frontend

Copie `frontend/.env.example` para `frontend/.env`.

```bash
cd frontend
npm install
npm run dev
```

## Scripts no diretório raiz

```bash
npm run dev:api
npm run dev:frontend
npm run db:migrate
npm run db:seed
npm run build:frontend
```

## O que esta versão entrega

### Backend
- models Sequelize do MVP
- migration inicial
- seed demo
- organização modular parecida com a linha do r-agent2
- middleware de tenant + auth
- endpoints iniciais de trilhas, competências, conhecimento e integração

### Frontend
- login com JWT
- layout com sidebar e topbar
- dashboard inicial
- páginas de trilhas, competências, base de conhecimento e integração
- cliente HTTP com tratamento central para 401
- Vite configurado para desenvolvimento rápido

## Sobre a separação em relação ao r-agent2

O aprende.AI nasce como **projeto próprio** para manter o domínio educacional isolado do domínio operacional. Isso evita acoplamento prematuro e permite integrar depois por API e eventos, sem prender o produto ao núcleo de atendimento desde o início.

Na prática:
- o **r-agent2** continua sendo o núcleo operacional
- o **aprende.AI** evolui como núcleo educacional
- os dois podem compartilhar identidade técnica e integrar experiências depois

## Observações

Este pacote é um **scaffold funcional de referência**, com código-fonte completo do projeto.

Ele **não inclui `node_modules`** nem build final gerado, e eu **não executei `npm install`, migrations ou os servidores** neste ambiente. A base de IA, RAG e integração está pronta em nível estrutural, mas ainda não representa a implementação final de produção.
