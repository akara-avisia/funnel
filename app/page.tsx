// app/page.tsx

async function getDashboardData() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const secret = process.env.NOTION_SECRET;

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const data = await response.json();

    const colonnes = ["Nouveau", "En cours", "GO", "NO GO"];
    const board: Record<string, string[]> = {};
    colonnes.forEach(col => board[col] = []);

    if (!data.results) return board;

    data.results.forEach((page: any) => {
      const props = page.properties;
      const nomEntreprise = props['Nom']?.title?.[0]?.plain_text || "Sans nom";
      let statut = props['Phase d’offre']?.status?.name || props['Phase d’offre']?.select?.name || "NEW";
      
      statut = statut.toUpperCase();
      let colonneCible = null;

      if (statut === "NEW") {
        colonneCible = "Nouveau";
      } else if (statut === "WIP" || statut === "ON HOLD") {
        colonneCible = "En cours";
      } else if (statut === "WIN") {
        colonneCible = "GO";
      } else if (statut === "LOST" || statut === "REJECTED / OUT") {
        colonneCible = "NO GO";
      }

      if (colonneCible && board[colonneCible]) {
        board[colonneCible].push(nomEntreprise);
      }
    });

    return board;
  } catch (error) {
    console.error("Erreur :", error);
    return {};
  }
}

export default async function Dashboard() {
  const boardData = await getDashboardData();

  return (
    // overflow-hidden bloque le scroll global de la page entière
    <main className="h-screen bg-slate-50 p-4 font-sans text-slate-800 overflow-hidden">
      
      {/* HEADER : Plus compact pour gagner de la place verticale */}
      <header className="mb-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Avisia Logo" className="h-8 object-contain" />
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Suivi Pipe Business</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#2634E5] animate-pulse"></span>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Live Notion</p>
        </div>
      </header>

      {/* LE BOARD Kanban : 4 colonnes */}
      <div className="grid grid-cols-4 gap-4 w-full">
        {Object.entries(boardData).map(([statut, entreprises]) => (
          
          <div 
            key={statut} 
            // C'EST ICI LA MAGIE : La colonne s'adapte au millimètre près à ton écran
            className="bg-slate-200/50 rounded-xl p-3 border border-slate-200/60 flex flex-col h-[calc(100vh-110px)]"
          >
            
            <div className="flex-shrink-0 flex items-center justify-between mb-3 px-1">
              <h2 className="font-bold text-sm text-slate-800 tracking-wide uppercase">{statut}</h2>
              <span className="bg-[#2634E5] text-white text-xs py-0.5 px-2 rounded-full font-bold shadow-sm">
                {/* @ts-ignore */}
                {entreprises.length}
              </span>
            </div>

            {/* Liste des entreprises : Plus compacte (gap-2, p-2.5) */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 pb-2">
              {/* @ts-ignore */}
              {entreprises.map((entreprise: any, index: number) => (
                <div
                  key={index}
                  className="bg-white p-2.5 rounded-lg shadow-sm border border-slate-200 flex-shrink-0"
                >
                  <p className="font-medium text-sm text-slate-700">{entreprise}</p>
                </div>
              ))}
              
              {/* @ts-ignore */}
              {entreprises.length === 0 && (
                <div className="text-slate-400 text-xs text-center py-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                  Aucune offre
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}