'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { put, del } from '@vercel/blob';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

// Authenticate Admin
export async function login(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return { success: false, error: 'ADMIN_PASSWORD environment variable not set' };
  }

  if (password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: 'strict',
    });
    return { success: true };
  }

  return { success: false, error: 'Clearance Code Invalid' };
}

// Log Out Admin
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  return { success: true };
}

// Add Certificate
export async function addCertificate(formData: FormData) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_session')) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const issuer = formData.get('issuer') as string;
  const dateIssued = formData.get('dateIssued') as string;
  const credentialId = formData.get('credentialId') as string;
  const status = formData.get('status') as 'active' | 'expired';
  const file = formData.get('file') as File;

  if (!name || !issuer || !dateIssued || !credentialId) {
    return { success: false, error: 'All text fields are required' };
  }

  let fileUrl = '';
  if (file && file.size > 0) {
    try {
      // Upload file to Vercel Blob
      const blob = await put(file.name, file, {
        access: 'public',
      });
      fileUrl = blob.url;
    } catch (err: any) {
      return { success: false, error: `File upload failed: ${err.message}` };
    }
  }

  try {
    const collection = await getCollection('certificates');
    await collection.insertOne({
      name,
      issuer,
      dateIssued,
      credentialId,
      status: status || 'active',
      fileUrl,
      createdAt: new Date().toISOString(),
    });

    revalidatePath('/certificates');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: `Database insert failed: ${err.message}` };
  }
}

// Delete Certificate
export async function deleteCertificate(id: string) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_session')) {
    throw new Error('Unauthorized');
  }

  try {
    const collection = await getCollection('certificates');
    const cert = await collection.findOne({ _id: new ObjectId(id) });
    
    if (cert && cert.fileUrl) {
      try {
        // Delete file from Vercel Blob
        await del(cert.fileUrl);
      } catch (e) {
        console.error('Failed to delete blob:', e);
      }
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    revalidatePath('/certificates');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: `Deletion failed: ${err.message}` };
  }
}
