import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const templates = await prisma.estimateTemplate.findMany({
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, fileUrl, fieldMapping } = body;

    if (!name) {
      return NextResponse.json({ error: '양식 이름을 입력해주세요.' }, { status: 400 });
    }

    const template = await prisma.estimateTemplate.create({
      data: { name, description: description || null, fileUrl: fileUrl || null, fieldMapping: fieldMapping || null },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: '양식 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
