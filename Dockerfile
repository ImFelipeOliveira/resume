# 1. Estágio de Build: Instala dependências e compila o TypeScript
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
# Usa 'npm ci' para builds mais rápidos e consistentes em produção
RUN npm ci

COPY . .
RUN npm run build

# 2. Estágio de Produção: Copia apenas o necessário para rodar
FROM node:20-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

CMD ["npm", "start"]