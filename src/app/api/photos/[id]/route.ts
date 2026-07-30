import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { getSessionInfo } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionInfo();
  if (session.role === 'anonymous') {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { id } = await params;
  const photoId = parseInt(id, 10);
  if (isNaN(photoId)) {
    return NextResponse.json({ error: '잘못된 ID입니다.' }, { status: 400 });
  }

  // DB에서 사진 조회
  const photo = await prisma.sitePhoto.findUnique({ where: { id: photoId } });
  if (!photo) {
    return NextResponse.json({ error: '사진을 찾을 수 없습니다.' }, { status: 404 });
  }

  // 소유권 확인
  const isOwner =
    (session.role === 'general' && photo.userId === session.userId) ||
    (session.role === 'company' && photo.companyId === session.companyId) ||
    session.role === 'admin';

  if (!isOwner) {
    return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
  }

  // 로컬 파일 삭제 (없어도 에러 무시)
  try {
    const absolutePath = path.join(process.cwd(), 'public', photo.storagePath);
    await unlink(absolutePath);
  } catch {
    // 파일이 이미 없거나 접근 불가인 경우 무시
  }

  // DB 레코드 삭제
  await prisma.sitePhoto.delete({ where: { id: photoId } });

  return NextResponse.json({ success: true });
}
