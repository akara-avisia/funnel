'use client'; // On passe en mode interactif pour le timer

import { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const DUREE_PAGE = 30000; // 30 secondes
const URL_MYAVISIA = "https://myavisia.elium.com/";

export default function App() {
  const [currentView, setCurrentView] = useState(0); // 0 = Notion, 1 = MyAvisia
  const [progress, setProgress] = useState(0);
  const [notionData, setNotionData] = useState<any>(null);

  // 1. Récupération des données Notion (côté client pour le test)
  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/notion'); // On va créer cette petite route juste après
      const data = await res.json();
      setNotionData(data);
    }
    fetchData();
    // Rafraîchir les données Notion toutes les 15 minutes
    const intervalNotion = setInterval(fetchData, 900000);
    return () => clearInterval(intervalNotion);
  }, []);

  // 2. Logique du Timer de 30 secondes
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min((elapsed / DUREE_PAGE) * 100, 100);
      setProgress(percent);

      if (elapsed >= DUREE_PAGE) {
        setCurrentView((prev) => (prev === 0 ? 1 : 0));
        setProgress(0);
      }
    }, 100); // Mise à jour fluide de la barre de progression

    return () => clearInterval(timer);
  }, [currentView]);

  return (
    <main className="h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden flex flex-col">
      
      {/* BARRE DE PROGRESSION DISCRÈTE TOUT EN HAUT */}
      <div className="h-1 w-full bg-slate-200 flex-shrink-0">
        <div 
          className="h-full bg-[#2634E5] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* VUE 1 : LE DASHBOARD NOTION */}
      {currentView === 0 && (
        <div className="flex-1 flex flex-col p-4 animate-in fade-in duration-500">
           {/* On réutilise ton header et ton board ici */}
           <header className="mb-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Logo" className="h-8 object-contain" />
              <h1 className="text-xl font-extrabold text-slate-900 uppercase">Pipe Business</h1>
            </div>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">VUE 1/2 : NOTION</span>
          </header>

          <div className="flex-1 flex gap-4 overflow-hidden">
            {notionData ? (
               Object.entries(notionData).map(([statut, entreprises]: any) => (
                <div key={statut} className="flex-1 bg-slate-200/50 rounded-xl p-3 flex flex-col border border-slate-200/60">
                  <h2 className="font-bold text-xs uppercase mb-3 text-slate-500">{statut}</h2>
                  <div className="flex flex-col gap-2 overflow-y-auto">
                    {entreprises.map((e: string, i: number) => (
                      <div key={i} className="bg-white p-2 rounded shadow-sm text-sm font-semibold">{e}</div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">Chargement Notion...</div>
            )}
          </div>
        </div>
      )}

      {/* VUE 2 : MY AVISIA (IFRAME) */}
      {currentView === 1 && (
        <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
           <div className="bg-white p-2 flex justify-between items-center px-6 border-b">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">VUE 2/2 : Actualités MyAvisia</p>
              <p className="text-[10px] text-slate-300 italic">Connectez-vous directement sur l'écran si besoin</p>
           </div>
           <iframe 
            src={URL_MYAVISIA} 
            className="flex-1 w-full border-none"
            title="MyAvisia"
           />
        </div>
      )}
    </main>
  );
}