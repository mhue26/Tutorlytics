import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const studentId = parseInt(id);

    if (isNaN(studentId)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    const formData = await request.formData();
    const notes = String(formData.get('notes') || '').trim() || null;

    // Update the student's notes
    await prisma.student.update({
      where: { id: studentId },
      data: { notes },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating student goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
