import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET /api/admin/stats - 取得系統統計資訊
export async function GET() {
  try {
    // 總會員數
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // 總分潤金額
    const { data: commissions, error: commError } = await supabase
      .from('commissions')
      .select('amount');

    if (commError) throw commError;

    const totalCommissions = commissions?.reduce((sum, c) => sum + c.amount, 0) || 0;

    // 今日新增會員
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: todayUsers, error: todayError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    if (todayError) throw todayError;

    // 今日分潤
    const { data: todayComm, error: todayCommError } = await supabase
      .from('commissions')
      .select('amount')
      .gte('created_at', today.toISOString());

    if (todayCommError) throw todayCommError;

    const todayCommissions = todayComm?.reduce((sum, c) => sum + c.amount, 0) || 0;

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalCommissions,
        todayUsers: todayUsers || 0,
        todayCommissions,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
