import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { CreatePrizeRequest } from '@/lib/types';

// GET /api/prizes - 取得所有中獎紀錄
export async function GET() {
  try {
    const { data: prizes, error } = await supabase
      .from('prizes')
      .select(`
        *,
        winner:users!winner_id(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ prizes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching prizes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prizes' },
      { status: 500 }
    );
  }
}

// POST /api/prizes - 登記中獎並自動計算上三代分潤
export async function POST(request: NextRequest) {
  try {
    const body: CreatePrizeRequest = await request.json();
    const { winner_id, prize_name } = body;

    if (!winner_id || !prize_name) {
      return NextResponse.json(
        { error: 'Winner ID and prize name are required' },
        { status: 400 }
      );
    }

    // 驗證獎項名稱
    if (prize_name !== '組合A' && prize_name !== '組合B') {
      return NextResponse.json(
        { error: 'Prize name must be 組合A or 組合B' },
        { status: 400 }
      );
    }

    // 1. 驗證中獎者存在
    const { data: winner, error: winnerError } = await supabase
      .from('users')
      .select('id, name, referrer_id')
      .eq('id', winner_id)
      .single();

    if (winnerError || !winner) {
      return NextResponse.json(
        { error: 'Winner not found' },
        { status: 404 }
      );
    }

    // 2. 建立中獎紀錄
    const { data: newPrize, error: prizeError } = await supabase
      .from('prizes')
      .insert([
        {
          winner_id,
          prize_name,
        },
      ])
      .select()
      .single();

    if (prizeError) throw prizeError;

    // 3. 追溯上三代並建立分潤
    const commissionsCreated = [];
    
    if (winner.referrer_id) {
      // 取得分潤規則
      const { data: rules, error: rulesError } = await supabase
        .from('commission_rules')
        .select('*')
        .order('level', { ascending: true });

      if (rulesError) throw rulesError;

      let currentReferrerId = winner.referrer_id;
      
      for (let level = 1; level <= 3 && currentReferrerId; level++) {
        const rule = rules?.find((r) => r.level === level);
        if (!rule) break;

        // 建立分潤紀錄
        const { data: commission, error: commError } = await supabase
          .from('commissions')
          .insert([
            {
              user_id: currentReferrerId,
              prize_id: newPrize.id,
              winner_id: winner.id,
              level: level,
              amount: rule.amount,
            },
          ])
          .select()
          .single();

        if (commError) throw commError;
        commissionsCreated.push(commission);

        // 查詢下一層上線
        const { data: referrer, error: refError } = await supabase
          .from('users')
          .select('referrer_id')
          .eq('id', currentReferrerId)
          .single();

        if (refError || !referrer?.referrer_id) break;
        currentReferrerId = referrer.referrer_id;
      }
    }

    return NextResponse.json(
      {
        prize: newPrize,
        commissions: commissionsCreated,
        message: `中獎登記成功！已為 ${commissionsCreated.length} 位上線建立分潤`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating prize:', error);
    return NextResponse.json(
      { error: 'Failed to create prize record' },
      { status: 500 }
    );
  }
}
