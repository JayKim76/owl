import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

function clean(value: FormDataEntryValue | string | null | undefined) {
  const text = String(value || '').trim();
  return text || null;
}

const PARTNER_TYPES = new Set(['일반', '누수', '방수', '배관', '도배', '미장', '전기', '타일', '목수', '하수도고압세척', '마루부분시공']);

function normalizePartnerType(value: string | null) {
  if (!value) return '방수';
  return PARTNER_TYPES.has(value) ? value : '일반';
}

function toPartnerResponse(partner: {
  id: number;
  companyName: string;
  contactName: string | null;
  phone: string;
  specialty: string | null;
  email: string | null;
  region: string | null;
  partnerCode: string | null;
  status: string;
  rating: number;
  completedJobs: number;
  memo: string | null;
}) {
  return {
    id: String(partner.id),
    companyName: partner.companyName,
    type: normalizePartnerType(partner.specialty),
    manager: partner.contactName || partner.companyName,
    phone: partner.phone,
    email: partner.email || '',
    region: partner.region || '',
    partnerCode: partner.partnerCode || '',
    status: partner.status || 'pending',
    rating: partner.rating || 0,
    completedJobs: partner.completedJobs || 0,
    memo: partner.memo || '',
  };
}

async function getSessionInfo() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  const userSession = cookieStore.get('user_session')?.value;

  if (adminSession) {
    return { isAdmin: true, userId: null };
  }

  if (userSession && userSession.startsWith('general:')) {
    return { isAdmin: false, userId: parseInt(userSession.split(':')[1], 10) };
  }

  return { isAdmin: false, userId: null };
}

export async function GET() {
  const { isAdmin, userId } = await getSessionInfo();

  if (!isAdmin && !userId) {
    return NextResponse.json([]);
  }

  let userPartnerId: number | null = null;
  if (!isAdmin && userId) {
    const user = await prisma.generalUser.findUnique({
      where: { id: userId },
      select: { partnerId: true }
    });
    userPartnerId = user?.partnerId || null;
  }

  const partners = await prisma.partner.findMany({
    where: isAdmin 
      ? undefined 
      : { 
          OR: [
            { createdById: userId },
            ...(userPartnerId ? [{ id: userPartnerId }] : [])
          ]
        },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(partners.map(toPartnerResponse));
}

function getGuCode(guName: string): string {
  const CHO_MAP = ['G', 'K', 'N', 'D', 'T', 'R', 'M', 'B', 'P', 'S', 'S', 'O', 'J', 'J', 'C', 'K', 'T', 'P', 'H'];
  let code = '';
  // Remove "구", "시", "군" from the end if it exists
  const name = guName.replace(/[구시군]$/, '');
  for (let i = 0; i < Math.min(2, name.length); i++) {
    const charCode = name.charCodeAt(i) - 44032;
    if (charCode > -1 && charCode < 11172) {
      code += CHO_MAP[Math.floor(charCode / 588)];
    } else {
      const char = name.charAt(i).toUpperCase();
      if (/[A-Z]/.test(char)) code += char;
      else code += 'X';
    }
  }
  return code.padEnd(2, 'X');
}

async function generatePartnerCode(region: string | null, type: string) {
  const SIDO_MAP: Record<string, string> = {
    '서울': 'SE', '부산': 'BS', '대구': 'DG', '인천': 'IC', '광주': 'GJ', 
    '대전': 'DJ', '울산': 'US', '세종': 'SJ', '경기': 'GG', '강원': 'GW', 
    '충북': 'CB', '충남': 'CN', '전북': 'JB', '전남': 'JN', '경북': 'GB', 
    '경남': 'GN', '제주': 'JJ',
  };
  
  const TYPE_MAP: Record<string, string> = {
    '일반': 'GN', '누수': 'NU', '방수': 'BA', '배관': 'PI', '도배': 'DO', 
    '미장': 'MI', '전기': 'EL', '타일': 'TI', '목수': 'MO', '하수도고압세척': 'HA', 
    '마루부분시공': 'MA',
  };

  let sidoCode = 'ET';
  let guCode = 'XX';

  if (region) {
    const parts = region.trim().split(/\s+/);
    const sido = parts[0];
    
    for (const [key, code] of Object.entries(SIDO_MAP)) {
      if (sido.includes(key)) {
        sidoCode = code;
        break;
      }
    }
    
    if (parts.length > 1) {
      guCode = getGuCode(parts[1]);
    } else {
      guCode = getGuCode(sido); // fallback if only one word is provided
    }
  }

  const regionCode = `${sidoCode}${guCode}`; // 4 chars
  const typeCode = TYPE_MAP[type] || 'GN';   // 2 chars
  const prefix = `${regionCode}-${typeCode}-`; // e.g. SEGN-NU-

  const lastPartner = await prisma.partner.findFirst({
    where: {
      partnerCode: {
        startsWith: prefix,
      }
    },
    orderBy: {
      partnerCode: 'desc'
    }
  });

  let nextSeq = 1;
  if (lastPartner?.partnerCode) {
    const parts = lastPartner.partnerCode.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }
  }

  return `${prefix}${String(nextSeq).padStart(3, '0')}`;
}

export async function POST(request: Request) {
  const { isAdmin, userId } = await getSessionInfo();

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const companyName = clean(body.companyName as string | undefined);
  const manager = clean(body.manager as string | undefined);
  const phone = clean(body.phone as string | undefined);
  const type = clean(body.type as string | undefined) || '방수';
  const email = clean(body.email as string | undefined);
  const region = clean(body.region as string | undefined);
  const memo = clean(body.memo as string | undefined);
  const password = clean(body.password as string | undefined);

  if (!companyName || !manager || !phone) {
    return NextResponse.json({ error: 'required-fields' }, { status: 400 });
  }

  if (isAdmin && !password) {
    return NextResponse.json({ error: 'password-required' }, { status: 400 });
  }

  const generatedPartnerCode = await generatePartnerCode(region, type);

  try {
    const partner = await prisma.$transaction(async (tx) => {
      const createdPartner = await tx.partner.create({
        data: {
          companyName,
          contactName: manager,
          phone,
          specialty: type,
          email,
          region,
          partnerCode: generatedPartnerCode,
          memo,
          status: 'pending',
          createdById: userId,
        },
      });

      if (isAdmin) {
        await tx.generalUser.upsert({
          where: { phone },
          create: {
            name: manager,
            phone,
            passwordHash: hashPassword(password!),
            memo: [companyName, type, region, memo].filter(Boolean).join(' / ') || null,
            isActive: true,
            partnerId: createdPartner.id,
          },
          update: {
            name: manager,
            passwordHash: hashPassword(password!),
            memo: [companyName, type, region, memo].filter(Boolean).join(' / ') || null,
            isActive: true,
            partnerId: createdPartner.id,
          },
        });
      }

      return createdPartner;
    });

    return NextResponse.json(toPartnerResponse(partner), { status: 201 });
  } catch (error) {
    console.error('Create partner failed:', error);
    return NextResponse.json({ error: 'duplicate-or-create-failed' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const { isAdmin } = await getSessionInfo();

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const id = Number(body.id || 0);
  const companyName = clean(body.companyName as string | undefined);
  const manager = clean(body.manager as string | undefined);
  const phone = clean(body.phone as string | undefined);
  const type = clean(body.type as string | undefined) || '방수';
  const email = clean(body.email as string | undefined);
  const region = clean(body.region as string | undefined);
  const partnerCode = clean(body.partnerCode as string | undefined);
  const memo = clean(body.memo as string | undefined);
  const password = clean(body.password as string | undefined);
  const status = clean(body.status as string | undefined);

  if (!id || !companyName || !manager || !phone) {
    return NextResponse.json({ error: 'required-fields' }, { status: 400 });
  }

  try {
    const partner = await prisma.$transaction(async (tx) => {
      const updatedPartner = await tx.partner.update({
        where: { id },
        data: {
          companyName,
          contactName: manager,
          phone,
          specialty: type,
          email,
          region,
          partnerCode,
          memo,
          ...(status && { status }),
        },
      });

      if (isAdmin) {
        await tx.generalUser.upsert({
          where: { phone },
          create: {
            name: manager,
            phone,
            passwordHash: hashPassword(password || '1234'),
            memo: [companyName, type, region, memo].filter(Boolean).join(' / ') || null,
            isActive: updatedPartner.status !== 'inactive',
            partnerId: updatedPartner.id,
          },
          update: {
            name: manager,
            ...(password ? { passwordHash: hashPassword(password) } : {}),
            memo: [companyName, type, region, memo].filter(Boolean).join(' / ') || null,
            isActive: updatedPartner.status !== 'inactive',
            partnerId: updatedPartner.id,
          },
        });
      }

      return updatedPartner;
    });

    return NextResponse.json(toPartnerResponse(partner));
  } catch (error) {
    console.error('Update partner failed:', error);
    return NextResponse.json({ error: 'duplicate-or-update-failed' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get('id') || 0);
  if (!id) {
    return NextResponse.json({ error: 'id-required' }, { status: 400 });
  }

  try {
    await prisma.generalUser.deleteMany({ where: { partnerId: id } });
    await prisma.partner.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete partner failed:', error);
    return NextResponse.json({ error: 'delete-failed' }, { status: 400 });
  }
}
