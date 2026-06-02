'use client';

import { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const DUREE_PAGE = 30000; // 30 secondes
// 👇 COLLES TON LIEN GOOGLE AGENDA CI-DESSOUS 👇
const URL_AGENDA = "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Europe%2FParis&showPrint=0&src=Z3JvdXBlLWF2aXNpYS5mcl9tdHVrNjYxYmVvbm45cHJlYTg2a2s5a2Y1MEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=ZnIuZnJlbmNoI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&color=%23f4511e&color=%230b8043"; 
// 👇 COLLES TON LIEN GOOGLE DRIVE CI-DESSOUS (bien finir par /preview) 👇
const URL_NEWSLETTER = "https://docs.google.com/presentation/d/e/2PACX-1vQ-JTWgf0gvmE_6ZIN4naoN33O1e6ky6T2YCGwNXnPTMeCHEhiWwFGFzCDPA1bLPxgoBfJXnoX2tH5u/embed?start=true&loop=true&delayms=10000";
const MAX_ITEMS = 12;

function getColumnColors(titre: string) {
  if (titre.startsWith("Nouveau")) {
    return { bg: "bg-blue-50/60", border: "border-blue-200", text: "text-blue-800", badge: "bg-blue-600" };
  }
  if (titre.startsWith("En cours")) {
    return { bg: "bg-orange-50/60", border: "border-orange-200", text: "text-orange-800", badge: "bg-orange-500" };
  }
  if (titre.startsWith("GO")) {
    return { bg: "bg-emerald-50/60", border: "border-emerald-200", text: "text-emerald-800", badge: "bg-emerald-600" };
  }
  if (titre.startsWith("NO GO")) {
    return { bg: "bg-rose-50/60", border: "border-rose-200", text: "text-rose-800", badge: "bg-rose-600" };
  }
  return { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-800", badge: "bg-slate-600" };
}

export default function Dashboard() {
  const [currentView, setCurrentView] = useState(0); // 0=Notion, 1=Agenda, 2=Newsletter
  const [progress, setProgress] = useState(0);
  const [notionData, setNotionData] = useState<any>(null);

  // 1. Récupération des données Notion
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/notion');
        const data = await res.json();
        setNotionData(data);
      } catch (e) {
        console.error("Erreur chargement Notion", e);
      }
    }
    fetchData();
    const intervalNotion = setInterval(fetchData, 900000);
    return () => clearInterval(intervalNotion);
  }, []);

  // 2. Timer de 30 secondes (tourne sur 3 vues maintenant)
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min((elapsed / DUREE_PAGE) * 100, 100);
      setProgress(percent);

      if (elapsed >= DUREE_PAGE) {
        setCurrentView((prev) => (prev === 2 ? 0 : prev + 1));
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [currentView]);

  // --- NOUVEAU : Fonctions pour les flèches manuelles ---
  const handlePrev = () => {
    setCurrentView((prev) => (prev === 0 ? 2 : prev - 1));
    setProgress(0); // Remet la barre bleue à zéro
  };

  const handleNext = () => {
    setCurrentView((prev) => (prev === 2 ? 0 : prev + 1));
    setProgress(0); // Remet la barre bleue à zéro
  };

  const finalBoardData: Record<string, string[]> = {};
  if (notionData) {
    Object.entries(notionData).forEach(([statut, entreprises]: any) => {
      // --- NOUVEAU : Limiter les NO GO aux 5 plus récents ---
      let itemsToDisplay = entreprises;
      if (statut.startsWith("NO GO")) {
        itemsToDisplay = itemsToDisplay.slice(0, 5);
      }

      if (itemsToDisplay.length > MAX_ITEMS) {
        const nbColonnes = Math.ceil(itemsToDisplay.length / MAX_ITEMS);
        for (let i = 0; i < nbColonnes; i++) {
          const chunk = itemsToDisplay.slice(i * MAX_ITEMS, (i + 1) * MAX_ITEMS);
          finalBoardData[`${statut} (${i + 1}/${nbColonnes})`] = chunk;
        }
      } else {
        finalBoardData[statut] = itemsToDisplay;
      }
    });
  }

  // NOUVEAU : Ajout de "relative" dans le className du main pour les flèches flottantes
  return (
    <main className="h-screen bg-white font-sans text-slate-800 overflow-hidden flex flex-col relative">
      
      <div className="h-1 w-full bg-slate-100 flex-shrink-0">
        <div 
          className="h-full bg-[#2634E5] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* ==========================================
          NOUVEAU : BOUTONS FLÉCHÉS FLOTTANTS
          ========================================== */}
      <div className="absolute bottom-6 right-6 flex items-center gap-3 z-50 opacity-30 hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={handlePrev} 
          className="bg-white text-slate-600 hover:bg-[#2634E5] hover:text-white p-3 rounded-full shadow-lg border border-slate-200 transition-colors flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button 
          onClick={handleNext} 
          className="bg-white text-slate-600 hover:bg-[#2634E5] hover:text-white p-3 rounded-full shadow-lg border border-slate-200 transition-colors flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* ==========================================
          VUE 1 : NOTION
          ========================================== */}
      {currentView === 0 && (
        <div className="flex-1 flex flex-col p-4 animate-in fade-in duration-500 min-h-0">
          <header className="mb-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Avisia Logo" className="h-8 object-contain" />
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Suivi Pipe Business</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2 uppercase tracking-wider">Vue 1/3</span>
              <span className="flex h-2 w-2 rounded-full bg-[#2634E5] animate-pulse"></span>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Live Notion</p>
            </div>
          </header>

          <div className="flex-1 flex flex-row gap-4 w-full min-h-0">
            {notionData ? (
              Object.entries(finalBoardData).map(([statut, entreprises]) => {
                const colors = getColumnColors(statut);
                return (
                  <div key={statut} className={`flex-1 rounded-xl p-3 border flex flex-col min-w-0 ${colors.bg} ${colors.border}`}>
                    <div className="flex-shrink-0 flex items-center justify-between mb-3 px-1">
                      <h2 className={`font-bold text-sm tracking-wide uppercase truncate mr-2 ${colors.text}`}>{statut}</h2>
                      <span className={`text-white text-xs py-0.5 px-2 rounded-full font-bold shadow-sm ${colors.badge}`}>{entreprises.length}</span>
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col gap-2 pb-2">
                      {entreprises.map((entreprise: string, index: number) => (
                        <div key={index} className="bg-white p-2.5 rounded-lg shadow-sm border border-slate-100 flex-shrink-0">
                          <p className="font-medium text-sm text-slate-700 truncate">{entreprise}</p>
                        </div>
                      ))}
                      {entreprises.length === 0 && (
                        <div className="text-slate-400 text-xs text-center py-4 border-2 border-dashed border-slate-200 rounded-lg bg-white/50">Aucune offre</div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 font-medium">Chargement des données Notion...</div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          VUE 2 : GOOGLE AGENDA
          ========================================== */}
      {currentView === 1 && (
        <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500 min-h-0 bg-white">
           <div className="bg-white p-2 flex justify-between items-center px-6 border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Avisia Logo" className="h-6 object-contain" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest border-l pl-3">Agenda Agence & Anniversaires</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">Vue 2/3</span>
           </div>
           <iframe src={URL_AGENDA} className="flex-1 w-full border-none" title="Google Agenda" />
        </div>
      )}

      {/* ==========================================
          VUE 3 : NEWSLETTER AVISIA (PDF Drive)
          ========================================== */}
      {currentView === 2 && (
        <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500 min-h-0 bg-slate-100">
           <div className="bg-white p-2 flex justify-between items-center px-6 border-b flex-shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Avisia Logo" className="h-6 object-contain" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest border-l pl-3">La Newsletter Avisia Alpes</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">Vue 3/3</span>
           </div>
           
           <iframe 
            src={URL_NEWSLETTER} 
            className="flex-1 w-full border-none"
            title="Newsletter Avisia"
           />
        </div>
      )}
    </main>
  );
}