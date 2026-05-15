import OpenAI from "openai"

let _openai: OpenAI | null = null
function getClient(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error("OPENAI_API_KEY missing")
    _openai = new OpenAI({ apiKey })
  }
  return _openai
}

export async function generateCandidateSummary(
  candidateName: string,
  answers: Record<string, unknown>
): Promise<string> {
  const openai = getClient()
  const answersText = Object.entries(answers)
    .map(([question, answer]) => `${question}: ${answer}`)
    .join("\n")

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `אתה עוזר למנהלי מכינות קדם-צבאיות בישראל לסכם מועמדים.
סכם את המועמד בצורה קצרה, ברורה, ובעברית.
הפלט צריך לכלול:
1. נקודות חוזק (2-3)
2. נקודות לשים לב (1-2)
3. רושם כללי (משפט אחד)
אל תקבל החלטות — רק סכם.`,
      },
      {
        role: "user",
        content: `שם המועמד: ${candidateName}\n\nתשובות לטופס:\n${answersText}`,
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
  })

  return response.choices[0]?.message?.content ?? "לא ניתן לייצר סיכום"
}
