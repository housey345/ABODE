import { NextRequest, NextResponse } from "next/server";
import { getProperty } from "@/lib/properties";
import type { Property, POIDistance } from "@/lib/properties";

const LARAVEL_BASE = process.env.LARAVEL_API_BASE_URL;
const API_TOKEN = process.env.ABODE_API_TOKEN;

function metersToMins(m: number): number {
  return Math.max(1, Math.round(m / 80));
}

function nearestPoi(pois: Array<{ name: string; distance_m: number }> | undefined): POIDistance | undefined {
  if (!pois?.length) return undefined;
  const p = pois[0];
  return { name: p.name, km: Math.round(p.distance_m / 100) / 10, mins: metersToMins(p.distance_m) };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Phase 1 fallback
  if (!LARAVEL_BASE || !API_TOKEN) {
    const property = getProperty(parseInt(id));
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
    return NextResponse.json(property);
  }

  const laravelRes = await fetch(`${LARAVEL_BASE}/api/property/${id}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });

  if (!laravelRes.ok) {
    if (laravelRes.status === 404) return NextResponse.json({ error: "Property not found" }, { status: 404 });
    console.error("Laravel property error:", laravelRes.status);
    // Fall back to Phase 1 dataset
    const property = getProperty(parseInt(id));
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
    return NextResponse.json(property);
  }

  const { property: raw, pois } = await laravelRes.json();

  const property: Property = {
    ...raw,
    nearest_school:  nearestPoi(pois?.school),
    nearest_station: nearestPoi(pois?.station),
    nearest_park:    nearestPoi(pois?.park),
  };

  return NextResponse.json(property);
}
