import { NextResponse } from "next/server"
// static_pages table does not exist — pages are stored in the `pages` table
// Use /api/admin/pages/[slug] instead
export function GET() { return NextResponse.json({ error: "Use /api/admin/pages/[slug]" }, { status: 404 }) }
export function PATCH() { return NextResponse.json({ error: "Use /api/admin/pages/[slug]" }, { status: 404 }) }
export function DELETE() { return NextResponse.json({ error: "Use /api/admin/pages/[slug]" }, { status: 404 }) }
