'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { put, del } from '@vercel/blob';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

// Authenticate Admin
export async function login(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@grd.port';
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return { success: false, error: 'ADMIN_PASSWORD environment variable not set' };
  }

  if (email === adminEmail && password === adminPassword) {
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

  return { success: false, error: 'Clearance Code or Email Invalid' };
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
  let fileSize = 0;
  if (file && file.size > 0) {
    try {
      fileSize = file.size;
      // Upload file to Vercel Blob
      const blob = await put(file.name, file, {
        access: 'public',
        addRandomSuffix: true,
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
      fileSize,
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

// Update Biodata
export async function updateBiodata(formData: FormData) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_session')) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const designation = formData.get('designation') as string;
  const specialization = formData.get('specialization') as string;
  const statement = formData.get('statement') as string;
  const sysVer = formData.get('sysVer') as string;
  const status = formData.get('status') as string;
  const photoFile = formData.get('photoFile') as File | null;
  let photoUrl = formData.get('photoUrl') as string || '';

  // Core Competencies
  const comp1Name = formData.get('comp1Name') as string;
  const comp1Value = parseInt(formData.get('comp1Value') as string || '0');
  const comp2Name = formData.get('comp2Name') as string;
  const comp2Value = parseInt(formData.get('comp2Value') as string || '0');
  const comp3Name = formData.get('comp3Name') as string;
  const comp3Value = parseInt(formData.get('comp3Value') as string || '0');

  if (photoFile && photoFile.size > 0) {
    try {
      // Upload file to Vercel Blob
      const blob = await put(photoFile.name, photoFile, {
        access: 'public',
        addRandomSuffix: true,
      });
      photoUrl = blob.url;
    } catch (err: any) {
      return { success: false, error: `Photo upload failed: ${err.message}` };
    }
  }

  try {
    const collection = await getCollection('biodata');
    await collection.updateOne(
      { key: 'admin_biodata' },
      {
        $set: {
          name,
          designation,
          specialization,
          statement,
          sysVer,
          status,
          photoUrl,
          competencies: [
            { name: comp1Name, value: comp1Value },
            { name: comp2Name, value: comp2Value },
            { name: comp3Name, value: comp3Value },
          ],
          updatedAt: new Date().toISOString(),
        }
      },
      { upsert: true }
    );

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: `Database update failed: ${err.message}` };
  }
}

// Update Project
export async function updateProject(formData: FormData) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.has('admin_session')) {
      return { success: false, error: 'Unauthorized session. Please login again.' };
    }

    const projectId = formData.get('projectId') as string;
    const tag = formData.get('tag') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const linkUrl = formData.get('linkUrl') as string;
    const imageFile = formData.get('imageFile');
    let imageUrl = formData.get('imageUrl') as string || '';

    if (!projectId || !tag || !title || !description || !linkUrl) {
      return { success: false, error: 'All fields are required' };
    }

    if (imageFile && typeof imageFile !== 'string' && 'size' in imageFile && (imageFile as any).size > 0) {
      try {
        const fileObj = imageFile as File;
        const blob = await put(fileObj.name, fileObj, {
          access: 'public',
          addRandomSuffix: true,
        });
        imageUrl = blob.url;
      } catch (err: any) {
        return { success: false, error: `Image upload failed: ${err.message}` };
      }
    }

    const collection = await getCollection('projects');
    await collection.updateOne(
      { projectId },
      {
        $set: {
          tag,
          title,
          description,
          linkUrl,
          imageUrl,
          updatedAt: new Date().toISOString(),
        }
      },
      { upsert: true }
    );

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('Error in updateProject server action:', err);
    return { success: false, error: err.message || 'An unexpected server error occurred.' };
  }
}

