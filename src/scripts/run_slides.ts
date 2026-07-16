import { publishTikTokCarousels } from '../lib/agents/socialPublisher';

async function main() {
  console.log('--- EJECUTANDO GENERACIÓN DE DIAPOSITIVAS TIKTOK ---');
  try {
    const result = await publishTikTokCarousels((msg, type) => {
      const typeStr = type ? type.toUpperCase() : 'INFO';
      console.log(`[${typeStr}] ${msg}`);
    });
    console.log('--- GENERACIÓN CONCLUIDA ---');
    console.log('Resultado:', result);
  } catch (error) {
    console.error('Error durante la generación:', error);
  }
}

main();
