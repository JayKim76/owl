import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const DEFAULT_COSTS = [
  { key: 'detection', label: '탐지 기본료', value: 300000 },
  { key: 'waterPipe', label: '상수도 배관', value: 500000 },
  { key: 'sewagePipe', label: '하수도 배관', value: 400000 },
  { key: 'demolition', label: '부분 철거', value: 200000 },
  { key: 'plaster', label: '미장/방통', value: 350000 },
  { key: 'tile', label: '타일 마감', value: 450000 },
  { key: 'floor', label: '마루/바닥 복구', value: 600000 },
  { key: 'waterproof', label: '특수 방수', value: 800000 },
];

export async function GET() {
  const existing = await prisma.costSetting.findMany({ orderBy: { id: 'asc' } });

  if (existing.length === 0) {
    // 기본값 seed
    const created = await prisma.costSetting.createMany({ data: DEFAULT_COSTS });
    if (created.count > 0) {
      return NextResponse.json(await prisma.costSetting.findMany({ orderBy: { id: 'asc' } }));
    }
  }

  return NextResponse.json(existing);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as { key: string; value: number }[];

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: '잘못된 데이터 형식입니다.' }, { status: 400 });
    }

    const updates = await Promise.all(
      body.map(({ key, value }) =>
        prisma.costSetting.upsert({
          where: { key },
          update: { value },
          create: {
            key,
            label: DEFAULT_COSTS.find((d) => d.key === key)?.label ?? key,
            value,
          },
        }),
      ),
    );

    return NextResponse.json(updates);
  } catch (error) {
    console.error('Update costs error:', error);
    return NextResponse.json({ error: '단가 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
