# Dossiê Técnico Consolidado: Execução da Sprint 4 incomplet (Deploy, Resolução de Infraestrutura e Próximos Passos)

Este documento registra o diagnóstico, as decisões de engenharia, os erros identificados e o estado de prontidão para homologação do projeto **Nail Booking System**.

---

## 1. Contexto e Objetivos da Sprint 4

O objetivo central da Sprint 4 é a validação de concorrência, o empacotamento em produção na Vercel e a homologação funcional ponta a ponta dos fluxos do sistema.

* **Sub-tarefas da Sprint 4**:


* **S4.1 (Concorrência)**: Script automatizado (`scripts/concurrency-test.ts`) para forçar race condition e comprovar a contenção pelo código de erro PostgreSQL `23P01` (constraint de exclusão GiST `prevent_double_booking`).


* **S4.2 (Deploy Vercel)**: Padronização de estrutura de diretórios, injeção de variáveis de ambiente, configuração de reescrita SPA (`vercel.json`) e build estático.


* **S4.3 (Homologação Final)**: Testes de fumaça em produção (carregamento de serviços, persistência de autenticação, RBAC, feedback com Sonner e bloqueio de horários).





---

## 2. Histórico de Incidentes e Resoluções no Pipeline de CI/CD (Vercel)

Durante o processo de deploy na Vercel, foram identificados e solucionados três problemas sucessivos de configuração de ambiente e build:

### Incidente 1: `Bun could not find a package.json file to install from`

* **Causa Raiz**: O projeto original exportado do UI Bakery mantinha os arquivos aninhados em subpastas (`Nail Booking System/src/package.json`), enquanto a Vercel executava os comandos de ciclo de vida (`bun install`) na raiz padrão do repositório (`./`).


* **Raciocínio & Decisão**:
* Rejeitou-se apontar a raiz da Vercel para a subpasta `src/`, pois isso quebraria os escopos do Tailwind CSS (`content`), a resolução do `index.html` pelo Vite e as importações relativas de scripts.


* Foi realizada a reestruturação no repositório: o arquivo `package.json` foi elevado para `Nail Booking System/package.json` e o parâmetro **Root Directory** no painel da Vercel foi configurado e salvo como `Nail Booking System`.





### Incidente 2: Erro de Sintaxe JSON no Manifesto de Pacotes

* **Causa Raiz**: Ausência de vírgula delimitadora após o objeto `"scripts"` no `package.json`, inviabilizando o parse pelo runtime Bun.
* **Resolução**: Correção da sintaxe e sanitização da lista de dependências.



### Incidente 3: `vite: command not found (exit code 127)`

* **Causa Raiz**: O script de build definia `"build": "vite build"`, porém os pacotes `vite`, `@vitejs/plugin-react` e o plugin de animação do Tailwind (`tailwindcss-animate`) não constavam nas dependências do manifesto herdado do UI Bakery.


* **Resolução**: Inclusão explícita do `vite`, plugins React/PostCSS e dependências de runtime completas no manifesto.



---

## 3. Estado Estrutural Atual do Repositório

A estrutura de arquivos do projeto está alinhada às convenções padrão do ecossistema React/Vite:

```plaintext
Nail Booking System/
├── package.json               # Configurado com vite, react 19, tailwindcss, radix-ui e supabase-js
├── vercel.json                # Regra de rewrite global para SPA (/(.*) -> /index.html)
├── datasources.yml            # Arquivo de metadados legados
├── version.yml                # Metadados de versão
├── scripts/
│   └── concurrency-test.ts    # Script de validação da constraint GiST (S4.1)
└── src/
    ├── actions/               # Actions desacopladas com RBAC/IDOR (createBooking, loadMyBookings, etc.)
    ├── app/                   # BookingFlow.tsx e routes.tsx
    ├── components/            # ProtectedRoute.tsx e FeedbackToaster.tsx
    ├── context/               # AuthContext.tsx com persistência de sessão
    ├── lib/                   # supabase.ts, validationSchemas.ts (Zod) e notifications.ts
    ├── services/              # bookingDataService.ts com captura do erro 23P01
    └── types/                 # database.types.ts

```

(Referências de arquitetura implementadas:)

---

## 4. Manifesto de Configuração Homologado (`package.json`)

Conteúdo definitivo configurado em `Nail Booking System/package.json`:

```json
{
  "name": "nail-booking-system",
  "packageManager": "bun",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-avatar": "^1.2.6",
    "@radix-ui/react-dialog": "^1.1.23",
    "@radix-ui/react-icons": "1.3.2",
    "@radix-ui/react-label": "^2.1.15",
    "@radix-ui/react-select": "^2.3.7",
    "@radix-ui/react-separator": "^1.1.15",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.3.7",
    "@radix-ui/react-tabs": "^1.1.21",
    "@supabase/supabase-js": "^2.48.0",
    "canvas-confetti": "1.9.3",
    "class-variance-authority": "0.7.0",
    "clsx": "2.1.1",
    "date-fns": "^4.4.0",
    "lucide-react": "0.446.0",
    "next-themes": "^0.4.6",
    "react": "19.2.1",
    "react-day-picker": "^10.0.1",
    "react-dom": "19.2.1",
    "react-hook-form": "^7.54.0",
    "react-icons": "~5.5.0",
    "react-router-dom": "^6.28.0",
    "sonner": "^2.0.8",
    "tailwind-merge": "2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@eslint/js": "9.11.1",
    "@types/node": "22.7.3",
    "@types/react": "19.2.1",
    "@types/react-dom": "19.2.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "10.4.20",
    "eslint": "9.11.1",
    "eslint-plugin-react-hooks": "5.1.0-rc.0",
    "eslint-plugin-react-refresh": "0.4.12",
    "globals": "15.9.0",
    "postcss": "8.4.47",
    "tailwindcss": "3.4.13",
    "typescript": "5.5.3",
    "typescript-eslint": "8.7.0",
    "vite": "^6.0.0"
  }
}

```

(Dependências alinhadas com as fontes do projeto:)

---

## 5. Próximo Passo: Conclusão da S4.2 e Início da S4.3

1. **Finalizar o Build (S4.2)**: Disparar o `Redeploy` no painel da Vercel com as dependências completas para geração da URL de produção.


2. **Executar a Homologação Pós-Deploy (S4.3)**:


* Validação do roteamento direto de URLs (`/admin`, `/client`) via rewrite do `vercel.json`.


* Teste de consulta e renderização da lista de serviços ativos.


* Tentativa de agendamento em horário simultâneo para validação visual do toast Sonner interceptando o código `23P01`.


* Validação de persistência de sessão e proteção de rotas RBAC.
