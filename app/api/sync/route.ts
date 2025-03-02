// app/api/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from '@upstash/redis';

// データの型を定義
interface StoredData {
  data: any;
  timestamp: string;
}

// CORSヘッダーを追加するヘルパー関数
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Redisクライアントの初期化関数
function getRedisClient() {
  // Vercel KV用の環境変数を優先的に使用
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    console.log('Vercel KVの接続情報を使用します');
    return new Redis({
      url: kvUrl,
      token: kvToken,
    });
  }

  // フォールバックとしてUpstashの直接接続情報を使用
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    console.log('Upstash Redisの直接接続情報を使用します');
    return new Redis({
      url: upstashUrl,
      token: upstashToken,
    });
  }

  throw new Error('Redis接続情報が設定されていません');
}

// OPTIONSリクエスト（プリフライトリクエスト）に対応
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// テスト用を含むGETエンドポイント
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  // テスト用のエンドポイント
  if (id === 'test') {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    return NextResponse.json({
      success: true,
      message: 'APIは正常に動作しています',
      environmentSetup: {
        hasKvUrl: !!kvUrl,
        hasKvToken: !!kvToken,
        hasUpstashUrl: !!upstashUrl,
        hasUpstashToken: !!upstashToken,
        usingVercelKV: !!(kvUrl && kvToken)
      }
    }, { headers: corsHeaders() });
  }
  
  // 以下は本来のGET処理
  try {
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'IDが提供されていません'
      }, { 
        status: 400, 
        headers: corsHeaders() 
      });
    }
    
    // Redisクライアントの初期化
    try {
      const redis = getRedisClient();
      
      // データを取得
      const storedData = await redis.get<StoredData>(id);
      
      if (!storedData) {
        return NextResponse.json({
          success: false,
          message: '指定されたIDのデータが見つかりません'
        }, { 
          status: 404, 
          headers: corsHeaders() 
        });
      }
      
      return NextResponse.json({
        success: true,
        data: storedData.data,
        timestamp: storedData.timestamp
      }, { headers: corsHeaders() });
    } catch (redisError) {
      console.error('データベース操作エラー:', redisError);
      return NextResponse.json({
        success: false,
        message: `データベース操作エラー: ${redisError instanceof Error ? redisError.message : '不明なエラー'}`
      }, { 
        status: 500, 
        headers: corsHeaders() 
      });
    }
  } catch (error) {
    console.error('データ取得エラー:', error);
    return NextResponse.json({
      success: false,
      message: `サーバーエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }, { 
      status: 500, 
      headers: corsHeaders() 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, id } = body;
    
    if (!data) {
      return NextResponse.json({
        success: false,
        message: 'データが提供されていません'
      }, { 
        status: 400, 
        headers: corsHeaders() 
      });
    }
    
    // Redisクライアントの初期化
    try {
      const redis = getRedisClient();
      
      // 既存のIDがあればそれを使い、なければ新規作成
      const syncId = id || uuidv4();
      
      // 保存するデータを型付け
      const storedData: StoredData = {
        data,
        timestamp: new Date().toISOString()
      };
      
      // データを保存
      await redis.set(syncId, storedData);
      
      return NextResponse.json({
        success: true,
        message: '保存完了',
        id: syncId
      }, { headers: corsHeaders() });
    } catch (redisError) {
      console.error('データベース操作エラー:', redisError);
      return NextResponse.json({
        success: false,
        message: `データベース操作エラー: ${redisError instanceof Error ? redisError.message : '不明なエラー'}`
      }, { 
        status: 500, 
        headers: corsHeaders() 
      });
    }
  } catch (error) {
    console.error('データ保存エラー:', error);
    return NextResponse.json({
      success: false,
      message: `サーバーエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }, { 
      status: 500, 
      headers: corsHeaders() 
    });
  }
}