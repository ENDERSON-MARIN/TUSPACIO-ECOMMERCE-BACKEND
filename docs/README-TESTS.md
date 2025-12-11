# 🧪 Guia de Testes da API

Este guia mostra como testar todas as rotas da sua API usando dados reais do json-server.

## 🚀 Início Rápido

### 1. Executar tudo de uma vez

```bash
# Inicia json-server E a API principal simultaneamente
npm run dev:full
```

### 2. Executar testes automatizados

```bash
# Em outro terminal, execute os testes
npm run test:api
```

## 📋 Pré-requisitos

1. **JSON Server rodando**: `npm run json` (porta 3004)
2. **API principal rodando**: `npm run dev` (porta 3000)
3. **Dependências instaladas**: `npm install`

## 🛠️ Comandos Disponíveis

| Comando            | Descrição                          |
| ------------------ | ---------------------------------- |
| `npm run json`     | Inicia apenas o json-server        |
| `npm run dev`      | Inicia apenas a API principal      |
| `npm run dev:full` | Inicia json-server + API principal |
| `npm run test:api` | Executa testes automatizados       |

## 📊 Dados de Teste Disponíveis

O json-server contém **produtos de maquiagem** com os seguintes IDs para teste:

- **740**: Dior Junon (nail polish) - R$ 20.00
- **730**: Dior Matte (nail polish) - R$ 20.00
- **729**: Dior Poison Metal (nail polish) - R$ 20.00
- **728**: Dior Jungle Matte (nail polish) - R$ 20.00
- **168**: Moov Cosmetics St. Tropez - R$ 14.99
- **167**: Anna Sui Nail Colour - R$ 15.00

## 🔍 Testando Rotas Específicas

### Produtos

```bash
# Listar todos os produtos
curl http://localhost:3000/api/products

# Buscar produto específico
curl http://localhost:3000/api/product/740

# Buscar por marca
curl "http://localhost:3000/api/products/brand/?brand=dior"

# Buscar por nome
curl "http://localhost:3000/api/products/name?name=nail"
```

### Comparar com JSON Server

```bash
# Dados originais do json-server
curl http://localhost:3004/products/740

# Dados da sua API
curl http://localhost:3000/api/product/740
```

## 🧪 Testes Automatizados

O script `test-api.js` testa automaticamente:

- ✅ **Produtos**: CRUD completo
- ✅ **Busca**: Por nome, marca, rating, preço
- ✅ **Categorias**: Listagem e detalhes
- ✅ **Pedidos**: Criação e listagem
- ✅ **Usuários**: Gestão de usuários
- ✅ **Autenticação**: Login e verificação
- ✅ **Roles**: Gestão de permissões

### Exemplo de Output

```
🚀 Iniciando testes da API...
=====================================

📋 Verificando json-server...
[PASS] JSON Server - 1000+ produtos disponíveis

🛍️ TESTANDO ROTAS DE PRODUTOS
=====================================
[PASS] GET /products - 50 produtos retornados
[PASS] GET /products/dashboard
[FAIL] GET /product/740 - 404: Not Found
[PASS] POST /products
```

## 🔧 Ferramentas Recomendadas

### 1. **Postman/Insomnia**

- Interface visual para testes
- Salvar coleções de requests
- Automatizar testes

### 2. **curl + jq**

```bash
# Formatar JSON de resposta
curl http://localhost:3004/products | jq '.[0:3]'

# Contar produtos por marca
curl http://localhost:3004/products | jq '[.[] | select(.brand == "dior")] | length'
```

### 3. **HTTPie** (alternativa ao curl)

```bash
# Mais legível que curl
http GET localhost:3000/api/products
http POST localhost:3000/api/products brand=test name="Produto Teste"
```

## 📈 Monitoramento

### Logs da API

```bash
# Monitorar logs em tempo real
tail -f logs/app.log
tail -f logs/error.log
```

### Status dos Serviços

```bash
# Verificar se as portas estão ativas
netstat -an | grep :3000  # API principal
netstat -an | grep :3004  # JSON Server
```

## 🐛 Troubleshooting

### Problema: "Connection refused"

```bash
# Verificar se os serviços estão rodando
curl http://localhost:3000/health
curl http://localhost:3004/products
```

### Problema: "CORS error"

- Verificar configuração de CORS na API
- Testar com `--cors` no json-server

### Problema: "404 Not Found"

- Verificar se a rota existe em `src/routes/`
- Conferir se o middleware está configurado

## 📚 Próximos Passos

1. **Implementar rotas faltantes** baseadas nos testes
2. **Adicionar validações** usando dados do json-server
3. **Configurar CI/CD** com testes automatizados
4. **Documentar API** com Swagger/OpenAPI
5. **Adicionar testes de integração** com banco real

## 🤝 Contribuindo

1. Adicione novos testes em `test-api.js`
2. Documente novas rotas em `docs/API-TESTING.md`
3. Atualize este README com novas funcionalidades

---

💡 **Dica**: Use `npm run dev:full` para desenvolvimento e `npm run test:api` para validar suas implementações!
