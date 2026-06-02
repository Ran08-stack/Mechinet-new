import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

// תובנה ארצית קצרה (1-2 משפטים) על מצב הגיוס במועצה.
// קלט: אגרגציה בלבד — אין מידע על מועמדים פרטניים.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const totalCandidates: number = body.totalCandidates ?? 0
    const totalAcademies: number = body.totalAcademies ?? 0
    const avgProgress: number = body.avgProgress ?? 0
    const breakdown = body.breakdown ?? {}

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey })

    const prompt = `נתונים ארציים על מערכת מכינות קדם-צבאיות לשנה הנוכחית:
- סה"כ מכינות: ${totalAcademies}
- סה"כ מועמדים: ${totalCandidates}
- ממוצע התקדמות גיוס: ${avgProgress}% (יעד 90%)
- פילוח: ${JSON.stringify(breakdown)}

כתוב תובנה קצרה בעברית של 1-2 משפטים בלבד למנכ"ל המועצה. ענייני, ללא ז'רגון, ללא אמוג'ים, ללא מילים לועזיות. רק עברית.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "אתה אנליסט נתונים שמדבר אך ורק בעברית. תמציתי, ענייני." },
        { role: "user", content: prompt },
      ],
      max_tokens: 180,
      temperature: 0.4,
    })

    const insight = response.choices[0]?.message?.content?.trim() ?? null
    if (!insight) {
      return NextResponse.json({ error: "ללא תוצאה" }, { status: 500 })
    }
    return NextResponse.json({ insight })
  } catch (error) {
    console.error("council-insight error:", error)
    return NextResponse.json({ error: "שגיאה" }, { status: 500 })
  }
}
