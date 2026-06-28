import { executeUpdatePipeline } from '../lib/agents/coordinator';

async function main() {
  console.log('--- EJECUTANDO PIPELINE DE NOTICIAS ---');
  try {
    const result = await executeUpdatePipeline();
    console.log('--- PIPELINE CONCLUIDO ---');
    console.log('Resultado:', result);
  } catch (error) {
    console.error('Error durante la ejecución:', error);
  }
}

main();
