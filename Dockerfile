# 1. Estágio de Build: Instala dependências e compila o TypeScript
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
# Usa 'npm ci' para builds mais rápidos e consistentes em produção
RUN npm ci
COPY . .
RUN npm run build

# Remove as dependências de desenvolvimento para limpar a pasta node_modules
RUN npm prune --omit=dev

# 2. Estágio de Produção: Copia apenas o necessário para rodar
FROM node:20-alpine
WORKDIR /usr/src/app

# Copia os arquivos de configuração do projeto
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/ecosystem.config.js ./

# Copia apenas as dependências de PRODUÇÃO
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 3000

# Usa o novo script que não tenta rodar o build novamente
CMD ["npm", "run", "start:prod"]