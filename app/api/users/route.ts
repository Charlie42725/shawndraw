import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { CreateUserRequest } from '@/lib/types';
import { generateUniqueUserId } from '@/lib/utils';

// GET /api/users - 取得所有使用者
export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        referrer:users!referrer_id(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - 註冊新會員（不自動計算分潤）
export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json();
    const { name, referrer_id } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // 生成唯一的 8 碼會員 ID
    const userId = await generateUniqueUserId(supabase);

    // 建立新使用者
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{ 
        id: userId,
        name, 
        referrer_id: referrer_id || null 
      }])
      .select()
      .single();

    if (userError) {
      if (userError.code === '23505') {
        return NextResponse.json(
          { error: 'User name already exists' },
          { status: 409 }
        );
      }
      throw userError;
    }

    return NextResponse.json(
      { user: newUser, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
