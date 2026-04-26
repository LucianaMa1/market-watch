import { getTargets } from "@/lib/site-data";

export async function GET() {
  return Response.json(getTargets());
}
