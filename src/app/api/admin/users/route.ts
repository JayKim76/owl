import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

function getRedirectUrl(request: Request, pathname: string) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'www.owl-leak.kr';
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProto || (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return new URL(pathname, `${protocol}://${host}`);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const action = String(formData.get('action') || 'create');
  const id = Number(formData.get('id') || 0);

  if (action === 'create') {
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim() || null;
    const password = String(formData.get('password') || '').trim();
    const memo = String(formData.get('memo') || '').trim() || null;

    if (!name) {
      return NextResponse.redirect(getRedirectUrl(request, '/admin/users?error=name'), { status: 303 });
    }

    if (!password) {
      return NextResponse.redirect(getRedirectUrl(request, '/admin/users?error=password'), { status: 303 });
    }

    try {
      if (phone) {
        const partner = await prisma.partner.upsert({
          where: { phone },
          update: {
            companyName: name,
            contactName: name,
            memo,
          },
          create: {
            companyName: name,
            contactName: name,
            phone,
            specialty: '일반',
            status: 'active',
            memo,
          },
        });

        await prisma.generalUser.create({
          data: { name, phone, passwordHash: hashPassword(password), memo, partnerId: partner.id },
        });
      } else {
        await prisma.generalUser.create({
          data: { name, phone, passwordHash: hashPassword(password), memo },
        });
      }
    } catch (error) {
      console.error('Create general user failed:', error);
      return NextResponse.redirect(getRedirectUrl(request, '/admin/users?error=duplicate'), { status: 303 });
    }
  }

  if (action === 'password' && id) {
    const password = String(formData.get('password') || '').trim();

    if (!password) {
      return NextResponse.redirect(getRedirectUrl(request, '/admin/users?error=password'), { status: 303 });
    }

    await prisma.generalUser.update({
      where: { id },
      data: { passwordHash: hashPassword(password) },
    }).catch((error) => {
      console.error('Update general user password failed:', error);
    });
  }

  if (action === 'toggle' && id) {
    const user = await prisma.generalUser.findUnique({ where: { id } });
    if (user) {
      const nextActive = !user.isActive;
      await prisma.generalUser.update({
        where: { id },
        data: { isActive: nextActive },
      });
      if (user.partnerId) {
        await prisma.partner.update({
          where: { id: user.partnerId },
          data: { status: nextActive ? 'active' : 'inactive' },
        }).catch((error) => {
          console.error('Sync partner status failed:', error);
        });
      }
    }
  }

  if (action === 'delete' && id) {
    const user = await prisma.generalUser.findUnique({ where: { id } });
    await prisma.generalUser.delete({ where: { id } }).catch((error) => {
      console.error('Delete general user failed:', error);
    });
    if (user?.partnerId) {
      await prisma.partner.delete({ where: { id: user.partnerId } }).catch((error) => {
        console.error('Delete linked partner failed:', error);
      });
    }
  }

  return NextResponse.redirect(getRedirectUrl(request, '/admin/users'), { status: 303 });
}
