# Design System - Aprende.AI

Design system moderno e escalável para o projeto Aprende.AI, construído com React, Vite, Tailwind CSS e Framer Motion.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológico](#stack-tecnológico)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Componentes](#componentes)
- [Design Tokens](#design-tokens)
- [Usando o Design System](#usando-o-design-system)
- [Boas Práticas](#boas-práticas)

## 🎨 Visão Geral

O design system foi desenvolvido focando em:

- **Experiência Imersiva**: Componentes com animações suaves e interações fluidas
- **Gamificação**: Elementos visuais que incentivam o engajamento
- **Jornada de Aprendizado**: Componentes específicos para visualizar progresso
- **Escalabilidade Multi-tenant**: Estrutura preparada para diferentes tenants
- **Acessibilidade**: Componentes construídos com Radix UI (via Shadcn patterns)

## 🛠️ Stack Tecnológico

- **React 18.3+** - UI library
- **Vite 6.4+** - Build tool & dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Framer Motion 11+** - Animation library
- **Lucide React** - Icon library
- **React Hook Form** - Form state management
- **Zod** - Schema validation

## 📁 Estrutura de Pastas

```
src/
├── components/
│   ├── ui/                  # Componentes primitivos Tailwind
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Label.jsx
│   │   ├── Badge.jsx
│   │   ├── Spinner.jsx
│   │   ├── Skeleton.jsx
│   │   ├── FormField.jsx
│   │   ├── Modal.jsx
│   │   ├── Tabs.jsx
│   │   └── index.js
│   ├── core/                # Componentes de estrutura
│   │   ├── Navigation.jsx
│   │   └── index.js
│   ├── cards/               # Cards reutilizáveis
│   │   ├── CardBase.jsx
│   │   ├── ProgressCard.jsx
│   │   ├── MentorChatCard.jsx
│   │   └── index.js
│   ├── journey/             # Componentes de jornada
│   │   ├── Stepper.jsx
│   │   ├── JourneyMap.jsx
│   │   └── index.js
│   └── feedback/            # Componentes de feedback
│       ├── Alert.jsx
│       ├── EmptyState.jsx
│       └── index.js
├── layouts/
│   ├── AppLayout.jsx        # Layout principal com sidebar
│   ├── DashboardLayout.jsx  # Grid responsivo
│   └── index.js
├── pages/
│   ├── Trilhas.jsx          # Página exemplo
│   └── ...
├── lib/
│   └── cn.js                # Utilitário de merge de classes
└── styles/
    ├── globals.css          # Estilos globais
    └── index.css
```

## 🧩 Componentes

### UI Components (Primitivos)

#### Button
```jsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Clique aqui
</Button>
```

**Variantes**: `primary` | `secondary` | `ghost` | `destructive` | `outline`
**Tamanhos**: `sm` | `md` | `lg` | `xl`

#### Input
```jsx
import { Input } from '@/components/ui';

<Input 
  placeholder="Digite algo..."
  error={false}
  icon={SearchIcon}
/>
```

#### FormField
```jsx
import { FormField } from '@/components/ui';

<FormField
  label="Email"
  error={errors.email?.message}
  helperText="Use seu email corporativo"
  required
  {...register('email')}
/>
```

#### Modal
```jsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmar ação"
  description="Tem certeza?"
  size="md"
  actions={[
    <Button key="cancel" variant="secondary" onClick={() => setIsOpen(false)}>
      Cancelar
    </Button>,
    <Button key="confirm" variant="primary" onClick={handleConfirm}>
      Confirmar
    </Button>
  ]}
>
  <p>Seu conteúdo aqui</p>
</Modal>
```

#### Tabs
```jsx
import { Tabs } from '@/components/ui';

<Tabs
  tabs={[
    { label: 'Tab 1', content: <p>Conteúdo 1</p> },
    { label: 'Tab 2', content: <p>Conteúdo 2</p> }
  ]}
  defaultTab={0}
  variant="outline"
/>
```

### Card Components

#### CardBase
```jsx
import { CardBase } from '@/components/cards';
import { BookOpen } from 'lucide-react';

<CardBase
  variant="default" // 'default' | 'highlight' | 'progress'
  icon={BookOpen}
  title="Título do Card"
  description="Descrição breve"
  highlight={false}
>
  Conteúdo adicional aqui
</CardBase>
```

#### ProgressCard
```jsx
import { ProgressCard } from '@/components/cards';
import { BookOpen } from 'lucide-react';

<ProgressCard
  title="Fundamentos React"
  description="Aprenda React do zero"
  progress={75}
  status="em-andamento" // 'iniciado' | 'em-andamento' | 'concluido'
  lessons={12}
  completedLessons={9}
  icon={BookOpen}
/>
```

#### MentorChatCard
```jsx
import { MentorChatCard } from '@/components/cards';

<MentorChatCard
  messages={messages}
  isLoading={isLoading}
  onSendMessage={(msg) => handleMessage(msg)}
  placeholder="Faça uma pergunta..."
/>
```

### Journey Components

#### Stepper
```jsx
import { Stepper } from '@/components/journey';

<Stepper
  steps={[
    { title: 'Etapa 1', description: 'Início' },
    { title: 'Etapa 2', description: 'Desenvolvimento' },
    { title: 'Etapa 3', description: 'Conclusão', locked: false }
  ]}
  activeStep={1}
  orientation="horizontal" // 'horizontal' | 'vertical'
/>
```

#### JourneyMap
```jsx
import { JourneyMap } from '@/components/journey';

<JourneyMap
  journey={[
    { title: 'intro', description: 'Introdução', progress: 100 },
    { title: 'basics', description: 'Fundamentos', progress: 75 },
    { title: 'advanced', description: 'Avançado', progress: 0 }
  ]}
  activeIdx={1}
/>
```

### Feedback Components

#### Alert
```jsx
import { Alert } from '@/components/feedback';

<Alert
  variant="success" // 'info' | 'success' | 'warning' | 'destructive'
  title="Sucesso!"
  description="Operação concluída com sucesso"
  onClose={() => setShowAlert(false)}
/>
```

#### EmptyState
```jsx
import { EmptyState } from '@/components/feedback';
import { BookOpen } from 'lucide-react';

<EmptyState
  icon={BookOpen}
  title="Nenhuma trilha encontrada"
  description="Comece adicionando uma nova trilha"
 action={<Button>Criar trilha</Button>}
/>
```

### Layouts

#### AppLayout
```jsx
import { AppLayout } from '@/layouts';
import { Navigation } from '@/components/core';

<AppLayout
  sidebarContent={<Navigation items={navItems} />}
  headerContent={<h1>Dashboard</h1>}
  tenantName="Aprende IA"
  notifications={3}
  onLogout={handleLogout}
>
  Seu conteúdo aqui
</AppLayout>
```

#### DashboardLayout
```jsx
import { DashboardLayout } from '@/layouts';

<DashboardLayout columns={3}>
  <Card />
  <Card />
  <Card />
</DashboardLayout>
```

## 🎨 Design Tokens

### Cores (Paleta Rose/Pink)

**Primária**: Rose/Pink (para CTAs e elementos principais)
```
primary-50 a primary-900
```

**Secundária**: Purple (para complementos)
```
secondary-50 a secondary-900
```

**Accent**: Orange (para destaques)
```
accent-50 a accent-900
```

**Estados**:
- `success`: Green (para sucesso/conclusão)
- `warning`: Yellow (para atenção)
- `destructive`: Red (para erro/perigo)
- `muted`: Gray (para conteúdo secundário)

### Tipografia
- **Display**: Tamanho 4xl (2.25rem)
- **Heading**: Tamanho 2xl-3xl
- **Body**: Tamanho base-lg
- **Caption**: Tamanho xs-sm

### Espaçamento
- Unidade base: 0.25rem (4px)
- Escala: 1, 2, 3, 4, 6, 8, 12, 16, 20, 24...

### Border Radius
- sm: 0.375rem
- md: 0.5rem
- lg: 0.75rem
- xl: 1rem
- 2xl: 1.5rem
- full: 9999px

### Sombras
- xs, sm, md, lg, xl, 2xl
- glow: Para efeitos de foco

## 🚀 Usando o Design System

### Instalação
Tudo já está configurado. Só comece a usar:

```jsx
import { Button, Input } from '@/components/ui';
import { CardBase, ProgressCard } from '@/components/cards';
import { Stepper } from '@/components/journey';
```

### Theming (Dark Mode)
O sistema já suporta dark mode:

```jsx
document.documentElement.classList.add('dark');
document.documentElement.classList.remove('dark');
```

### Responsividade
Todos os componentes são mobile-first:

```jsx
// Exemplo com Tailwind
className="p-4 md:p-6 lg:p-8"
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

## ✅ Boas Práticas

1. **Componentes Dumb e Smart**
   - Componentes UI devem ser dumb (não conhecem business logic)
   - Lógica de negócio fica nas páginas/features

2. **Props Drilling**
   - Use Context para props que vão muitos níveis
   - Exemplo: ThemeContext, AuthContext

3. **Variações de Componentes**
   - Use `variant` prop para diferentes estilos
   - Use `size` prop para diferentes tamanhos

4. **Ref Forwarding**
   - Componentes UI exportam refs via `React.forwardRef`
   - Útil para controlar focus, scroll, etc.

5. **Acessibilidade**
   - Use labels corretos em inputs
   - Role attributes quando necessário
   - Suporte a navegação por teclado

6. **Performance**
   - Use `React.memo` para componentes puros de UI
   - Lazy load componentes grandes
   - Minimize re-renders desnecessários

## 📚 Exemplos de Uso

### Página com Trilhas
Veja [Trilhas.jsx](./src/pages/Trilhas.jsx) para exemplo completo.

### Formulário
```jsx
import { FormField, Button } from '@/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export function LoginForm() {
  const { register, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <>
      <FormField label="Email" error={errors.email?.message} {...register('email')} />
      <FormField label="Senha" type="password" error={errors.password?.message} {...register('password')} />
      <Button type="submit">Entrar</Button>
    </>
  );
}
```

## 🔄 Roadmap

- [ ] Componentes adicionais (Dropdown, Select, Combobox)
- [ ] Integração com API
- [ ] Temas customizáveis por tenant
- [ ] Storybook integration
- [ ] Testes automatizados (Vitest)
- [ ] Accessibility audit
- [ ] Performance monitoring

## 📖 Referências

- [Tailwind CSS Docs](https://tailwindcss.com)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

---

**Versão**: 1.0.0  
**Última atualização**: Março 2026
