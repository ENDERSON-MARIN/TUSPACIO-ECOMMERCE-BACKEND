#!/usr/bin/env node
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

/**
 * Script de verificação pré-deploy para TuSpacio API
 * Verifica se todas as configurações necessárias estão corretas antes do deploy
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔍 Iniciando verificação pré-deploy...\n');

let hasErrors = false;
let hasWarnings = false;

// Cores para output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function logError(message) {
  console.log(`${colors.red}❌ ERRO: ${message}${colors.reset}`);
  hasErrors = true;
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  AVISO: ${message}${colors.reset}`);
  hasWarnings = true;
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

// 1. Verificar arquivos essenciais
console.log(
  `${colors.bold}📁 Verificando arquivos essenciais...${colors.reset}`
);

const essentialFiles = [
  'package.json',
  'index.js',
  'vercel.json',
  'src/app.js',
  'src/db.js',
  '.env.example',
];

essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    logSuccess(`Arquivo ${file} encontrado`);
  } else {
    logError(`Arquivo ${file} não encontrado`);
  }
});

// 2. Verificar package.json
console.log(`\n${colors.bold}📦 Verificando package.json...${colors.reset}`);

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  // Verificar scripts essenciais
  const requiredScripts = ['start', 'build'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      logSuccess(`Script "${script}" configurado`);
    } else {
      logError(`Script "${script}" não encontrado`);
    }
  });

  // Verificar engines
  if (packageJson.engines && packageJson.engines.node) {
    logSuccess(`Node.js version especificada: ${packageJson.engines.node}`);
  } else {
    logWarning('Versão do Node.js não especificada em engines');
  }

  // Verificar dependências críticas
  const criticalDeps = ['express', 'pg', 'sequelize', 'dotenv'];
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      logSuccess(`Dependência ${dep} encontrada`);
    } else {
      logError(`Dependência crítica ${dep} não encontrada`);
    }
  });
} catch (error) {
  logError(`Erro ao ler package.json: ${error.message}`);
}

// 3. Verificar vercel.json
console.log(`\n${colors.bold}⚡ Verificando vercel.json...${colors.reset}`);

try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

  if (vercelConfig.version === 2) {
    logSuccess('Versão do Vercel configurada corretamente');
  } else {
    logError('Versão do Vercel deve ser 2');
  }

  if (vercelConfig.builds && vercelConfig.builds.length > 0) {
    logSuccess('Builds configurados');
  } else {
    logError('Builds não configurados');
  }

  if (vercelConfig.routes && vercelConfig.routes.length > 0) {
    logSuccess('Routes configurados');
  } else {
    logError('Routes não configurados');
  }

  if (vercelConfig.functions && vercelConfig.functions['index.js']) {
    logSuccess('Configurações de function definidas');
  } else {
    logWarning('Configurações de function não definidas');
  }
} catch (error) {
  logError(`Erro ao ler vercel.json: ${error.message}`);
}

// 4. Verificar variáveis de ambiente
console.log(
  `\n${colors.bold}🔐 Verificando variáveis de ambiente...${colors.reset}`
);

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'SESSION_SECRET'];

const recommendedEnvVars = [
  'NODE_ENV',
  'PORT',
  'BCRYPT_SALT_ROUNDS',
  'RATE_LIMIT_MAX',
];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    logSuccess(`${envVar} configurada`);

    // Verificações específicas
    if (envVar === 'JWT_SECRET' && process.env[envVar].length < 32) {
      logWarning(`${envVar} deve ter pelo menos 32 caracteres para segurança`);
    }

    if (envVar === 'SESSION_SECRET' && process.env[envVar].length < 32) {
      logWarning(`${envVar} deve ter pelo menos 32 caracteres para segurança`);
    }

    if (
      envVar === 'DATABASE_URL' &&
      !process.env[envVar].includes('postgresql://')
    ) {
      logError(`${envVar} deve ser uma URL PostgreSQL válida`);
    }
  } else {
    logError(`Variável de ambiente ${envVar} não configurada`);
  }
});

recommendedEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    logSuccess(`${envVar} configurada`);
  } else {
    logWarning(
      `Variável de ambiente ${envVar} recomendada mas não configurada`
    );
  }
});

// 5. Verificar estrutura de diretórios
console.log(
  `\n${colors.bold}📂 Verificando estrutura de diretórios...${colors.reset}`
);

const requiredDirs = [
  'src',
  'src/controllers',
  'src/models',
  'src/routes',
  'src/middleware',
  'src/utils',
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    logSuccess(`Diretório ${dir} encontrado`);
  } else {
    logWarning(`Diretório ${dir} não encontrado`);
  }
});

// 6. Verificar sintaxe dos arquivos principais
console.log(
  `\n${colors.bold}🔍 Verificando sintaxe dos arquivos principais...${colors.reset}`
);

const filesToCheck = ['index.js', 'src/app.js'];

filesToCheck.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      require.resolve(path.resolve(file));
      logSuccess(`Sintaxe de ${file} válida`);
    }
  } catch (error) {
    logError(`Erro de sintaxe em ${file}: ${error.message}`);
  }
});

// 7. Verificar configurações de segurança
console.log(
  `\n${colors.bold}🔒 Verificando configurações de segurança...${colors.reset}`
);

// Verificar se .env não está no git
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (gitignore.includes('.env')) {
    logSuccess('.env está no .gitignore');
  } else {
    logError('.env deve estar no .gitignore para segurança');
  }
} else {
  logWarning('.gitignore não encontrado');
}

// Verificar se há secrets hardcoded
const filesToScan = ['src/app.js', 'index.js'];
filesToScan.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');

    // Padrões suspeitos
    const suspiciousPatterns = [
      /password\s*=\s*['"][^'"]+['"]/i,
      /secret\s*=\s*['"][^'"]+['"]/i,
      /key\s*=\s*['"][^'"]+['"]/i,
      /token\s*=\s*['"][^'"]+['"]/i,
    ];

    let foundSuspicious = false;
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        foundSuspicious = true;
      }
    });

    if (!foundSuspicious) {
      logSuccess(`Nenhum secret hardcoded encontrado em ${file}`);
    } else {
      logWarning(`Possíveis secrets hardcoded encontrados em ${file}`);
    }
  }
});

// 8. Verificar dependências de produção
console.log(`\n${colors.bold}📋 Verificando dependências...${colors.reset}`);

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  // Verificar se há dependências de desenvolvimento em produção
  const devDepsInProd = [];
  if (packageJson.dependencies) {
    Object.keys(packageJson.dependencies).forEach(dep => {
      if (dep.includes('test') || dep.includes('dev') || dep === 'nodemon') {
        devDepsInProd.push(dep);
      }
    });
  }

  if (devDepsInProd.length === 0) {
    logSuccess('Nenhuma dependência de desenvolvimento em produção');
  } else {
    logWarning(
      `Dependências de desenvolvimento em produção: ${devDepsInProd.join(', ')}`
    );
  }
} catch (error) {
  logError(`Erro ao verificar dependências: ${error.message}`);
}

// 9. Resumo final
console.log(`\n${colors.bold}📊 RESUMO DA VERIFICAÇÃO${colors.reset}`);
console.log('='.repeat(50));

if (hasErrors) {
  console.log(
    `${colors.red}${colors.bold}❌ FALHA: Foram encontrados erros críticos que devem ser corrigidos antes do deploy.${colors.reset}`
  );
  process.exit(1);
} else if (hasWarnings) {
  console.log(
    `${colors.yellow}${colors.bold}⚠️  ATENÇÃO: Foram encontrados avisos. O deploy pode prosseguir, mas recomenda-se revisar os itens mencionados.${colors.reset}`
  );
} else {
  console.log(
    `${colors.green}${colors.bold}✅ SUCESSO: Todas as verificações passaram! O projeto está pronto para deploy.${colors.reset}`
  );
}

// 10. Próximos passos
console.log(`\n${colors.bold}🚀 PRÓXIMOS PASSOS PARA DEPLOY:${colors.reset}`);
console.log('1. Configure as variáveis de ambiente na Vercel');
console.log('2. Execute: vercel --prod');
console.log('3. Teste os endpoints após o deploy');
console.log('4. Configure domínio customizado (opcional)');
console.log('5. Configure monitoramento');

console.log(
  `\n${colors.blue}📖 Para instruções detalhadas, consulte: vercel-deploy.md${colors.reset}`
);
