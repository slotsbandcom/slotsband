import { NextResponse } from "next/server"
// static_pages table does not exist — pages are stored in the `pages` table
// Use /api/admin/pages instead
export function GET() { return NextResponse.json({ error: "Use /api/admin/pages" }, { status: 404 }) }
export function POST() { return NextResponse.json({ error: "Use /api/admin/pages" }, { status: 404 }) }
