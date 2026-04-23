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
    console.error("Erreur de récupération :", error);
    return {};
  }
}

export default async function Dashboard() {
  const boardData = await getDashboardData();

  return (
    // 1. L'écran entier est verrouillé en hauteur (h-screen) sans défilement global (overflow-hidden)
    <main className="h-screen flex flex-col bg-slate-50 p-4 md:p-6 font-sans text-slate-800 overflow-hidden">
      
      {/* 2. L'en-tête garde sa taille fixe (flex-shrink-0) */}
      <header className="flex-shrink-0 mb-6 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <img src="/logo.png" alt="Avisia Logo" className="h-8 md:h-10 object-contain" />
          <div className="hidden md:block h-10 w-px bg-slate-200"></div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">Suivi Pipe Business</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 rounded-full bg-[#2634E5]"></span>
              <p className="text-xs md:text-sm text-slate-500">Connecté en temps réel à Notion</p>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Le Container de la Grille prend tout l'espace restant (flex-1) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Object.entries(boardData).map(([statut, entreprises]) => (
          
          // 4. Chaque colonne est verrouillée en hauteur (h-full, overflow-hidden)
          <div key={statut} className="bg-slate-200/50 rounded-xl p-4 border border-slate-200/60 flex flex-col h-full overflow-hidden">
            
            <div className="flex-shrink-0 flex items-center justify-between mb-4 px-1">
              <h2 className="font-bold text-sm text-slate-800 tracking-wide uppercase">{statut}</h2>
              <span className="bg-[#2634E5] text-white text-xs py-1 px-2.5 rounded-full font-semibold shadow-sm">
                {/* @ts-ignore */}
                {entreprises.length}
              </span>
            </div>

            {/* 5. C'est ici que ça scrolle ! (overflow-y-auto) */}
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 pb-2">
              {/* @ts-ignore */}
              {entreprises.map((entreprise: any, index: number) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 transition-all duration-200 cursor-default hover:shadow-md hover:border-[#2634E5] hover:-translate-y-0.5 group flex-shrink-0"
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