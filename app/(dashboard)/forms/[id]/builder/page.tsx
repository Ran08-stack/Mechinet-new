import { createClient } from "@/lib/supabase/server"
import FormBuilder from "@/components/forms/FormBuilder"

export default async function BuilderPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  let form = null
  let submissionCount = 0

  if (params.id !== "new") {
    const { data } = await supabase
      .from("forms")
      .select("*")
      .eq("id", params.id)
      .single()
    form = data

    const { count } = await supabase
      .from("candidates")
      .select("id", { count: "exact", head: true })
      .eq("form_id", params.id)
    submissionCount = count ?? 0
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: userData } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user!.id)
    .single()

  return (
    <FormBuilder
      form={form}
      organizationId={userData?.organization_id ?? ""}
      submissionCount={submissionCount}
    />
  )
}
