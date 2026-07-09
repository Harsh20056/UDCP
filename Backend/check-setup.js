#!/usr/bin/env node
/**
 * Quick health check script for UDCP Backend setup
 * Run: node check-setup.js
 */

const fs = require('fs');
const path = require('path');

const checks = [];

// Color codes for terminal output
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  checks.push({
    name: description,
    status: exists ? 'pass' : 'fail',
    message: exists ? `Found: ${filePath}` : `Missing: ${filePath}`,
  });
  return exists;
}

function checkEnvVar(varName) {
  require('dotenv').config();
  const exists = !!process.env[varName];
  checks.push({
    name: `ENV: ${varName}`,
    status: exists ? 'pass' : 'fail',
    message: exists ? `${varName} is set` : `${varName} is missing in .env`,
  });
  return exists;
}

async function checkDatabase() {
  try {
    const { sequelize } = require('./src/models');
    await sequelize.authenticate();
    checks.push({
      name: 'Database Connection',
      status: 'pass',
      message: 'Successfully connected to PostgreSQL',
    });
    
    // Check for PostGIS
    try {
      const [results] = await sequelize.query("SELECT PostGIS_version();");
      checks.push({
        name: 'PostGIS Extension',
        status: 'pass',
        message: `PostGIS installed: ${results[0].postgis_version}`,
      });
    } catch (e) {
      checks.push({
        name: 'PostGIS Extension',
        status: 'fail',
        message: 'PostGIS not found. Run: CREATE EXTENSION IF NOT EXISTS postgis;',
      });
    }
    
    await sequelize.close();
  } catch (err) {
    checks.push({
      name: 'Database Connection',
      status: 'fail',
      message: `Cannot connect: ${err.message}`,
    });
  }
}

console.log('\n🔍 UDCP Backend Setup Check\n');
console.log('='.repeat(60));

// Check required files
console.log('\n📁 Checking Files...\n');
checkFile('.env', '.env configuration file');
checkFile('src/config/database.js', 'Database config');
checkFile('src/models/index.js', 'Models index');
checkFile('src/routes/index.js', 'Routes index');
checkFile('src/services/conflictDetection.service.js', 'Conflict detection service');
checkFile('src/validators/auth.validator.js', 'Auth validators');
checkFile('src/validators/project.validator.js', 'Project validators');

// Check environment variables
console.log('\n🔐 Checking Environment Variables...\n');
checkEnvVar('DATABASE_URL');
checkEnvVar('JWT_SECRET');
checkEnvVar('PORT');
checkEnvVar('CLIENT_URL');

// Check database
console.log('\n🗄️  Checking Database...\n');
checkDatabase().then(() => {
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Results:\n');
  
  let passCount = 0;
  let failCount = 0;
  
  checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
    const color = check.status === 'pass' ? green : check.status === 'warn' ? yellow : red;
    console.log(`${icon} ${color}${check.name}${reset}`);
    console.log(`   ${check.message}`);
    
    if (check.status === 'pass') passCount++;
    if (check.status === 'fail') failCount++;
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n${green}✅ Passed: ${passCount}${reset}`);
  console.log(`${red}❌ Failed: ${failCount}${reset}`);
  
  if (failCount === 0) {
    console.log(`\n${green}🎉 All checks passed! Ready to start the server.${reset}`);
    console.log(`\nRun: ${yellow}npm run migrate && npm run seed && npm run dev${reset}\n`);
  } else {
    console.log(`\n${yellow}⚠️  Please fix the issues above before starting the server.${reset}\n`);
    console.log('See Backend/README.md for setup instructions.\n');
  }
  
  process.exit(failCount > 0 ? 1 : 0);
});
