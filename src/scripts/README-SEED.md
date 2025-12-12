# Scripts de Seed do Banco de Dados

Este diretório contém scripts para popular o banco de dados com dados iniciais necessários para o funcionamento da aplicação.

## Scripts Disponíveis

### 1. `seed-initial-data.js`

Popula o banco com dados básicos essenciais:

- **Roles**: admin, user, moderator
- **Usuário Admin**: Para testes e administração
- **Categorias**: Categorias básicas para produtos

```bash
npm run db:seed:initial
```

### 2. `seed-products.js`

Popula o banco com produtos do arquivo `db.json`:

- Lê produtos do arquivo `src/controllers/db.json`
- Vincula produtos às categorias apropriadas
- Adiciona dados como stock, status, etc.

```bash
npm run db:seed:products
```

### 3. `seed-complete.js` (Recomendado)

Script completo que executa tudo em sequência:

- Todos os dados do `seed-initial-data.js`
- Todos os produtos do `seed-products.js`
- Tratamento de erros e verificações de dados existentes

```bash
npm run db:seed:complete
```

### 4. Executar todos separadamente

```bash
npm run db:seed:all
```

## Dados Criados

### Roles

| ID  | Nome      | Status |
| --- | --------- | ------ |
| 1   | admin     | true   |
| 2   | user      | true   |
| 3   | moderator | true   |

### Usuário Admin

- **Email**: `admin@tuspacio.com`
- **Senha**: `admin123`
- **Role**: admin
- **Status**: ativo

### Categorias

1. Maquiagem para Olhos
2. Maquiagem para Lábios
3. Base e Corretivos
4. Cuidados com Unhas
5. Contorno e Iluminação
6. Produtos Premium
7. Cuidados com a Pele
8. Perfumes e Fragrâncias
9. Acessórios de Beleza
10. Produtos Naturais

## Uso Recomendado

### Para desenvolvimento inicial:

```bash
npm run db:seed:complete
```

### Para adicionar apenas produtos novos:

```bash
npm run db:seed:products
```

### Para resetar dados básicos:

```bash
npm run db:seed:initial
```

## Notas Importantes

- Os scripts verificam se os dados já existem antes de inserir
- Senhas são hasheadas automaticamente com bcrypt
- Produtos são inseridos em lotes para melhor performance
- Conexão com banco é fechada automaticamente após execução
- Logs detalhados mostram o progresso e estatísticas

## Estrutura de Arquivos

```
src/scripts/
├── seed-initial-data.js    # Dados básicos (roles, admin, categorias)
├── seed-products.js        # Produtos do db.json
├── seed-complete.js        # Script completo
└── README-SEED.md         # Esta documentação
```

## Troubleshooting

### Erro de conexão com banco

Verifique se:

- O banco PostgreSQL está rodando
- As variáveis de ambiente estão configuradas
- O arquivo `.env` existe e está correto

### Produtos não são inseridos

Verifique se:

- O arquivo `src/controllers/db.json` existe
- O arquivo contém um array `products` válido
- Os dados dos produtos têm os campos obrigatórios

### Usuário admin não consegue fazer login

Verifique se:

- O email está correto: `admin@tuspacio.com`
- A senha está correta: `admin123`
- O usuário foi criado com sucesso (verificar logs)
