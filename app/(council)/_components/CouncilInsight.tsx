import { unstable_cache } from "next/cache"
import { Sparkles } from "lucide-react"
import { CouncilInsightActions } from "./CouncilInsightActions"

// תובנת AI ארצית — server component עם cache של 6 שעות.
// fallback אם OpenAI לא זמין / מפתח חסר.

type Inputs = {
  totalCandidates: number
  totalAcademies: number
  avgProgress: number
  breakdown: Record<string, number>
  hebrewYear: string
}

async function fetchInsight(inputs: Inputs): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error("no key")
    const OpenAI = (await import("openai")).default
    const openai = new OpenAI({ apiKey })
    const prompt = `נתונים ארציים על מערכת מכינות קדם-צבאיות:
- מכינות: ${inputs.totalAcademies}, מועמדים: ${inputs.totalCandidates}
- ממוצע התקדמות גיוס: ${inputs.avgProgress}% (יעד 90%)
- פילוח: ${JSON.stringify(inputs.breakdown)}

כתוב תובנה קצרה בעברית של 1-2 משפטים למנכ"ל המועצה. ענייני, ללא מילים לועזיות.`
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "אנליסט שמדבר אך ורק בעברית. תמציתי." },
        { role: "user", content: prompt },
      ],
      max_tokens: 180,
      temperature: 0.4,
    })
    const text = response.choices[0]?.message?.content?.trim()
    if (!text) throw new Error("empty")
    return text
  } catch {
    return `סך ${inputs.totalCandidates.toLocaleString()} מועמדים רשומים על פני ${inputs.totalAcademies} מכינות. ממוצע התקדמות הגיוס עומד על ${inputs.avgProgress}% — היעד הארצי 90%. מומלץ לבחון הקצאת משאבים נוספת למכינות עם נפח רישום גבוה ושיעור התקדמות נמוך.`
  }
}

// cache 6 שעות לפי hash של הקלט (revalidate=21600)
const cachedInsight = unstable_cache(
  async (inputs: Inputs) => fetchInsight(inputs),
  ["council-insight-v1"],
  { revalidate: 21600, tags: ["council-insight"] }
)

export async function CouncilInsight(props: Inputs) {
  const insight = await cachedInsight(props)
  return (
    <div
      className="relative mt-2 overflow-hidden rounded-lg border border-[var(--ai-line)] p-[20px_22px]"
      style={{ background: "linear-gradient(135deg, var(--ai-soft), #d4f5e9)" }}
    >
      <div
        className="pointer-events-none absolute -start-12 -top-12 h-[180px] w-[180px]"
        style={{ background: "radial-gradient(circle, rgba(0,165,142,0.18), transparent 60%)" }}
      />
      <div className="relative flex items-start gap-3.5">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[var(--ai)] text-white">
          <Sparkles className="h-[18px] w-[18px]" />
        </div>
        <div>
          <h3 className="m-0 mb-1.5 text-[15px] font-semibold text-[var(--ai-deep)]">
            תובנה ארצית · רישום {props.hebrewYear}
          </h3>
          <p className="m-0 mb-2 max-w-[80ch] text-[13px] leading-[1.65] text-[var(--ai-deep)] opacity-85">
            {insight}
          </p>
          <CouncilInsightActions />
        </div>
      </div>
    </div>
  )
}
