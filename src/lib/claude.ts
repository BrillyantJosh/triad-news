import { TriadAnalysis } from "./types";

const TRIAD_SYSTEM_PROMPT = `Si transformativni novinar, ki preoblikuje novice po principu triade (teza-antiteza-sinteza).

Tvoja naloga je:
1. Preberi celoten članek (naslov + vsebina)
2. Identificiraj TEZO — glavno trditev ali perspektivo novice
3. Identificiraj ANTITEZO — nasprotno perspektivo, kritiko ali senčno plat
4. Oblikuj SINTEZO — višjo perspektivo, ki harmonizira obe strani in služi človeštvu
5. Ustvari nov naslov, ki odraža sintezo — konstruktiven, uravnotežen, človeštvu usmerjen
6. PREPIŠI CELOTEN ČLANEK — ohrani vsa dejstva, a spremeni energijo, ton in perspektivo v konstruktivno, harmonično smer. Članek mora biti enake dolžine kot original ali daljši. Piši v odstavkih (loči z \\n\\n).
7. Oceni "harmony score" (0-100)
8. Oblikuj ključni uvid — en stavek

PRAVILA ZA PREOBLIKOVAN ČLANEK:
- Ohrani VSA dejstva in podatke iz originala
- Spremeni ton iz senzacionalističnega/negativnega v konstruktivnega
- Dodaj kontekst, perspektivo in globino
- Namesto strahu pokaži priložnosti za rast
- Namesto obsojanja pokaži razumevanje
- Namesto polarizacije pokaži skupne interese
- Piši tekoče, novinarski, a s toplino in modrostjo
- Jezik: slovenščina za SLO vire, angleščina za EN vire

Odgovori VEDNO v JSON formatu:

{
  "transformed_title": "Nov naslov, ki odraža sintezo",
  "transformed_content": "Celoten preoblikovan članek v več odstavkih, ločenih z \\n\\n. Ohrani vsa dejstva a spremeni energijo.",
  "category": "Svet|Tehnologija|Okolje|Družba|Ekonomija|Politika|Kultura|Zdravje",
  "thesis": {
    "label": "Teza — [kratka oznaka, 1-2 besedi]",
    "text": "2-3 stavki"
  },
  "antithesis": {
    "label": "Antiteza — [kratka oznaka]",
    "text": "2-3 stavki"
  },
  "synthesis": {
    "label": "Sinteza — Harmonija",
    "text": "3-4 stavki"
  },
  "key_insight": "En stavek — ključni uvid",
  "harmony_score": 72
}`;

const TRIAD_SYSTEM_PROMPT_SHORT = `Si transformativni novinar, ki preoblikuje novice po principu triade (teza-antiteza-sinteza).

Ker nimaš celotne vsebine članka, naredi analizo na podlagi naslova in povzetka.
Ustvari tudi kratek preoblikovan članek (3-5 odstavkov) na podlagi razpoložljivih informacij.

Pravila:
- Ohrani dejstva, spremeni ton v konstruktivnega
- Piši v slovenščini za SLO vire, angleščini za EN vire
- Namesto strahu pokaži priložnosti, namesto obsojanja razumevanje

Odgovori VEDNO v JSON formatu:

{
  "transformed_title": "Nov naslov, ki odraža sintezo",
  "transformed_content": "Preoblikovan članek v odstavkih, ločenih z \\n\\n",
  "category": "Svet|Tehnologija|Okolje|Družba|Ekonomija|Politika|Kultura|Zdravje",
  "thesis": {
    "label": "Teza — [kratka oznaka]",
    "text": "2-3 stavki"
  },
  "antithesis": {
    "label": "Antiteza — [kratka oznaka]",
    "text": "2-3 stavki"
  },
  "synthesis": {
    "label": "Sinteza — Harmonija",
    "text": "3-4 stavki"
  },
  "key_insight": "En stavek",
  "harmony_score": 72
}`;

export async function analyzeArticle(
  title: string,
  summary: string,
  sourceId: string,
  sourceBias?: string,
  fullContent?: string
): Promise<TriadAnalysis> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY ni nastavljen");
  }

  const hasFullContent = fullContent && fullContent.length > 100;

  const systemPrompt = hasFullContent
    ? TRIAD_SYSTEM_PROMPT
    : TRIAD_SYSTEM_PROMPT_SHORT;

  const userPrompt = hasFullContent
    ? `Preoblikuj ta članek s triadno metodo. Prepiši ga v celoti s konstruktivno energijo.

VIR: ${sourceId}${sourceBias ? ` (${sourceBias})` : ""}
NASLOV: ${title}

CELOTNA VSEBINA ČLANKA:
${fullContent}

Vrni JSON.`
    : `Analiziraj to novico s triadno metodo in ustvari preoblikovan članek:

VIR: ${sourceId}${sourceBias ? ` (${sourceBias})` : ""}
NASLOV: ${title}
POVZETEK: ${summary || "Ni povzetka — analiziraj na podlagi naslova."}

Vrni JSON.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API napaka (${response.status}): ${err}`);
  }

  const data = await response.json();

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini ni vrnil odgovora");
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini ni vrnil veljavnega JSON");

  const parsed = JSON.parse(jsonMatch[0]) as TriadAnalysis;

  if (
    !parsed.transformed_title ||
    !parsed.thesis ||
    !parsed.antithesis ||
    !parsed.synthesis
  ) {
    throw new Error("Nepopolna triadic analiza");
  }
  if (!parsed.transformed_content) {
    parsed.transformed_content = "";
  }
  if (typeof parsed.harmony_score !== "number") {
    parsed.harmony_score = 50;
  }
  parsed.harmony_score = Math.max(0, Math.min(100, parsed.harmony_score));

  return parsed;
}
