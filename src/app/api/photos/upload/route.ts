import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getSessionInfo } from '@/lib/session';
import prisma from '@/lib/prisma';

export const config = {
  api: { bodyParser: false },
};

export async function POST(request: NextRequest) {
  // 1. 세션 확인
  const session = await getSessionInfo();
  if (session.role === 'anonymous') {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  // 2. FormData 파싱
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: '요청 데이터를 읽을 수 없습니다.' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const title = (formData.get('title') as string | null)?.trim() || '제목 없는 현장 사진';

  if (!file || file.size === 0) {
    return NextResponse.json({ error: '이미지 파일이 없습니다.' }, { status: 400 });
  }

  // 3. 사용자 식별자 및 날짜 폴더 생성
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

  let ownerFolder: string;
  let userId: number | null = null;
  let companyId: number | null = null;

  if (session.role === 'general') {
    ownerFolder = `user_${session.userId}`;
    userId = session.userId;
  } else if (session.role === 'company') {
    ownerFolder = `company_${session.companyId}`;
    companyId = session.companyId;
  } else {
    // admin
    ownerFolder = 'admin';
  }

  // 4. 저장 경로 구성
  // public/uploads/{ownerFolder}/{YYYY-MM-DD}/
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext) ? ext : 'jpg';
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  const relativeDir = path.join('uploads', ownerFolder, dateStr);
  const absoluteDir = path.join(process.cwd(), 'public', relativeDir);
  const absolutePath = path.join(absoluteDir, filename);
  const publicPath = `/${relativeDir}/${filename}`.replace(/\\/g, '/');

  // 5. 디렉토리 생성 (없으면 재귀적으로 생성)
  await mkdir(absoluteDir, { recursive: true });

  // 6. 파일 쓰기
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  // 7. DB에 메타데이터 저장
  const photo = await prisma.sitePhoto.create({
    data: {
      title,
      storagePath: publicPath,
      date: dateStr,
      userId,
      companyId,
    },
  });

  return NextResponse.json({
    success: true,
    photo: {
      id: String(photo.id),
      url: publicPath,
      title: photo.title,
      date: photo.date,
    },
  });
}
