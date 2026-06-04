import { NextResponse } from 'next/server';

export async function GET() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const secret = process.env.NOTION_SECRET;

  // NOUVEAU : On ajoute un "body" pour forcer Notion à trier du plus récent au plus ancien
  const bodyParams = JSON.stringify({
    sorts: [
      {
        timestamp: "last_edited_time",
        direction: "descending"
      }
    ]
  });

  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secret}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: bodyParams
  });

  const data = await response.json();
  
  const colonnes = ["Nouveau", "En cours", "GO", "NO GO"];
  const board: any = {};
  colonnes.forEach(col => board[col] = []);

  data.results?.forEach((page: any) => {
    const props = page.properties;
    
    // 1. On récupère le nom (et on ignore s'il est vide)
    const nom = props['Nom']?.title?.[0]?.plain_text;
    if (!nom) return; 

    // 2. On récupère le statut brut
    const statutBrut = props['Phase d’offre']?.status?.name || props['Phase d’offre']?.select?.name;
    
    // CORRECTION MAJEURE : S'il n'y a pas de statut, on ignore cette entreprise. Fini les lignes "sorties de nulle part" !
    if (!statutBrut) return; 
    
    const statut = statutBrut.toUpperCase();
    
    // 3. On élargit les mots-clés pour que ça marche en français ET en anglais
    let cible = null;
    if (statut === "NEW" || statut === "NOUVEAU") cible = "Nouveau";
    else if (statut === "WIP" || statut === "ON HOLD" || statut === "EN COURS") cible = "En cours";
    else if (statut === "WIN" || statut === "GO") cible = "GO";
    else if (statut === "LOST" || statut === "REJECTED / OUT" || statut === "NO GO") cible = "NO GO";

    // 4. On range l'entreprise dans la bonne boîte
    if (cible) board[cible].push(nom);
  });

  return NextResponse.json(board);
}