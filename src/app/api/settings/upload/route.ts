import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// Supabase Storage가 정상 설정되어 있을 때만 사용
async function trySupabaseUpload(
  fileName: string,
  bytes: ArrayBuffer,
  contentType: string,
): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);
    const { error } = await supabase.storage
      .from('estimate-templates')
      .upload(fileName, bytes, { contentType, upsert: false });
    if (error) return null;
    const { data } = supabase.storage.from('estimate-templates').getPublicUrl(fileName);
    return data.publicUrl;
  } catch {
    return null;
  }
}

// 로컬 /public/uploads/templates/ 에 저장
async function saveLocally(
  fileName: string,
  bytes: ArrayBuffer,
): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'templates');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));
  return `/uploads/templates/${fileName}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일을 선택해주세요.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '파일 크기는 10MB 이하여야 합니다.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'JPG, PNG, WebP, PDF 파일만 업로드 가능합니다.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await file.arrayBuffer();

    // Supabase 먼저 시도 → 실패 시 로컬 저장
    const supabaseUrl = await trySupabaseUpload(fileName, bytes, file.type);
    const publicUrl = supabaseUrl ?? await saveLocally(fileName, bytes);

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '업로드 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
