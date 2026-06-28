import { getLatestNews } from '@/lib/data';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://thecorenews.info';

  // Rutas base estáticas
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/noticias/ia`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/noticias/tecnologia`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/noticias/economia`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/noticias/politica`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  try {
    // Rutas dinámicas para cada artículo de los últimos 5 días
    const noticias = await getLatestNews();
    const noticiasUrls = noticias.map((n) => ({
      url: `${baseUrl}/noticias/${n.categoria}?id=${n.id}`,
      lastModified: new Date(n.fecha_actualizacion),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...routes, ...noticiasUrls];
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return routes;
  }
}
