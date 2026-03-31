# ERP Lite - Sistema de Gestão

Este projeto é dividido em duas partes principais:
1. **Frontend:** React (usando Vite).
2. **Backend:** Node.js (usando Express e Sequelize) conectado a um PostgreSQL.

## Funcionalidade de Rede Externa (Ngrok)
O sistema está preparado para rodar em múltiplos computadores, de forma que um assuma o papel de **Servidor (Database + Backend)** e os outros atuem como **Clientes (Apenas Frontend)** conectados via rede através do Ngrok.

---

## Passo a Passo para Configuração Local (PC 1 - Servidor)

O Servidor é a máquina mais estável que deverá conter o banco de dados e rodar o Backend.

### 1. Preparação do Banco de Dados
Certifique-se de ter o PostgreSQL instalado. O usuário padrão nos exemplos é `postgres` e a senha `66177`.
O banco de dados (`SySilveiraDB`) **não** precisa ser criado manualmente, mas o PostgreSQL deve estar rodando e aceitando conexões nestas credenciais.

### 2. Configurando o Backend
1. Abra o terminal na pasta `backend`.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo de variáveis de ambiente:
   - Duplique o arquivo `.env.example` para `.env` (`cp .env.example .env`).
   - Se for usar o Ngrok para conectar o PC 2, deixe a configuração `FRONTEND_URL` como `*` (ou substitua com a URL correta posteriormente).
4. Rode a instalação do banco de dados (este comando vai criar o banco caso não exista e rodar as migrações/tabelas):
   ```bash
   npm run setup
   ```
5. Inicie o servidor:
   ```bash
   npm run dev
   ```
O backend ficará rodando em `http://0.0.0.0:3333` (com acesso local também em `http://localhost:3333`).

### 3. Configurando o Frontend (do PC 1)
1. Abra outro terminal na pasta `frontend`.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo de variáveis de ambiente:
   - Duplique o arquivo `.env.example` para `.env`.
   - Para rodar no Servidor, o `VITE_API_URL` pode se manter sendo `http://localhost:3333`.
4. Inicie o frontend:
   ```bash
   npm run dev
   ```

---

## Passo a Passo para Uso Compartilhado (PC 2 - Cliente)

Se você desejar utilizar o **PC 2** apenas como ponto de acesso usando a internet, siga as instruções abaixo:

### No PC 1 (O Servidor)
Como o PC 2 precisa alcançar o backend, utilizaremos o **Ngrok** para criar um túnel público. Assegure que o backend está rodando no PC 1.
1. No PC 1, instale a ferramenta [Ngrok](https://ngrok.com/).
2. No seu terminal, libere a porta `3333` usando o seguinte comando:
   ```bash
   ngrok http 3333
   ```
3. O Ngrok retornará um **Forwarding URL** (algo como `https://1234-abcd.ngrok-free.app`). **Copie essa URL**.
   > **Aviso:** Toda vez que você desligar o Ngrok, essa URL gratuita **muda**. Portanto esse passo deve ser repetido a cada dia de trabalho novo caso a máquina seja desligada.

### No PC 2 (O Cliente)
O computador Cliente **não precisa** baixar a pasta `backend` ou instalar banco de dados. Ele apenas consome os serviços da nuvem.
1. Clone este repositório no PC 2, porém navegue diretamente para a pasta `frontend`.
2. Instale as dependências com `npm install`.
3. Crie o arquivo `.env` (ou duplique o `.env.example`).
4. **Cole a URL do Ngrok** dentro da variável de API:
   ```env
   VITE_API_URL=https://1234-abcd.ngrok-free.app
   ```
   *(Não deixe barra no final da URL)*
5. Conecte no sistema:
   ```bash
   npm run dev
   ```

### 💡 Dicas de Engenharia
* **Estoque Sincronizado**: O PC 2 salva e consome as informações diretamente no banco de dados do PC 1, tudo é sincronizado em tempo real. Pela distância entre rede há um pequeno atraso de requisição dependendo da internet, mas para ambiente de loja é perfeitamente funcional.
* **Segurança**: Como seu servidor ficará exposto à internet temporariamente, a senha do admin gerada (`66177`), ou senhas fortes em outros usuários, aliadas ao sistema de autenticação via token garantem o uso seguro. Ninguém não logado conseguirá consultar o ERP.
