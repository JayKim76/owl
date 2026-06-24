import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: list all companies with subscription
export async function GET() {
  const companies = await prisma.company.findMany({
    orderBy: [{ isActive: 'asc' }, { createdAt: 'desc' }],
    include: { subscription: true },
  });
  return NextResponse.json(companies);
}

// POST: approve | reject | deactivate | delete
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, companyId } = body;

  if (!companyId || !action) {
    return NextResponse.json({ error: 'companyId와 action이 필요합니다.' }, { status: 400 });
  }

  const id = Number(companyId);

  try {
    if (action === 'approve') {
      const plan = body.plan;
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() + (plan === 'trial' ? 14 : 30));

      await prisma.$transaction([
        prisma.company.update({ where: { id }, data: { isActive: true } }),
        prisma.subscription.update({
          where: { companyId: id },
          data: { status: 'active', startDate: now, endDate: end },
        }),
      ]);
      return NextResponse.json({ success: true, message: '승인 완료' });
    }

    if (action === 'reject') {
      await prisma.$transaction([
        prisma.company.update({ where: { id }, data: { isActive: false } }),
        prisma.subscription.update({
          where: { companyId: id },
          data: { status: 'cancelled' },
        }),
      ]);
      return NextResponse.json({ success: true, message: '거절 완료' });
    }

    if (action === 'deactivate') {
      await prisma.$transaction([
        prisma.company.update({ where: { id }, data: { isActive: false } }),
        prisma.subscription.update({
          where: { companyId: id },
          data: { status: 'expired' },
        }),
      ]);
      return NextResponse.json({ success: true, message: '비활성화 완료' });
    }

    if (action === 'delete') {
      await prisma.subscription.deleteMany({ where: { companyId: id } });
      await prisma.company.delete({ where: { id } });
      return NextResponse.json({ success: true, message: '삭제 완료' });
    }

    return NextResponse.json({ error: '알 수 없는 action입니다.' }, { status: 400 });
  } catch (error) {
    console.error('Company action error:', error);
    return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
