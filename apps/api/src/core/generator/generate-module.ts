import { generateModule } from './generator.js';

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('❌ Error: Harap masukkan nama module!');
  console.log('Contoh: npm run generate:module nama-module');
  process.exit(1);
}

generateModule(moduleName)
  .then((moduleDirectory) => {
    console.log(`Module files are ready in ${moduleDirectory}`);
    console.log(
      'Register the module factory in apps/api/src/bootstrap.ts to enable its routes and OpenAPI documentation.'
    );
  })
  .catch((error: unknown) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
