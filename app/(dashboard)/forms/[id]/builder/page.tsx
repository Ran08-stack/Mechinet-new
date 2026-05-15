import { createClient } from "@/lib/supabase/server"
import FormBuilder from "@/components/forms/FormBuilder"

export default async function BuilderPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  let form = null

  if (params.id !== "new") {
    const { data } = await supabase
      .from("forms")
      .select("*")
      .eq("id", params.id)
      .single()
    form = data
  }

  // שולף את ה-organization_id של המשתמש
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user!.id)
    .single()

  return (
    <FormBuilder
      form={form}
      organizationId={userData?.organization_id ?? ""}
    />
  )
}
