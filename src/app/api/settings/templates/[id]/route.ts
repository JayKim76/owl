import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, fileUrl, fieldMapping, isDefault } = body;

    if (isDefault === true) {
      // 기존 기본 양식 해제 후 현재 양식을 기본으로 설정
      await prisma.$transaction([
        prisma.estimateTemplate.updateMany({ where: { isDefault: true }, data: { isDefault: false } }),
        prisma.estimateTemplate.update({
          where: { id: Number(id) },
          data: { isDefault: true },
        }),
      ]);
      const updated = await prisma.estimateTemplate.findUnique({ where: { id: Number(id) } });
      return NextResponse.json(updated);
    }

    const updated = await prisma.estimateTemplate.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(fieldMapping !== undefined && { fieldMapping }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json({ error: '양식 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.estimateTemplate.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json({ error: '양식 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
