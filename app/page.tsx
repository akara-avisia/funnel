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
    <main className="h-screen flex flex-col bg-slate-50 p-4 font-sans text-slate-800 overflow-hidden">
      
      {/* Header plus compact pour laisser de la place aux données */}
      <header className="flex-shrink-0 mb-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Avisia Logo" className="h-8 object-contain" />
          <div className="h-8 w-px bg-slate-200"></div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Suivi Pipe Business</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#2634E5] animate-pulse"></span>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Live Notion</p>
        </div>
      </header>

      {/* GRILLE EN 2 COLONNES (2 blocs à gauche, 2 blocs à droite) */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        
        {/* COLONNE GAUCHE : Nouveau & En cours */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <CategoryBlock title="Nouveau" items={boardData["Nouveau"]} color="bg-blue-500" />
          <CategoryBlock title="En cours" items={boardData["En cours"]} color="bg-orange-500" />
        </div>

        {/* COLONNE DROITE : GO & NO GO */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <CategoryBlock title="GO" items={boardData["GO"]} color="bg-emerald-500" />
          <CategoryBlock title="NO GO" items={boardData["NO GO"]} color="bg-rose-500" />
        </div>

      </div>
    </main>
  );
}

// Composant pour chaque bloc de catégorie
function CategoryBlock({ title, items, color }: { title: string, items: string[], color: string }) {
  return (
    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-4 ${color} rounded-full`}></div>
          <h2 className="font-bold text-sm text-slate-700 uppercase tracking-wide">{title}</h2>
        </div>
        <span className="bg-slate-200 text-slate-700 text-xs py-0.5 px-2 rounded-md font-bold">
          {items.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-1 gap-2">
          {items.map((item, index) => (
            <div key={index} className="bg-white p-3 rounded-lg border border-slate-150 shadow-sm hover:border-[#2634E5] transition-colors">
              <p className="text-sm font-semibold text-slate-700">{item}</p>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-slate-400 text-xs py-4 italic">Aucun élément</p>
          )}
        </div>
      </div>
    </div>
  );
}