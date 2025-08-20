// scripts/validate-setup.js
// Environment validation script for AiSchool

const fs = require('fs');
const path = require('path');

console.log('🔍 AiSchool Environment Validation\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Make sure you\'re in the AiSchool project directory.');
  process.exit(1);
}

// Read package.json to verify project
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== 'aischool') {
  console.error('❌ Error: This doesn\'t appear to be the AiSchool project.');
  process.exit(1);
}

console.log('✅ Project directory validated');

// Check for required files
const requiredFiles = [
  '.env.example',
  'prisma/schema.prisma',
  'src/app/page.tsx',
  'src/lib/auth.ts',
  'src/lib/db.ts',
  'sample-curriculum.json'
];

console.log('\n📁 Checking required files:');
let missingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error(`\n❌ Missing ${missingFiles.length} required files. Please ensure all files are present.`);
  process.exit(1);
}

// Check environment variables
console.log('\n🔧 Checking environment configuration:');

const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Please create one based on .env.example');
  console.log('   Run: cp .env.example .env');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'OPENAI_API_KEY'
];

let missingEnvVars = [];

requiredEnvVars.forEach(envVar => {
  if (envContent.includes(`${envVar}=`) && !envContent.includes(`${envVar}="your-`)) {
    console.log(`✅ ${envVar}`);
  } else {
    console.log(`❌ ${envVar} - NOT SET OR PLACEHOLDER`);
    missingEnvVars.push(envVar);
  }
});

if (missingEnvVars.length > 0) {
  console.error(`\n❌ ${missingEnvVars.length} environment variables need to be configured:`);
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.log('\nPlease update your .env file with actual values.');
  process.exit(1);
}

// Check node_modules
console.log('\n📦 Checking dependencies:');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules directory exists');
  
  // Check for key dependencies
  const keyDeps = ['next', 'react', 'prisma', '@prisma/client', 'next-auth'];
  keyDeps.forEach(dep => {
    if (fs.existsSync(`node_modules/${dep}`)) {
      console.log(`✅ ${dep} installed`);
    } else {
      console.log(`❌ ${dep} - NOT INSTALLED`);
    }
  });
} else {
  console.log('❌ node_modules not found. Run: npm install');
  process.exit(1);
}

// Check Prisma client
console.log('\n🗄️  Checking Prisma setup:');
if (fs.existsSync('node_modules/.prisma/client')) {
  console.log('✅ Prisma client generated');
} else {
  console.log('❌ Prisma client not generated. Run: npx prisma generate');
}

// Check build directory
console.log('\n🏗️  Checking build status:');
if (fs.existsSync('.next')) {
  console.log('✅ Next.js build cache exists');
} else {
  console.log('ℹ️  No build cache found (normal for first setup)');
}

console.log('\n🎉 Environment validation complete!');
console.log('\nNext steps:');
console.log('1. Ensure your database is running');
console.log('2. Run: npx prisma migrate deploy');
console.log('3. Run: npm run dev');
console.log('4. Open: http://localhost:3000');

console.log('\n📚 For detailed setup instructions, see USER_TESTING_GUIDE.md');

