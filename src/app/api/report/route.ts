import { getLatestReport } from "@/lib/site-data";

export async function GET() {
  return Response.json(getLatestReport());
}
