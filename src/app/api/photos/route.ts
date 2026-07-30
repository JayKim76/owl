import { NextResponse } from 'next/server';
import { getSessionInfo } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getSessionInfo();
  if (session.role === 'anonymous') {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  // 사용자 역할에 따라 자신의 사진만 조회
  let whereClause = {};
  if (session.role === 'general') {
    whereClause = { userId: session.userId };
  } else if (session.role === 'company') {
    whereClause = { companyId: session.companyId };
  }
  // admin은 전체 조회 (whereClause = {})

  const photos = await prisma.sitePhoto.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    photos: photos.map((p) => ({
      id: String(p.id),
      url: p.storagePath,
      title: p.title,
      date: p.date,
    })),
  });
}
