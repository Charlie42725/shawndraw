import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET /api/users/[id] - 取得特定使用者資訊
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // 取得使用者基本資訊
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        referrer:users!referrer_id(id, name)
      `)
      .eq('id', userId)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      throw userError;
    }

    // 計算總分潤
    const { data: commissions, error: commError } = await supabase
      .from('commissions')
      .select('amount')
      .eq('user_id', userId);

    if (commError) throw commError;

    const totalCommission = commissions?.reduce((sum, c) => sum + c.amount, 0) || 0;

    // 計算下線數量（直接下線）
    const { count: downlineCount, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId);

    if (countError) throw countError;

    return NextResponse.json({
      user: {
        ...user,
        referrer_name: user.referrer?.name,
        total_commission: totalCommission,
        downline_count: downlineCount || 0,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - 更新使用者資訊
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const body = await request.json();
    const { name, referrer_id } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // 防止自己成為自己的推薦人
    if (referrer_id === userId) {
      return NextResponse.json(
        { error: 'Cannot set self as referrer' },
        { status: 400 }
      );
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ 
        name, 
        referrer_id: referrer_id === null || referrer_id === '' ? null : referrer_id 
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'User name already exists' },
          { status: 409 }
        );
      }
      if (error.code === '23503') {
        return NextResponse.json(
          { error: 'Referrer ID does not exist' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { user: updatedUser, message: 'User updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - 刪除使用者
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // 刪除使用者（會自動級聯刪除相關的分潤和中獎紀錄）
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
