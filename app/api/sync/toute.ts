// app/api/sync/route.ts
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// 開発用の簡易的なインメモリストレージ
// 注: 本番環境では永続的なデータベースを使用すべき
const dataStore = new Map<string, { data: any; timestamp: string }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, id } = body;
    
    if (!data) {
      return NextResponse.json(
        { success: false, message: 'データが提供されていません' },
        { status: 400 }
      );
    }
    
    // 既存のIDがあればそれを使い、なければ新規作成
    const syncId = id || uuidv4();
    
    // データとタイムスタンプを保存
    dataStore.set(syncId, {
      data,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: '保存完了',
      id: syncId
    });
    
  } catch (error) {
    console.error('データ保存エラー:', error);
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'IDが提供されていません' },
        { status: 400 }
      );
    }
    
    const storedData = dataStore.get(id);
    
    if (!storedData) {
      return NextResponse.json(
        { success: false, message: '指定されたIDのデータが見つかりません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: storedData.data,
      timestamp: storedData.timestamp
    });
    
  } catch (error) {
    console.error('データ取得エラー:', error);
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}