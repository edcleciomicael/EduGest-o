# 🎓 EduGestão — Sistema de Gestão Escolar (MVC & Clean Code)

O **EduGestão** é um sistema completo de gestão acadêmica e financeira escolar, reestruturado sob o padrão arquitetural **MVC (Model-View-Controller)** com **Injeção de Dependência (IoC)**, princípios **SOLID** e boas práticas de **Clean Code**.

Este documento serve tanto como **manual de instruções de uso** das funcionalidades do sistema quanto como **guia técnico da arquitetura** implementada.

---

## 📌 Visão Geral do Sistema

O sistema centraliza a rotina administrativa de uma instituição de ensino em uma interface unificada, permitindo controlar desde o ingresso do aluno e geração de matrícula até o acompanhamento de mensalidades, controle de inadimplência e emissão de relatórios financeiros consolidados.

### Credenciais de Acesso Padrão
Ao acessar a tela de login, utilize as credenciais administrativas pré-configuradas (ou clique no botão **"Preencher"** na tela de acesso):

- **Email:** `admin@escola.com`
- **Senha:** `123456`

---

## 📖 Manual de Uso das Funcionalidades (Passo a Passo)

### 1. 📊 Dashboard (Visão Geral)
Logo após o login, o painel principal apresenta o diagnóstico acadêmico e financeiro da escola em tempo real:
- **Indicadores Superiores (KPIs):** Exibe o Total de Alunos, Matrículas Ativas, Total Recebido (com percentual de adimplência), Pendente a Vencer, Em Atraso e Volume Total Gerado.
- **Gráfico dos Últimos 6 Meses:** Compara visualmente os valores recebidos (verde), pendentes (âmbar) e atrasados (vermelho) mês a mês.
- **Últimos Alunos Cadastrados:** Lista os 5 cadastros mais recentes com atalho **"Abrir"** para visualizar a ficha completa do aluno.
- **Mensalidades em Atraso:** Lista as cobranças vencidas e permite quitar qualquer parcela imediatamente clicando em **"Dar Baixa"**.

---

### 2. 👨‍🎓 Gestão de Alunos e Ficha do Aluno
Acesse o menu lateral **Alunos** para gerenciar o corpo discente:

- **Como Cadastrar um Novo Aluno:**
  1. Clique no botão **"+ Novo Aluno"** no canto superior direito.
  2. Preencha os dados pessoais (Nome Completo obrigatório, CPF de 11 dígitos, Data de Nascimento — a idade é calculada automaticamente —, Sexo, Telefone, Email, Endereço e Dados do Responsável).
  3. Informe os dados escolares (**Turma**, **Série**, **Turno** e **Data de Matrícula**).
  4. *(Opcional)* Mantenha marcada a opção **"Gerar 1ª mensalidade automaticamente junto à matrícula"** e informe o valor inicial.
  5. Clique em **"Cadastrar Aluno"**. O sistema criará o aluno e gerará automaticamente o número de matrícula sequencial do ano (ex.: `20260007`).

- **Como Consultar a Ficha Completa do Aluno:**
  1. Na tabela de alunos, clique sobre o nome do aluno ou no botão **"Ficha"**.
  2. A tela exibirá os **Dados Pessoais e Familiares**, o **Vínculo Escolar e Matrícula**, o **Resumo Financeiro Individual** (Pago, Pendente e Atrasado) e a tabela com todas as **Mensalidades Vinculadas ao Aluno**.
  3. Dentro da própria ficha, você pode clicar em **"+ Nova Mensalidade"** (já pré-vinculada ao aluno) ou dar baixa em parcelas abertas clicando em **"Pagar"**.

- **Como Editar ou Excluir um Aluno:**
  - Clique em **"Editar"** para atualizar os dados cadastrais (a turma, série e turno da matrícula ativa são sincronizados automaticamente).
  - Clique no ícone de lixeira para **excluir em cascata** o aluno, sua matrícula e todas as mensalidades vinculadas após confirmação no modal.

---

### 3. 📋 Controle de Matrículas
Acesse o menu lateral **Matrículas** para acompanhar os vínculos acadêmicos:
- **Busca e Filtros:** Pesquise pelo nome do aluno, número da matrícula (ex.: `20260001`) ou turma, ou filtre pelos botões **Todas**, **Ativas**, **Inativas** e **Canceladas**.
- **Edição de Matrícula:** Clique em **"Editar"** na linha desejada para alterar Turma, Série, Turno, Data ou mudar a situação da matrícula (`Ativo`, `Inativo` ou `Cancelado`).

---

### 4. 💰 Gestão de Mensalidades
Acesse o menu lateral **Mensalidades** para gerenciar a tesouraria:
- **Como Lançar Mensalidade (Avulsa ou Carnê Parcelado):**
  1. Clique em **"+ Nova Mensalidade"**.
  2. Selecione o **Aluno Vinculado**, informe a **Descrição**, o **Valor (R$)** e a **Data de Vencimento** da primeira cobrança.
  3. Em **Quantidade de Parcelas Mensais Sucessivas**, escolha entre `1 parcela (Cobrança única)` ou até `12 parcelas mensais consecutivas` para gerar o carnê completo de uma só vez.
  4. Clique em **"Gerar Mensalidade"**.
- **Regra Automática de Inadimplência:** Toda mensalidade ainda não paga cuja data de vencimento seja anterior à data atual passa automaticamente para o status **Atrasado**.
- **Como Dar Baixa em Pagamento:** Clique no botão verde **"Pagar"** na linha da mensalidade para registrar a quitação com a data do dia.

---

### 5. 📈 Relatório Financeiro e Exportação CSV
Acesse o menu lateral **Relatório Financeiro** para análises contábeis:
1. Selecione o modo de apuração: **Por Mês** (escolha o mês/ano), **Por Ano** (escolha o ano letivo) ou **Todo o Histórico**.
2. Analise os 4 totalizadores do período (Total do Período, Recebido, Pendente a Vencer e Vencido em Atraso).
3. Confira a tabela **Resumo Consolidado por Aluno**, que exibe quanto cada aluno já pagou, quanto deve e a barra de progresso de **% Quitado**.
4. Clique em **"Exportar CSV"** no canto superior direito para baixar a planilha detalhada dos lançamentos filtrados.

---

### 6. 🧩 Arquitetura MVC & Backup de Dados (`db.json`)
Acesse o menu lateral **Arquitetura MVC & DI** (ou o botão **"Inspecionar MVC & DI"** no topo):
- **Exportar `db.json`:** Baixa o arquivo JSON completo contendo todos os alunos, matrículas e mensalidades atuais.
- **Restaurar Dados Padrão:** Restaura a base de dados para o estado inicial de demonstração.
- **Código-Fonte PHP 8+ MVC:** Permite visualizar e copiar os arquivos refatorados em PHP 8.2+ com Injeção de Dependência (`DIContainer.php`, `Aluno.php`, `JsonDatabaseDriver.php`, `AlunoService.php`, `AlunoController.php`).

---

## 🏗️ Arquitetura de Software (MVC + Clean Code + Dependency Injection)

O código foi organizado aplicando o **Princípio da Responsabilidade Única (SRP)** e o **Princípio da Inversão de Dependência (DIP)** do **SOLID**. Nenhuma View ou Controller acessa o banco de dados diretamente.

### Fluxo de Dependências (IoC)

```text
[ IDatabaseDriver / StorageDatabaseDriver ]
                    │
                    ▼  (Injetado via Construtor)
[ Repositories: AlunoRepository, MatriculaRepository, MensalidadeRepository ]
                    │
                    ▼  (Injetado via Construtor)
[ Services: AlunoService, MatriculaService, MensalidadeService, RelatorioFinanceiroService ]
                    │
                    ▼  (Injetado via Construtor)
[ Controllers: AlunoController, MatriculaController, MensalidadeController, RelatorioController ]
                    │
                    ▼  (Consumido via DIProvider / Hook useControllers)
[ Views: DashboardView, AlunosView, MatriculasView, MensalidadesView, RelatorioFinanceiroView ]
```

### Estrutura de Diretórios

```text
├── src/
│   ├── mvc/
│   │   ├── container/
│   │   │   └── DIContainer.tsx              # Container de Injeção de Dependência (IoC)
│   │   ├── models/
│   │   │   ├── types.ts                     # Contratos de dados, DTOs e Tipos de Domínio
│   │   │   ├── AlunoModel.ts                # Validação de aluno, CPF/Telefone e cálculo de idade
│   │   │   ├── MatriculaModel.ts            # Geração de matrícula sequencial (ex: 20260001)
│   │   │   └── MensalidadeModel.ts          # Cálculo dinâmico de atraso e formatação monetária
│   │   ├── repositories/
│   │   │   ├── IDatabaseDriver.ts           # Interface de persistência desacoplada
│   │   │   ├── StorageDatabaseDriver.ts     # Implementação JSON / Storage com seed do db.json
│   │   │   ├── AlunoRepository.ts           # Repositório de Alunos (IAlunoRepository)
│   │   │   ├── MatriculaRepository.ts       # Repositório de Matrículas (IMatriculaRepository)
│   │   │   └── MensalidadeRepository.ts     # Repositório de Mensalidades (IMensalidadeRepository)
│   │   ├── services/
│   │   │   ├── AuthService.ts               # Regras de autenticação e sessão
│   │   │   ├── AlunoService.ts              # Casos de uso de aluno + matrícula e cascata
│   │   │   ├── MatriculaService.ts          # Casos de uso e sincronização de matrículas
│   │   │   ├── MensalidadeService.ts        # Geração de parcelas, baixas e filtros financeiros
│   │   │   └── RelatorioFinanceiroService.ts# Consolidação de KPIs, séries de 6 meses e relatórios
│   │   ├── controllers/
│   │   │   └── AppControllers.ts            # Controllers que intermediam Views e Services
│   │   ├── views/
│   │   │   ├── LoginView.tsx                # Tela de autenticação
│   │   │   ├── DashboardView.tsx            # Painel executivo e gráfico de 6 meses
│   │   │   ├── AlunosView.tsx               # Listagem, modal de cadastro e Ficha do Aluno
│   │   │   ├── MatriculasView.tsx           # Gestão e edição de matrículas
│   │   │   ├── MensalidadesView.tsx         # Controle financeiro e geração de parcelas
│   │   │   ├── RelatorioFinanceiroView.tsx  # Relatórios por período e exportação CSV
│   │   │   └── ArquiteturaMvcView.tsx       # Documentação interativa e exportação PHP/JSON
│   │   └── php-export/
│   │       └── phpMvcTemplates.ts           # Referência em PHP 8+ MVC com DI
│   ├── App.tsx                              # Shell de navegação e provedor do DIContainer
│   └── main.tsx                             # Ponto de entrada da aplicação
└── README.md
```

---

## 🚀 Como Executar o Projeto Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acesse no navegador:**
   Abra `http://localhost:3000` e entre com `admin@escola.com` / `123456`.

4. **Compilar para produção:**
   ```bash
   npm run build
   ```

---

## 👤 Autor

Desenvolvido por **Edclecio Micael**.
