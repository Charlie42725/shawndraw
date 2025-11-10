import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { DownlineUser } from '@/lib/types';

// GET /api/users/[id]/downline - 取得使用者的下線（三代）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const downline: DownlineUser[] = [];

    // 第一代下線
    const { data: level1, error: error1 } = await supabase
      .from('users')
      .select('id, name, created_at')
      .eq('referrer_id', userId);

    if (error1) throw error1;

    if (level1) {
      downline.push(...level1.map((u) => ({ ...u, level: 1 })));

      // 第二代下線
      const level1Ids = level1.map((u) => u.id);
      if (level1Ids.length > 0) {
        const { data: level2, error: error2 } = await supabase
          .from('users')
          .select('id, name, created_at')
          .in('referrer_id', level1Ids);

        if (error2) throw error2;

        if (level2) {
          downline.push(...level2.map((u) => ({ ...u, level: 2 })));

          // 第三代下線
          const level2Ids = level2.map((u) => u.id);
          if (level2Ids.length > 0) {
            const { data: level3, error: error3 } = await supabase
              .from('users')
              .select('id, name, created_at')
              .in('referrer_id', level2Ids);

            if (error3) throw error3;

            if (level3) {
              downline.push(...level3.map((u) => ({ ...u, level: 3 })));
            }
          }
        }
      }
    }

    return NextResponse.json({ downline }, { status: 200 });
  } catch (error) {
    console.error('Error fetching downline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch downline' },
      { status: 500 }
    );
  }
}
