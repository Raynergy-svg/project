export const dynamic = "force-static";

import { redirect } from "next/navigation";

export default function AboutPage() {
  redirect("/about");
  return null;
}
