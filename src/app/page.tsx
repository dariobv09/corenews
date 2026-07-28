import { getLatestNews, getLatestReports } from "@/lib/data";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch initial data on the server
  const noticias = await getLatestNews();
  const informes = await getLatestReports();

  let slidesMap: Record<string, string> = {};
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data: slides } = await supabaseAdmin
        .from('carousel_slides')
        .select('noticia_id, image_url');
      if (slides) {
        slides.forEach((s) => {
          if (s.noticia_id && s.image_url) {
            slidesMap[s.noticia_id] = s.image_url;
          }
        });
      }
    } catch (e) {
      console.error('Error fetching slides map for homepage:', e);
    }
  }

  return (
    <main className="flex-1 flex flex-col w-full bg-background min-h-screen">
      <DashboardClient
        initialNoticias={noticias}
        initialInformes={informes}
        initialSlidesMap={slidesMap}
      />
    </main>
  );
}
