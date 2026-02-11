import Anthropic from "@anthropic-ai/sdk";
import { TriadAnalysis } from "./types";

const TRIAD_SYSTEM_PROMPT = `Si analitik novic, ki deluje po principu triade (teza-antiteza-sinteza).

Tvoja naloga je:
1. Preberi novico (naslov + povzetek)
2. Identificiraj TEZO — glavno trditev ali perspektivo novice
3. Identificiraj ANTITEZO — nasprotno perspektivo, kritiko ali senčno plat
4. Oblikuj SINTEZO — višjo perspektivo, ki harmonizira obe strani in služi človeštvu
5. Ustvari nov naslov, ki odraža sintezo — konstruktiven, uravnotežen, človeštvu usmerjen
6. Oceni "harmony score" (0-100) — kako blizu je tema harmonični resoluciji
7. Oblikuj ključni uvid — en stavek, ki zajame bistvo sinteze

PRAVILA:
- Piši v slovenščini (razen če je članek v angleščini — takrat piši angleško, a generiraj tudi slovensko sintezo)
- Bodi specifičen, ne generičen
- Sinteza NI kompromis — je VIŠJA perspektiva
- Ne moraliziraj — pokaži pot do razumevanja
- Uporabi triado za odkrivanje globljega smisla, ne za obsojanje
- Ključni uvid mora biti konkreten in akcijski

Odgovori VEDNO v JSON formatu:

{
  "transformed_title": "Nov naslov, ki odraža sintezo",
  "category": "Svet|Tehnologija|Okolje|Družba|Ekonomija|Politika|Kultura|Zdravje",
  "thesis": {
    "label": "Teza — [kratka oznaka, 1-2 besedi]",
    "text": "2-3 stavki, ki opisujejo tezo"
  },
  "antithesis": {
    "label": "Antiteza — [kratka oznaka]",
    "text": "2-3 stavki, ki opisujejo antitezo"
  },
  "synthesis": {
    "label": "Sinteza — Harmonija",
    "text": "3-4 stavki, ki opisujejo sintezo in kako služi človeštvu"
  },
  "key_insight": "En stavek — ključni uvid iz sinteze",
  "harmony_score": 72
}`;

export async function analyzeArticle(
  title: string,
  summary: string,
  sourceId: string,
  sourceBias?: string
): Promise<TriadAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY ni nastavljen");
  }

  const client = new Anthropic({ apiKey });

  const userPrompt = `Analiziraj to novico s triadno metodo:

VIR: ${sourceId}${sourceBias ? ` (${sourceBias})` : ""}
NASLOV: ${title}
POVZETEK: ${summary || "Ni povzetka — analiziraj na podlagi naslova."}

Vrni JSON.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 1500,
    system: TRIAD_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude ni vrnil veljavnega JSON");

  const parsed = JSON.parse(jsonMatch[0]) as TriadAnalysis;

  // Validate required fields
  if (!parsed.transformed_title || !parsed.thesis || !parsed.antithesis || !parsed.synthesis) {
    throw new Error("Nepopolna triadic analiza");
  }
  if (typeof parsed.harmony_score !== "number") {
    parsed.harmony_score = 50;
  }
  parsed.harmony_score = Math.max(0, Math.min(100, parsed.harmony_score));

  return parsed;
}
