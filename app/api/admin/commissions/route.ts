import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET /api/admin/commissions - 取得所有分潤紀錄
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data: commissions, error } = await supabase
      .from('commissions')
      .select(`
        *,
        user:users!user_id(id, name),
        winner:users!winner_id(id, name),
        prize:prizes!prize_id(prize_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ commissions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commissions' },
      { status: 500 }
    );
  }
}
