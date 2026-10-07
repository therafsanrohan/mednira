import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const familyMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  accessLevel: z.enum(['LIMITED', 'FULL']).default('LIMITED'),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const group = await prisma.familyGroup.findUnique({
      where: { ownerId: session.user.id },
      include: { members: true }
    });

    return NextResponse.json({ group: group || { members: [] } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch family' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = familyMemberSchema.parse(body);

    // Get or create family group
    let group = await prisma.familyGroup.findUnique({
      where: { ownerId: session.user.id }
    });

    if (!group) {
      group = await prisma.familyGroup.create({
        data: { ownerId: session.user.id }
      });
    }

    const member = await prisma.familyMember.create({
      data: {
        groupId: group.id,
        name: data.name,
        relationship: data.relationship,
        accessLevel: data.accessLevel,
      }
    });

    return NextResponse.json({ success: true, member });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add family member' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });

    const group = await prisma.familyGroup.findUnique({
      where: { ownerId: session.user.id }
    });

    if (!group) return NextResponse.json({ error: 'Family group not found' }, { status: 404 });

    await prisma.familyMember.delete({
      where: { id, groupId: group.id } // Ensures the member belongs to this group
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 400 });
  }
}
