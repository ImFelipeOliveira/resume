# Resume Bot - Resumidor de Conversas para WhatsApp

Este é um bot para WhatsApp projetado para resumir conversas em grupos. Utilizando a API do Google Gemini, ele processa as mensagens de forma assíncrona e envia um resumo conciso diretamente no chat.

O projeto é construído com uma arquitetura de microserviços desacoplada, usando um **Bot** para interagir com o WhatsApp e um **Worker** para processar as tarefas pesadas, comunicando-se através de um message broker (RabbitMQ).

## ✨ Funcionalidades

- **Conexão com WhatsApp**: Autenticação simples via QR Code no terminal.
- **Processamento Assíncrono**: As solicitações de resumo são enfileiradas no RabbitMQ, garantindo que o bot permaneça responsivo.
- **Arquitetura Escalável**: O processo do Worker pode ser escalado horizontalmente para lidar com um grande volume de mensagens sem afetar a conexão do bot.
- **Resumos Inteligentes**: Integração com a API do Google Gemini para gerar resumos de alta qualidade.
- **Servidor Web**: Um servidor Express simples para exibir o QR Code em uma página web, se necessário.

## 🏗️ Arquitetura

O fluxo de uma solicitação de resumo funciona da seguinte maneira:

```
Usuário (WhatsApp) <--> [ 🤖 Bot (Baileys) ] <--> [ 📨 RabbitMQ (Fila de Tarefas) ] <--> [ 🛠️ Worker (Gemini) ] --> [ 📨 RabbitMQ (Fila de Respostas) ] --> [ 🤖 Bot (Envia Resposta) ]
```

1.  O **Bot** recebe uma mensagem do usuário e a publica em uma fila de tarefas no RabbitMQ.
2.  O **Worker** consome a tarefa da fila, chama a API do Gemini para gerar o resumo.
3.  Após gerar o resumo, o **Worker** o publica em uma fila de respostas.
4.  O **Bot** consome a mensagem da fila de respostas e a envia de volta para o chat original no WhatsApp.

## 🛠️ Tecnologias Utilizadas

- **Node.js**
- **TypeScript**
- **Baileys**: Para a conexão com o WhatsApp.
- **Google Gemini**: Para a inteligência artificial de sumarização.
- **RabbitMQ**: Como message broker para a comunicação entre o Bot e o Worker.
- **Redis**: Para o armazenamento de sessão do Baileys.
- **Express**: Para servir o QR Code.
- **Pino**: Para logging.

## 🚀 Começando

Siga os passos abaixo para configurar e executar o projeto localmente.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
- Uma instância do [RabbitMQ](https://www.rabbitmq.com/download.html) em execução.
- Uma instância do [Redis](https://redis.io/docs/getting-started/) em execução.

### Instalação

1.  Clone o repositório:
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd resume
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Crie um arquivo de variáveis de ambiente a partir do exemplo.
    ```bash
    cp .env.example .env
    ```

4.  Abra o arquivo `.env` e preencha com suas credenciais e configurações.

### Executando a Aplicação

**Modo de Desenvolvimento**

Este comando iniciará o Bot e o Worker simultaneamente com hot-reload.

```bash
npm run dev
```

**Modo de Produção**

Primeiro, compile os arquivos TypeScript:

```bash
npm run build
```

Depois, inicie os processos:

```bash
npm start
```

Ao iniciar, um QR Code será exibido no terminal. Escaneie-o com seu aplicativo WhatsApp (em *Aparelhos conectados*) para conectar o bot.

## ⚙️ Variáveis de Ambiente

As seguintes variáveis são necessárias para a execução do projeto. Elas devem ser definidas no arquivo `.env`.

| Variável                  | Descrição                                                          | Exemplo                          |
| ------------------------- | ------------------------------------------------------------------ | -------------------------------- |
| `GEMINI_API_KEY`          | Sua chave de API do Google Gemini.                                 | `AIzaSy...`                      |
| `RABBITMQ_URL`            | URL de conexão com sua instância do RabbitMQ.                      | `amqp://user:pass@localhost:5672`|
| `RABBITMQ_SUMMARY_QUEUE`  | Nome da fila para as tarefas de resumo.                            | `summary_tasks`                  |
| `RABBITMQ_REPLY_QUEUE`    | Nome da fila para as respostas dos resumos.                        | `reply_tasks`                    |
| `REDIS_URL`               | URL de conexão com sua instância do Redis.                         | `redis://localhost:6379`         |
| `PORT`                    | Porta para o servidor Express que exibe o QR Code.                 | `3000`                           |