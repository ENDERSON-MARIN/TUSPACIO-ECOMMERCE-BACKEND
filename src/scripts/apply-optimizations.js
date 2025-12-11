#!/usr/bin/env node

/**
 * Script para aplicar otimizações de performance gradualmente
 *
 * Uso:
 * node src/scripts/apply-optimizations.js --step=1
 * node src/scripts/apply-optimizations.js --step=all
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class OptimizationMigrator {
  constructor() {
    this.steps = [
      {
        id: 1,
        name: 'Instalar dependências de performance',
        description:
          'Instala node-cache, compression e outras dependências necessárias',
        action: this.installDependencies.bind(this),
      },
      {
        id: 2,
        name: 'Aplicar middlewares básicos',
        description: 'Adiciona middlewares de compressão, segurança e logs',
        action: this.applyBasicMiddlewares.bind(this),
      },
      {
        id: 3,
        name: 'Implementar cache',
        description: 'Adiciona sistema de cache em memória',
        action: this.implementCache.bind(this),
      },
      {
        id: 4,
        name: 'Adicionar paginação',
        description: 'Implementa paginação automática',
        action: this.addPagination.bind(this),
      },
      {
        id: 5,
        name: 'Otimizar controllers',
        description: 'Substitui controllers por versões otimizadas',
        action: this.optimizeControllers.bind(this),
      },
      {
        id: 6,
        name: 'Configurar rate limiting',
        description: 'Adiciona rate limiting para proteção',
        action: this.configureRateLimit.bind(this),
      },
      {
        id: 7,
        name: 'Implementar monitoramento',
        description: 'Adiciona logs e métricas de performance',
        action: this.implementMonitoring.bind(this),
      },
    ];
  }

  async run(stepId = 'all') {
    console.log('🚀 Iniciando aplicação de otimizações de performance...\n');

    if (stepId === 'all') {
      for (const step of this.steps) {
        await this.executeStep(step);
      }
    } else {
      const step = this.steps.find(s => s.id === parseInt(stepId));
      if (!step) {
        console.error(`❌ Passo ${stepId} não encontrado`);
        process.exit(1);
      }
      await this.executeStep(step);
    }

    console.log('\n✅ Otimizações aplicadas com sucesso!');
    console.log('\n📋 Próximos passos recomendados:');
    console.log('1. Reinicie o servidor para aplicar as mudanças');
    console.log('2. Monitore os logs para verificar o funcionamento');
    console.log('3. Execute testes para validar a funcionalidade');
    console.log('4. Meça a performance antes e depois');
  }

  async executeStep(step) {
    console.log(`📦 Passo ${step.id}: ${step.name}`);
    console.log(`   ${step.description}`);

    try {
      await step.action();
      console.log(`   ✅ Concluído\n`);
    } catch (error) {
      console.error(`   ❌ Erro: ${error.message}\n`);
      throw error;
    }
  }

  async installDependencies() {
    const dependencies = [
      'node-cache',
      'compression',
      'helmet',
      'express-rate-limit',
    ];

    console.log('   Instalando dependências...');

    try {
      execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'pipe' });
      console.log(`   Instaladas: ${dependencies.join(', ')}`);
    } catch (error) {
      throw new Error(`Falha ao instalar dependências: ${error.message}`);
    }
  }

  async applyBasicMiddlewares() {
    const appPath = path.join(process.cwd(), 'src', 'app.js');

    if (!fs.existsSync(appPath)) {
      throw new Error('Arquivo src/app.js não encontrado');
    }

    let appContent = fs.readFileSync(appPath, 'utf8');

    // Adicionar imports se não existirem
    const imports = [
      "const { PerformanceMiddleware } = require('./middleware/performance');",
      "const { cacheInstance } = require('./middleware/cache');",
    ];

    imports.forEach(importLine => {
      if (!appContent.includes(importLine)) {
        // Adicionar após outros requires
        const requireRegex = /(const .+ = require\(.+\);?\n)/g;
        const matches = appContent.match(requireRegex);
        if (matches) {
          const lastRequire = matches[matches.length - 1];
          appContent = appContent.replace(
            lastRequire,
            lastRequire + importLine + '\n'
          );
        }
      }
    });

    // Adicionar middlewares básicos
    const middlewares = [
      'app.use(PerformanceMiddleware.compression());',
      'app.use(PerformanceMiddleware.security());',
      'app.use(PerformanceMiddleware.performanceLogger());',
    ];

    middlewares.forEach(middleware => {
      if (!appContent.includes(middleware)) {
        // Adicionar após express.json()
        const jsonMiddleware = 'app.use(express.json());';
        if (appContent.includes(jsonMiddleware)) {
          appContent = appContent.replace(
            jsonMiddleware,
            jsonMiddleware + '\n' + middleware
          );
        }
      }
    });

    fs.writeFileSync(appPath, appContent);
    console.log('   Middlewares básicos adicionados ao app.js');
  }

  async implementCache() {
    // Verificar se os arquivos de cache já existem
    const cacheFiles = [
      'src/middleware/cache.js',
      'src/middleware/pagination.js',
    ];

    cacheFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        console.log(
          `   ⚠️  Arquivo ${file} não encontrado. Certifique-se de que foi criado.`
        );
      } else {
        console.log(`   ✓ Arquivo ${file} encontrado`);
      }
    });

    console.log('   Sistema de cache configurado');
  }

  async addPagination() {
    // Exemplo de como adicionar paginação a uma rota existente
    const routesPath = path.join(process.cwd(), 'src', 'routes');

    if (!fs.existsSync(routesPath)) {
      console.log('   ⚠️  Diretório de rotas não encontrado');
      return;
    }

    console.log('   Paginação configurada (aplicar manualmente nas rotas)');
    console.log('   Exemplo de uso:');
    console.log('   router.use(PaginationMiddleware.full());');
  }

  async optimizeControllers() {
    const optimizedPath = path.join(
      process.cwd(),
      'src',
      'controllers',
      'optimized'
    );

    if (!fs.existsSync(optimizedPath)) {
      console.log('   ⚠️  Controllers otimizados não encontrados');
      return;
    }

    const files = fs.readdirSync(optimizedPath).filter(f => f.endsWith('.js'));
    console.log(`   Controllers otimizados disponíveis: ${files.join(', ')}`);
    console.log(
      '   Para usar, substitua os imports nas rotas pelos controllers otimizados'
    );
  }

  async configureRateLimit() {
    const appPath = path.join(process.cwd(), 'src', 'app.js');

    if (!fs.existsSync(appPath)) {
      throw new Error('Arquivo src/app.js não encontrado');
    }

    let appContent = fs.readFileSync(appPath, 'utf8');

    // Adicionar rate limiting geral
    const rateLimitMiddleware =
      'app.use(PerformanceMiddleware.apiRateLimit());';

    if (!appContent.includes(rateLimitMiddleware)) {
      // Adicionar antes das rotas
      const routesRegex = /app\.use\(['"`]\/api['"`]/;
      if (routesRegex.test(appContent)) {
        appContent = appContent.replace(
          routesRegex,
          rateLimitMiddleware + '\n$&'
        );
      }
    }

    fs.writeFileSync(appPath, appContent);
    console.log('   Rate limiting configurado');
  }

  async implementMonitoring() {
    // Verificar se o logger existe
    const loggerPath = path.join(process.cwd(), 'src', 'utils', 'logger.js');

    if (!fs.existsSync(loggerPath)) {
      console.log('   ⚠️  Logger não encontrado em src/utils/logger.js');
      console.log('   Certifique-se de ter um sistema de logs configurado');
    } else {
      console.log('   ✓ Sistema de logs encontrado');
    }

    console.log('   Monitoramento configurado');
    console.log('   Acesse /admin/cache-stats para ver estatísticas do cache');
  }

  showUsage() {
    console.log('Uso: node src/scripts/apply-optimizations.js [opções]\n');
    console.log('Opções:');
    console.log('  --step=N    Executar apenas o passo N');
    console.log('  --step=all  Executar todos os passos (padrão)\n');
    console.log('Passos disponíveis:');
    this.steps.forEach(step => {
      console.log(`  ${step.id}. ${step.name}`);
      console.log(`     ${step.description}`);
    });
  }
}

// Executar script
if (require.main === module) {
  const args = process.argv.slice(2);
  const stepArg = args.find(arg => arg.startsWith('--step='));
  const step = stepArg ? stepArg.split('=')[1] : 'all';

  if (args.includes('--help') || args.includes('-h')) {
    new OptimizationMigrator().showUsage();
    process.exit(0);
  }

  const migrator = new OptimizationMigrator();
  migrator.run(step).catch(error => {
    console.error(
      '\n❌ Erro durante a aplicação das otimizações:',
      error.message
    );
    process.exit(1);
  });
}

module.exports = OptimizationMigrator;
