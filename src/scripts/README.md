# Scripts de Banco de Dados

Este diretório contém scripts utilitários para gerenciar o banco de dados.

## Seed de Produtos

O script `seed-products.js` popula o banco de dados com produtos do arquivo `src/controllers/db.json`.

### Como usar:

1. **Certifique-se de que o banco de dados está configurado:**

   ```bash
   # Verifique se as variáveis de ambiente estão configuradas no .env
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_HOST=localhost
   DB_NAME=tuspacio_db
   DB_PORT=5432
   ```

2. **Execute o script de seed:**

   ```bash
   # Usando npm script (recomendado)
   npm run db:seed

   # Ou diretamente
   node src/scripts/seed-products.js
   ```

### O que o script faz:

- ✅ Lê todos os produtos do arquivo `src/controllers/db.json`
- ✅ Mapeia os dados para o formato do modelo Product do Sequelize
- ✅ Remove produtos existentes (opcional)
- ✅ Insere produtos em lotes para melhor performance
- ✅ Gera stock aleatório para cada produto (1-100 unidades)
- ✅ Trata erros e produtos inválidos graciosamente
- ✅ Exibe estatísticas detalhadas do processo

### Estrutura dos dados:

O script mapeia os seguintes campos do JSON para o banco:

| Campo JSON       | Campo DB         | Observações                   |
| ---------------- | ---------------- | ----------------------------- |
| `brand`          | `brand`          | Marca do produto              |
| `name`           | `name`           | Nome do produto               |
| `price`          | `price`          | Preço convertido para decimal |
| `price_sign`     | `price_sign`     | Símbolo da moeda              |
| `currency`       | `currency`       | Código da moeda               |
| `image_link`     | `image_link`     | URL da imagem                 |
| `description`    | `description`    | Descrição do produto          |
| `rating`         | `rating`         | Avaliação (0-5)               |
| `product_type`   | `product_type`   | Tipo/categoria do produto     |
| `tag_list`       | `tag_list`       | Array de tags                 |
| `product_colors` | `product_colors` | Array de cores disponíveis    |
| -                | `stock`          | Gerado aleatoriamente (1-100) |
| -                | `status`         | Sempre `true`                 |

### Logs de exemplo:

```
🌱 Iniciando seed dos produtos...
📦 Encontrados 1000 produtos no arquivo JSON
✅ Banco de dados sincronizado
🗑️  Removendo 0 produtos existentes...
✅ Lote 1: 100 produtos inseridos
✅ Lote 2: 100 produtos inseridos
...
🎉 Seed concluído com sucesso!
📊 Estatísticas:
   - Produtos inseridos: 995
   - Produtos ignorados: 5
   - Total processados: 1000
   - Produtos no banco: 995
🔌 Conexão com banco fechada
```

### Troubleshooting:

**Erro de conexão com banco:**

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão manualmente

**Produtos não inseridos:**

- Verifique se o arquivo `db.json` existe e é válido
- Produtos sem `name` ou `brand` são ignorados
- Verifique os logs para detalhes dos erros

**Performance lenta:**

- O script processa em lotes de 100 produtos
- Para arquivos muito grandes, considere aumentar o `batchSize`
- Certifique-se de que o banco tem índices apropriados
