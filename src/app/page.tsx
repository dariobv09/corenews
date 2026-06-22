import { getLatestNews, getLatestReports } from "@/lib/data";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch initial data on the server
  const noticias = await getLatestNews();
  const informes = await getLatestReports();

  return (
    <main className="flex-1 flex flex-col w-full bg-background min-h-screen">
      <DashboardClient
        initialNoticias={noticias}
        initialInformes={informes}
      />
    </main>
  );
}

