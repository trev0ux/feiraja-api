# Feiraja API

Backend API para o marketplace Feiraja - conectando produtores locais aos consumidores.

## 🚀 Deploy

Este projeto está configurado para deploy automático no Vercel.

### Deploy Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Executar em modo produção
npm start
```

## 📡 Endpoints

### Públicos
- `GET /api/health` - Status da API
- `GET /api/categories` - Lista categorias com produtos
- `GET /api/products` - Lista produtos (com filtros)
- `GET /api/addresses` - Lista endereços

### Admin (autenticação necessária)
- `POST /api/admin/login` - Login do administrador
- `POST /api/admin/categories` - Criar categoria
- `PUT /api/admin/categories/:id` - Atualizar categoria
- `DELETE /api/admin/categories/:id` - Deletar categoria
- `POST /api/admin/products` - Criar produto
- `GET /api/admin/box-prices` - Obter preços das caixas
- `PUT /api/admin/box-prices/:id` - Atualizar preços
- `POST /api/admin/addresses` - Criar endereço

## 🔐 Variáveis de Ambiente

```bash
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

## 📦 Tecnologias

- Node.js + Express
- JWT para autenticação
- bcryptjs para hash de senhas
- Multer para upload de arquivos
- CORS configurado

## 🔧 Estrutura

```
feiraja-api/
├── api/
│   └── index.js          # Servidor principal
├── package.json          # Dependências
├── vercel.json          # Configuração Vercel
└── README.md            # Este arquivo
```