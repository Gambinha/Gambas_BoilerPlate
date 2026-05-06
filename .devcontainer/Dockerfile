FROM node:22-bookworm-slim

# System dependencies: git, curl, procps (ps), python3 (node-gyp), build tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    procps \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Global Node.js tools
RUN npm install -g @nestjs/cli

# Claude CLI
RUN curl -fsSL https://claude.ai/install.sh | bash \
    && echo 'export PATH="$HOME/.local/bin:$PATH"' >> /root/.bashrc

WORKDIR /workspace
