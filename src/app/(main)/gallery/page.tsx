import { createClient } from "@/utils/supabase/server";
import { GalleryPageClient } from "@/components/GalleryPageClient";

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: images } = await supabase.from("gallery").select("*").eq("is_active", true).order("display_order");
  return <GalleryPageClient images={images || []} />;
}