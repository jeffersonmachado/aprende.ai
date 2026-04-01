# Aprende.AI - Frontend

Frontend moderno do sistema de aprendizado Aprende.AI, construído com React, Vite, Tailwind CSS e design system escalável.

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- npm 9+

### Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd frontend

# Instalar dependências
npm install

# Iniciar dev server
npm run dev
```

Acesse `http://localhost:5173` no navegador.

## 📦 Scripts Disponíveis

```bash
# Development
npm run dev              # Inicia dev server com hot reload
npm run dev:debug       # Dev com debug mode

# Build
npm run build           # Build para produção
npm run preview         # Preview da build

# Testing
npm run test            # Roda testes com Vitest
npm run test:coverage   # Coverage report

# Linting
npm run lint            # ESLint
npm run format          # Prettier
```

## 🏗️ Arquitetura

- **React 18.3** - UI library
- **Vite 6.4** - Build tool
- **TailwindCSS v4** - Styling
- **Framer Motion** - Animations
- **React Router v6** - Routing
- **React Hook Form** - Forms
- **Zod** - Validation
- **Context API** - State management

## 📁 Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
├── features/            # Funcionalidades do negócio
├── pages/              # Páginas (rotas)
├── layouts/            # Layouts principais
├── hooks/              # Custom hooks
├── context/            # Context API
├── services/           # API e utilitários
├── lib/                # Funções utilitárias
└── styles/             # Estilos globais
```

Veja [ARCHITECTURE.md](./ARCHITECTURE.md) para detalhes completos.

## 🎨 Design System

Design system completo com componentes reutilizáveis em `Tailwind + Framer Motion`.

### Componentes Disponíveis

#### UI Primitivos
- `Button` - Botões em múltiplas variantes
- `Input` - Input com validação
- `Label` - Labels para formulários
- `Badge` - Badges para status
- `Spinner` - Loading spinner
- `Skeleton` - Skeleton loading
- `FormField` - Input com label e erro
- `Modal` - Diálogo modal
- `Tabs` - Abas navegáveis

#### Cards
- `CardBase` - Card reutilizável
- `ProgressCard` - Card com progresso
- `MentorChatCard` - Chat com IA

#### Journey
- `Stepper` - Etapas da jornada
- `JourneyMap` - Mapa visual de etapas

#### Feedback
- `Alert` - Alertas de notificação
- `EmptyState` - Estado vazio

#### Layouts
- `AppLayout` - Layout principal com sidebar
- `DashboardLayout` - Grid responsivo

Veja [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) para documentação completa.

## 🎯 Usando Componentes

### Exemplo: Página de Trilhas

```jsx
import { AppLayout } from '@/layouts';
import { Navigation } from '@/components/core';
import { ProgressCard } from '@/components/cards';
import { DashboardLayout } from '@/layouts';

export const Trilhas = () => {
  return (
    <AppLayout
      sidebarContent={<Navigation items={navItems} />}
      headerContent={<h1>Trilhas</h1>}
    >
      <DashboardLayout columns={3}>
        {trilhas.map((trilha) => (
          <ProgressCard
            key={trilha.id}
            title={trilha.title}
            progress={trilha.progress}
            status={trilha.status}
          />
        ))}
      </DashboardLayout>
    </AppLayout>
  );
};
```

### Exemplo: Formulário

```jsx
import { FormField, Button } from '@/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
});

export const LoginForm = () => {
  const { register, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <>
      <FormField 
        label="Email"
        error={errors.email?.message}
        {...register('email')}
      />
      <FormField
        label="Senha"
        type="password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit">Entrar</Button>
    </>
  );
};
```

## 🌙 Dark Mode

Dark mode é automático com base na preferência do sistema, mas pode ser alterado:

```jsx
import { useTheme } from '@/hooks';

const { isDark, toggleTheme } = useTheme();

// Para acessibilidade: 
// document.documentElement.classList.add('dark')
// document.documentElement.classList.remove('dark')
```

## 📱 Responsividade

Todos os componentes seguem **mobile-first approach**:

```jsx
// Exemplo com Tailwind
className="p-4 md:p-6 lg:p-8"
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 🎬 Animações

Componentes usam **Framer Motion** para animações suaves:

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Conteúdo animado
</motion.div>
```

## 🔐 Autenticação

Contexto de autenticação em `context/AuthContext.jsx`:

```jsx
import { useAuth } from '@/context/useAuth';

const { user, token, logout } = useAuth();
```

## 🌐 API Integration

Exemplo de integração com API:

```jsx
// services/api.js
export const fetchTrilhas = async (tenantId) => {
  const response = await fetch(`/api/tenants/${tenantId}/trilhas`);
  return response.json();
};

// pages/Trilhas.jsx
import { fetchTrilhas } from '@/services/api';

const [trilhas, setTrilhas] = useState([]);

useEffect(() => {
  fetchTrilhas(tenantId).then(setTrilhas);
}, [tenantId]);
```

## 🧪 Testing

```bash
# Rodar testes
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

Exemplo de teste:

```javascript
import { render, screen } from '@testing-library/react';
import Button from '@/components/ui/Button';

test('should render button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 📚 Documentação

- [Design System](./DESIGN_SYSTEM.md) - Guia de componentes
- [Architecture](./ARCHITECTURE.md) - Padrões e estrutura
- [Tailwind Docs](https://tailwindcss.com)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

## 🚀 Deployment

### Build Para Produção

```bash
npm run build
```

Gera pasta `dist/` pronta para deploy.

### Deploy on Vercel

```bash
# Com Vercel CLI
vercel

# Ou conecte o repo no dashboard
```

### Deploy on Docker

```bash
docker build -t aprende-ai-frontend .
docker run -p 3000:80 aprende-ai-frontend
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie arquivo `.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_TENANT_ID=default
VITE_APP_NAME=Aprende.AI
```

Usar no código:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🐛 Debug

### DevTools

- React DevTools Chrome Extension
- Redux DevTools (quando implementado)
- Framer Motion DevTools

### Logs

```javascript
// Console quando necessário
console.log('Debug:', data);

// Em produção, use serviço de logging
logService.error(error);
```

## 🤝 Contribuindo

1. Crie branch: `git checkout -b feat/nova-feature`
2. Commit: `git commit -m "feat: descrição"`
3. Push: `git push origin feat/nova-feature`
4. Abra PR

### Checklist PR

- [ ] Código segue convenções
- [ ] Componentes são reutilizáveis
- [ ] Mobile responsivo
- [ ] Dark mode suportado
- [ ] Sem console errors
- [ ] Documentado

Veja [ARCHITECTURE.md](./ARCHITECTURE.md) para mais detalhes em Git Workflow.

## 📊 Performance

- Bundle Size: ~407KB (gzipped: ~126KB)
- Lighthouse Score: +90
- Core Web Vitals: Otimizado

## 🆘 Troubleshooting

### Tailwind não está compilando

```bash
# Limpar cache
rm -rf node_modules/.vite
npm install --force
npm run dev
```

### Componentes não aparecem

```bash
# Verificar tailwind.config.js content paths
# Deve incluir: "./src/**/*.{js,jsx}"
```

### Dark mode não funciona

```javascript
// Adicionar ao root HTML
document.documentElement.classList.add('dark');
```

## 📝 License

MIT License - veja arquivo LICENSE

## 👥 Suporte

- 📧 Email: dev@aprende.ai
- 💬 Discord: [Link do servidor]
- 📖 Wiki: [Link wiki]

---

**Versão**: 1.0.0  
**Última atualização**: Março 2026  
**Status**: ✅ Em produção
