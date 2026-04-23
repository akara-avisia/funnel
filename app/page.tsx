// app/page.tsx

// 1. LA DATA : Fonction pour récupérer, filtrer et renommer les données
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

    // On définit uniquement tes 4 nouvelles colonnes
    const colonnes = ["Nouveau", "En cours", "GO", "NO GO"];
    const board: Record<string, string[]> = {};
    colonnes.forEach(col => board[col] = []);

    if (!data.results) return board;

    // On trie et on filtre
    data.results.forEach((page: any) => {
      const props = page.properties;
      const nomEntreprise = props['Nom']?.title?.[0]?.plain_text || "Sans nom";
      let statut = props['Phase d’offre']?.status?.name || props['Phase d’offre']?.select?.name || "NEW";
      
      statut = statut.toUpperCase();
      let colonneCible = null;

      // --- TES RÈGLES DE REGROUPEMENT ---
      if (statut === "NEW") {
        colonneCible = "Nouveau";
      } 
      else if (statut === "WIP" || statut === "ON HOLD") {
        colonneCible = "En cours";
      } 
      else if (statut === "WIN") {
        colonneCible = "GO";
      } 
      else if (statut === "LOST" || statut === "REJECTED / OUT") {
        colonneCible = "NO GO";
      }

      // Si l'entreprise correspond à l'une de nos cibles, on l'ajoute.
      // (Les autres comme "OUTSIDE LYON" sont silencieusement ignorées)
      if (colonneCible && board[colonneCible]) {
        board[colonneCible].push(nomEntreprise);
      }
    });

    return board;
  } catch (error) {
    console.error("Erreur de récupération :", error);
    return {};
  }
}

// 2. LE DESIGN : Interface visuelle avec thème AVISIA
export default async function Dashboard() {
  const boardData = await getDashboardData();

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      
      {/* HEADER AVISIA */}
      <header className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img src="/logo.png" alt="Avisia Logo" className="h-10 object-contain" />
          <div className="h-10 w-px bg-slate-200"></div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Suivi Pipe Business</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 rounded-full bg-[#2634E5]"></span>
              <p className="text-sm text-slate-500">Connecté en temps réel à Notion via API</p>
            </div>
          </div>
        </div>
      </header>

      {/* LE BOARD Kanban (Maintenant sur 4 colonnes claires) */}
      <div className="flex gap-6 overflow-x-auto pb-8 items-start">
        {Object.entries(boardData).map(([statut, entreprises]) => (
          
          <div key={statut} className="bg-slate-200/50 rounded-xl p-4 min-w-[320px] w-[320px] flex-shrink-0 border border-slate-200/60">
            
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="font-bold text-sm text-slate-800 tracking-wide uppercase">{statut}</h2>
              <span className="bg-[#2634E5] text-white text-xs py-1 px-2.5 rounded-full font-semibold shadow-sm">
                {/* @ts-ignore */}
                {entreprises.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* @ts-ignore */}
              {entreprises.map((entreprise, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 transition-all duration-200 cursor-default hover:shadow-md hover:border-[#2634E5] hover:-translate-y-0.5 group"
                >
                  <p className="font-medium text-slate-700 group-hover:text-[#2634E5] transition-colors">{entreprise}</p>
                </div>
              ))}
              
              {/* @ts-ignore */}
              {entreprises.length === 0 && (
                <div className="text-slate-400 text-sm text-center py-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50">
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