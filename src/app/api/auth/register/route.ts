import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, ownerName, phone, email, password, plan } = body;

    if (!name || !ownerName || !phone || !password) {
      return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 });
    }

    const existing = await prisma.company.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
    });
    if (existing) {
      return NextResponse.json({ error: '이미 등록된 연락처 또는 이메일입니다.' }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const validPlan = ['trial', 'basic', 'pro', 'general'].includes(plan) ? plan : 'general';

    const now = new Date();
    const billingDay = now.getDate();
    // Next billing date is 1 month from now on the same day
    const nextBillingDate = new Date(now);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const company = await prisma.company.create({
      data: {
        name,
        ownerName,
        phone,
        email: email || null,
        passwordHash,
        isActive: false,
        subscription: {
          create: {
            plan: validPlan,
            status: 'pending',
            billingAmount: 99000,
            billingCycle: 'monthly',
            billingDay,
            nextBillingDate,
          },
        },
      },
    });

    return NextResponse.json({ success: true, companyId: company.id }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: '가입 처리 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
