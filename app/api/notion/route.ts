// app/api/notion/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const secret = process.env.NOTION_SECRET;

  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secret}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  
  // Ici on remet ta logique de tri simplifiée
  const colonnes = ["Nouveau", "En cours", "GO", "NO GO"];
  const board: any = {};
  colonnes.forEach(col => board[col] = []);

  data.results?.forEach((page: any) => {
    const props = page.properties;
    const nom = props['Nom']?.title?.[0]?.plain_text || "Sans nom";
    let statut = props['Phase d’offre']?.status?.name || props['Phase d’offre']?.select?.name || "NEW";
    statut = statut.toUpperCase();
    
    let cible = null;
    if (statut === "NEW") cible = "Nouveau";
    else if (statut === "WIP" || statut === "ON HOLD") cible = "En cours";
    else if (statut === "WIN") cible = "GO";
    else if (statut === "LOST" || statut === "REJECTED / OUT") cible = "NO GO";

    if (cible) board[cible].push(nom);
  });

  return NextResponse.json(board);
}