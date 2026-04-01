# Arquitetura Frontend - Aprende.AI

Documento de arquitetura e padrões para o desenvolvimento frontend do Aprende.AI.

## 📐 Princípios Arquiteturais

### 1. **Separação de Responsabilidades**

```
Components (UI) -> Pages (Layout) -> Features (Business Logic) -> Services (API)
```

- **Components**: Reutilizáveis, sem lógica de negócio
- **Pages**: Combinam componentes, roteamento
- **Features**: Lógica específica de funcionalidades
- **Services**: Comunicação com API, transformação de dados

### 2. **Escalabilidade Multi-tenant**

```javascript
// Config por tenant
const tenantConfig = {
  'tenant-1': {
    primaryColor: '#ec4899',
    logo: '/assets/tenant-1-logo.png',
    features: ['trilhas', 'mentor', 'simulacao']
  }
};
```

### 3. **Estado Global vs Local**

- **Local (useState)**: Valores que afetam apenas um componente
- **Context**: Temas, autenticação, configurações globais
- **Futuro (Redux/Zustand)**: Estado complexo compartilhado

## 🏗️ Estrutura de Pastas Detalhada

```
src/
├── components/              # Componentes reutilizáveis
│   ├── ui/                  # Primitivos Tailwind (Button, Input, etc)
│   ├── core/                # Header, Sidebar, Navigation
│   ├── cards/               # Cards temáticos
│   ├── journey/             # Componentes de jornada
│   ├── feedback/            # Alert, EmptyState, etc
│   └── examples/            # Exemplos de uso
│
├── features/                # Features do negócio
│   ├── onboarding/          # Fluxo de onboarding
│   ├── trilhas/             # Trilhas de aprendizado
│   ├── mentor/              # Assistente IA
│   ├── simulacao/           # Simulações
│   ├── assessment/          # Avaliações
│   └── analytics/           # Dashboard de analytics
│
├── pages/                   # Páginas (rotas)
│   ├── Trilhas.jsx          # Página de trilhas
│   ├── Dashboard.jsx        # Dashboard
│   └── ...
│
├── layouts/                 # Layouts principais
│   ├── AppLayout.jsx        # Layout com sidebar
│   └── DashboardLayout.jsx  # Grid responsivo
│
├── hooks/                   # Custom hooks
│   ├── useTheme.js
│   ├── useMediaQuery.js
│   └── useDebounce.js
│
├── context/                 # Context API
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── TenantContext.jsx
│
├── services/                # Serviços (API, utils)
│   ├── api.js               # Cliente HTTP
│   ├── auth.js              # Funções de auth
│   └── trilhas.js           # Funções de trilhas
│
├── lib/                     # Utilitários
│   ├── cn.js                # Merge de classes
│   └── validators.js        # Validadores
│
├── styles/                  # Estilos globais
│   ├── globals.css          # Tailwind + custom
│   └── index.css
│
├── App.jsx                  # Root component
└── main.jsx                 # Entry point
```

## 🎯 Padrões de Código

### Componente Funcional com forwardRef

```jsx
import React from 'react';
import { cn } from '@/lib/cn';

const MyComponent = React.forwardRef(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div ref={ref} className={cn('base-styles', className)} {...props}>
        Conteúdo
      </div>
    );
  }
);

MyComponent.displayName = 'MyComponent';

export default MyComponent;
```

### Hook Customizado

```js
import { useState, useEffect } from 'react';

export const useCustom = () => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, []);

  return { state };
};
```

### Service com Tratamento de Erro

```js
export const fetchTrilhas = async (tenantId) => {
  try {
    const response = await fetch(`/api/tenants/${tenantId}/trilhas`);
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error('Error fetching trilhas:', error);
    throw error;
  }
};
```

### Componente Smart com Lógica

```jsx
export const TrilhasPage = () => {
  const { tenantId } = useParams();
  const [trilhas, setTrilhas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrilhas(tenantId)
      .then(setTrilhas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tenantId]);

  if (loading) return <Skeleton />;

  return <TrilhasView trilhas={trilhas} />;
};
```

## 🔄 Data Flow

```
API Response
    ↓
Service (Transform)
    ↓
Context/State
    ↓
Page Component
    ↓
Smart Components (Logic)
    ↓
Dumb Components (UI)
    ↓
User Interaction
```

## 🎨 Convenções de Naming

### Arquivos

- **Components**: PascalCase (MyButton.jsx)
- **Hooks**: camelCase com prefix 'use' (useTheme.js)
- **Utils/Services**: camelCase (apiClient.js)
- **Styles**: kebab-case (modal-body.css)

### Variáveis

```javascript
// Boolean: is, has, can prefix
const isLoading = true;
const hasError = false;
const canSubmit = true;

// Arrays/Collections
const items = [];
const userList = [];

// Functions
const handleClick = () => {};
const fetchData = () => {};
const transformData = (data) => {};
```

## 📦 Import Organization

```javascript
// 1. React imports
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

// 2. External libraries
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';

// 3. Internal components
import Button from '@/components/ui/Button';
import CardBase from '@/components/cards/CardBase';

// 4. Internal hooks
import { useTheme } from '@/hooks';

// 5. Internal utilities
import { cn } from '@/lib/cn';
import { fetchData } from '@/services/api';

// 6. Styles
import './MyComponent.css';
```

## 🧪 Testing Strategy

```javascript
// tests/components/Button.test.jsx
import { render, screen } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## 🚀 Performance Guidelines

### Code Splitting

```javascript
import { lazy, Suspense } from 'react';
import Skeleton from '@/components/ui/Skeleton';

const TrilhasPage = lazy(() => import('./pages/Trilhas'));

<Suspense fallback={<Skeleton />}>
  <TrilhasPage />
</Suspense>
```

### Memoization

```javascript
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* render */}</div>;
}, (prevProps, nextProps) => prevProps.data === nextProps.data);
```

### useCallback para Event Handlers

```javascript
const handleClick = useCallback(() => {
  fetchData();
}, []);
```

## 🔐 Segurança

### Sanitização de Entrada

```javascript
import { sanitize } from 'dompurify';

const SafeHtml = ({ html }) => (
  <div dangerouslySetInnerHTML={{ __html: sanitize(html) }} />
);
```

### Tokens de Autenticação

```javascript
// Nunca armazene em localStorage se possível
// Use cookies HttpOnly
const token = localStorage.getItem('token');
// ❌ Evite
// ✅ Use sessionStorage ou cookies
```

## 🎯 Multi-tenant Considerations

### Context de Tenant

```javascript
const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant deve ser usado dentro de TenantProvider');
  }
  return context;
};

// Uso
const { tenantId, config } = useTenant();
```

### Isolamento de Dados

```javascript
// API endpoints sempre incluem tenantId
const API_BASE = '/api/tenants/:tenantId';

export const fetchTrilhas = (tenantId) => {
  return fetch(`${API_BASE}/trilhas`.replace(':tenantId', tenantId));
};
```

## 📝 Documentação de Componentes

```jsx
/**
 * Button - Componente de botão reutilizável
 * 
 * @component
 * @example
 * <Button variant="primary" size="lg">
 *   Click me
 * </Button>
 * 
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'} props.variant - Estilo do botão
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Tamanho do botão
 * @param {boolean} props.disabled - Se está desabilitado
 * @param {React.ReactNode} props.children - Conteúdo do botão
 */
const Button = ({ variant = 'primary', size = 'md', ...props }) => {
  // ...
};
```

## 🛠️ Dev Workflow

### Setup Local

```bash
npm install
npm run dev
```

### Build

```bash
npm run build  # Production build
npm run preview  # Preview da build
```

### Type Checking (com JSDoc)

```javascript
/**
 * @param {string} tenantId
 * @param {Object} options
 * @param {number} [options.limit=10]
 * @returns {Promise<Array>}
 */
export async function fetchTrilhas(tenantId, options = {}) {
  // ...
}
```

## 🔄 Git Workflow

```bash
# 1. Branch para feature
git checkout -b feat/nova-feature

# 2. Develop
git commit -m "feat: adicionar novo componente"

# 3. Push
git push origin feat/nova-feature

# 4. PR + Review
# 5. Merge
```

## 📊 Checklist de PR

- [ ] Código segue convenções de naming
- [ ] Componentes são reutilizáveis
- [ ] Props têm JSDoc
- [ ] Mobile-first responsivo
- [ ] Dark mode suportado
- [ ] Acessibilidade OK
- [ ] Sem console.error em produção
- [ ] Build passa sem warnings

---

**Versão**: 1.0.0  
**Última atualização**: Março 2026
