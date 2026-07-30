import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: list all companies with subscription AND all partners
export async function GET() {
  const [companies, partners] = await Promise.all([
    prisma.company.findMany({
      orderBy: [{ isActive: 'asc' }, { createdAt: 'desc' }],
      include: { subscription: true },
    }),
    prisma.partner.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    }),
  ]);

  // Map partners into unified item format for admin view
  const partnerItems = partners.map((p) => {
    let subStatus = 'pending';
    if (p.status === 'active') subStatus = 'active';
    else if (p.status === 'inactive') subStatus = 'expired';

    return {
      id: `partner_${p.id}`,
      isPartner: true,
      partnerId: p.id,
      name: p.companyName,
      ownerName: p.contactName || p.companyName,
      phone: p.phone,
      email: p.email || null,
      isActive: p.status === 'active',
      createdAt: p.createdAt,
      subscription: {
        plan: p.specialty || '협력사',
        status: subStatus,
        startDate: p.createdAt,
        endDate: null,
      },
    };
  });

  return NextResponse.json([...partnerItems, ...companies]);
}

// POST: approve | reject | deactivate | delete
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, companyId, isPartner, partnerId } = body;

  if ((!companyId && !partnerId) || !action) {
    return NextResponse.json({ error: 'ID와 action이 필요합니다.' }, { status: 400 });
  }

  try {
    // ── 협력사(Partner) 승인/거절 처리
    if (isPartner || String(companyId).startsWith('partner_')) {
      const pId = Number(partnerId || String(companyId).replace('partner_', ''));

      if (action === 'approve') {
        const partner = await prisma.partner.update({
          where: { id: pId },
          data: { status: 'active' },
        });

        // 연결된 GeneralUser 계정도 활성화
        await prisma.generalUser.updateMany({
          where: { partnerId: pId },
          data: { isActive: true },
        });

        return NextResponse.json({ success: true, message: `'${partner.companyName}' 협력사 승인 완료` });
      }

      if (action === 'reject' || action === 'deactivate') {
        const partner = await prisma.partner.update({
          where: { id: pId },
          data: { status: 'inactive' },
        });

        // 연결된 GeneralUser 계정도 비활성화
        await prisma.generalUser.updateMany({
          where: { partnerId: pId },
          data: { isActive: false },
        });

        return NextResponse.json({ success: true, message: `'${partner.companyName}' 협력사 ${action === 'deactivate' ? '비활성화' : '거절'} 완료` });
      }

      if (action === 'delete') {
        await prisma.generalUser.deleteMany({ where: { partnerId: pId } });
        await prisma.partner.delete({ where: { id: pId } });
        return NextResponse.json({ success: true, message: '협력사 삭제 완료' });
      }
    }

    // ── 기존 Company 승인/거절 처리
    const id = Number(companyId);

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
