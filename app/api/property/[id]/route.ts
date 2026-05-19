import { NextRequest, NextResponse } from "next/server";
import { getProperty } from "@/lib/properties";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const property = getProperty(parseInt(id));

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json(property);
}
