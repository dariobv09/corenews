import fs from 'fs';
import path from 'path';
import { Categoria } from '../types';

const CATEGORY_IMAGES: Record<Categoria, string[]> = {
  ia: [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1024&auto=format&fit=crop&q=80'
  ],
  tecnologia: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?w=1024&auto=format&fit=crop&q=80'
  ],
  economia: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1024&auto=format&fit=crop&q=80'
  ],
  politica: [
    'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1024&auto=format&fit=crop&q=80'
  ]
};

async function main() {
  const filePath = path.join(process.cwd(), 'src/lib/mockStore_data.json');
  if (!fs.existsSync(filePath)) {
    console.log('No se encontró mockStore_data.json');
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  let updatedCount = 0;
  if (Array.isArray(data.noticias)) {
    data.noticias = data.noticias.map((n: any, i: number) => {
      const cat = (n.categoria || 'ia') as Categoria;
      const images = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.ia;
      const imgUrl = images[i % images.length];

      updatedCount++;
      return {
        ...n,
        imagen_url: n.imagen_url || imgUrl,
        author_name: n.author_name || 'Darío Balado'
      };
    });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ Se actualizaron ${updatedCount} noticias con imágenes editoriales y autor.`);
}

main();
