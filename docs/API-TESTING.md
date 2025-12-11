# Guia de Testes da API com JSON Server

Este guia mostra como testar todas as rotas da API usando o json-server com dados de produtos de teste.

## Configuração

### 1. Iniciar o JSON Server

```bash
npm run json
```

Isso iniciará o json-server na porta 3004 com os dados de `src/controllers/db.json`.

### 2. Iniciar a API Principal

```bash
npm run dev
```

Isso iniciará sua API principal (provavelmente na porta 3000).

## Rotas Disponíveis para Teste

### 🛍️ PRODUTOS

#### GET - Listar todos os produtos

```bash
# Sua API
curl -X GET http://localhost:3000/api/products

# JSON Server (dados de teste)
curl -X GET http://localhost:3004/products
```

#### GET - Buscar produto por ID

```bash
# Sua API
curl -X GET http://localhost:3000/api/product/740

# JSON Server (dados de teste)
curl -X GET http://localhost:3004/products/740
```

#### GET - Dashboard de produtos

```bash
curl -X GET http://localhost:3000/api/products/dashboard
```

#### GET - Tipos de produtos

```bash
curl -X GET http://localhost:3000/api/products/productType
```

#### POST - Criar novo produto

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "test-brand",
    "name": "Produto Teste",
    "price": "25.99",
    "price_sign": "$",
    "currency": "USD",
    "description": "Produto para teste da API",
    "category": "test",
    "product_type": "test_product"
  }'
```

#### PUT - Atualizar produto

```bash
curl -X PUT http://localhost:3000/api/products/740 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto Atualizado",
    "price": "30.99"
  }'
```

#### DELETE - Desabilitar produto

```bash
curl -X DELETE http://localhost:3000/api/products/740
```

### 🔍 BUSCA E FILTROS

#### GET - Buscar produtos por nome

```bash
curl -X GET "http://localhost:3000/api/products/name?name=dior"
```

#### GET - Buscar produtos

```bash
curl -X GET "http://localhost:3000/api/products/search/?q=nail"
```

#### GET - Produtos por marca

```bash
curl -X GET "http://localhost:3000/api/products/brand/?brand=dior"
```

#### GET - Produtos por rating

```bash
curl -X GET "http://localhost:3000/api/products/rating/?rating=3.5"
```

#### GET - Ordenar por preço

```bash
# Crescente
curl -X GET "http://localhost:3000/api/products/price/?order=asc"

# Decrescente
curl -X GET "http://localhost:3000/api/products/price/?order=desc"
```

#### GET - Ordenar por nome

```bash
curl -X GET "http://localhost:3000/api/products/orderName/?order=asc"
```

#### GET - Ordenação combinada

```bash
curl -X GET "http://localhost:3000/api/products/orderCombine/?sortBy=price&order=asc"
```

#### GET - Ofertas

```bash
curl -X GET http://localhost:3000/api/products/oferts
```

### 📝 REVIEWS

#### GET - Reviews de produtos

```bash
curl -X GET http://localhost:3000/api/products/reviews
```

#### POST - Criar review

```bash
curl -X POST http://localhost:3000/api/products/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 740,
    "user_id": 1,
    "rating": 5,
    "comment": "Excelente produto!"
  }'
```

### 📦 CATEGORIAS

#### GET - Todas as categorias

```bash
curl -X GET http://localhost:3000/api/categories
```

#### GET - Uma categoria específica

```bash
curl -X GET http://localhost:3000/api/categorie/1
```

### 🛒 PEDIDOS

#### GET - Todos os pedidos

```bash
curl -X GET http://localhost:3000/api/orders
```

#### POST - Criar pedido

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "products": [
      {
        "product_id": 740,
        "quantity": 2,
        "price": 20.0
      }
    ],
    "total": 40.0
  }'
```

#### PUT - Atualizar status do pedido

```bash
curl -X PUT http://localhost:3000/api/order/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped"
  }'
```

### 👥 USUÁRIOS

#### GET - Todos os usuários

```bash
curl -X GET http://localhost:3000/api/users
```

#### POST - Criar usuário

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "123456"
  }'
```

#### PUT - Atualizar role do usuário

```bash
curl -X PUT http://localhost:3000/api/user/1 \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

### 🔐 AUTENTICAÇÃO

#### POST - Login

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "123456"
  }'
```

#### GET - Verificar autenticação

```bash
curl -X GET http://localhost:3000/api/auth \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 🏷️ ROLES

#### GET - Todas as roles

```bash
curl -X GET http://localhost:3000/api/rol
```

### 💳 CHECKOUT

#### POST - Processar pagamento

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 1,
    "payment_method": "credit_card",
    "amount": 40.0
  }'
```

### 📊 CONTROLE DE ESTOQUE

#### PUT - Atualizar estoque

```bash
curl -X PUT http://localhost:3000/api/controlstock \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 740,
    "quantity": 50
  }'
```

## Dados de Teste Disponíveis

O json-server está rodando com dados de produtos de maquiagem. Alguns IDs disponíveis para teste:

- **740**: Dior Junon (nail polish)
- **730**: Dior Matte (nail polish)
- **729**: Dior Poison Metal (nail polish)
- **728**: Dior Jungle Matte (nail polish)
- **168**: Moov Cosmetics St. Tropez Collection
- **167**: Anna Sui Nail Colour

## Scripts de Teste Automatizado

Você pode usar estes comandos para testar rapidamente:

```bash
# Testar GET de todos os produtos
curl -X GET http://localhost:3004/products | jq '.[0:5]'

# Testar busca por marca
curl -X GET "http://localhost:3004/products?brand=dior" | jq 'length'

# Testar produto específico
curl -X GET http://localhost:3004/products/740 | jq '.name'
```

## Dicas

1. **Use jq** para formatar JSON: `curl ... | jq .`
2. **Teste com Postman** ou **Insomnia** para interface visual
3. **Monitore logs** da API principal enquanto testa
4. **Compare respostas** entre json-server e sua API
5. **Use dados do json-server** como referência para estrutura de dados

## Próximos Passos

1. Implemente as rotas que ainda não existem
2. Adicione validações usando os dados de teste
3. Configure testes automatizados com Jest/Mocha
4. Documente a API com Swagger/OpenAPI
