FROM node:22-bookworm-slim

WORKDIR /workspace/server

# Instala dependencias globais de desenvolvimento
RUN npm install -g @nestjs/cli

# Copia manifesto de dependencias primeiro (cache layer)
COPY package*.json ./

RUN npm install

# Copia o restante do codigo
COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
