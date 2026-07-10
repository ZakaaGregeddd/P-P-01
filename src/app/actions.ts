'use server';

import { cookies, headers } from 'next/headers';
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
  const description = formData.get('description') as string || '';
  const file = formData.get('file') as File;
  const customLabel = formData.get('customLabel') as string || '';

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
      description,
      customLabel,
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
      // Delete old photo from Vercel Blob to avoid storage junk
      try {
        const collection = await getCollection('biodata');
        const existingBio = await collection.findOne({ key: 'admin_biodata' });
        if (existingBio && existingBio.photoUrl) {
          await del(existingBio.photoUrl);
        }
      } catch (e) {
        console.error('Failed to delete old biodata photo:', e);
      }

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
        // Delete old image from Vercel Blob if it exists to avoid storage junk
        try {
          const collection = await getCollection('projects');
          const existingProj = await collection.findOne({ projectId });
          if (existingProj && existingProj.imageUrl) {
            await del(existingProj.imageUrl);
          }
        } catch (e) {
          console.error('Failed to delete old project image:', e);
        }

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

// Update Certificate
export async function updateCertificate(formData: FormData) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_session')) {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const issuer = formData.get('issuer') as string;
  const dateIssued = formData.get('dateIssued') as string;
  const credentialId = formData.get('credentialId') as string;
  const status = formData.get('status') as 'active' | 'expired';
  const description = formData.get('description') as string || '';
  const file = formData.get('file') as File | null;
  let fileUrl = formData.get('fileUrl') as string || '';
  const customLabel = formData.get('customLabel') as string || '';

  if (!id || !name || !issuer || !dateIssued || !credentialId) {
    return { success: false, error: 'All text fields are required' };
  }

  try {
    const collection = await getCollection('certificates');
    const existingCert = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingCert) {
      return { success: false, error: 'Certificate record not found' };
    }

    let fileSize = existingCert.fileSize || 0;
    
    if (file && file.size > 0) {
      try {
        fileSize = file.size;
        // Delete old file from Vercel Blob if it exists to avoid storage junk
        if (existingCert.fileUrl) {
          try {
            await del(existingCert.fileUrl);
          } catch (e) {
            console.error('Failed to delete old certificate blob:', e);
          }
        }
        
        // Upload new file to Vercel Blob
        const blob = await put(file.name, file, {
          access: 'public',
          addRandomSuffix: true,
        });
        fileUrl = blob.url;
      } catch (err: any) {
        return { success: false, error: `File upload failed: ${err.message}` };
      }
    } else {
      // Keep existing URL if no new file is uploaded
      fileUrl = fileUrl || existingCert.fileUrl || '';
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          issuer,
          dateIssued,
          credentialId,
          status: status || 'active',
          fileUrl,
          fileSize,
          description,
          customLabel,
          updatedAt: new Date().toISOString(),
        }
      }
    );

    revalidatePath('/certificates');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: `Database update failed: ${err.message}` };
  }
}

// Get Public Comments
export async function getComments() {
  try {
    const collection = await getCollection('comments');
    const comments = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return comments.map(c => ({
      id: c._id.toString(),
      nickname: c.nickname,
      text: c.text,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt
    }));
  } catch (err) {
    console.error('Failed to retrieve comments:', err);
    return [];
  }
}

// Post Public Comment
export async function postComment(nickname: string, text: string) {
  // Validate presence
  if (!nickname || !text || !nickname.trim() || !text.trim()) {
    return { success: false, error: 'Nickname and message cannot be empty.' };
  }

  // Escaping HTML characters to prevent XSS injection
  const cleanNickname = nickname
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .substring(0, 8); // Max length 8

  const cleanText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .substring(0, 500); // Max length 500

  try {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || 'unknown-client-ip';

    const collection = await getCollection('comments');

    // Anti-spam Rate Limit: Check if this IP has posted in the last 15 seconds
    const lastComment = await collection.findOne({
      ip,
      createdAt: { $gt: new Date(Date.now() - 15 * 1000) }
    });

    if (lastComment) {
      return { success: false, error: 'Rate limit exceeded. Please wait 15 seconds before posting again.' };
    }

    // Insert comment with real Date object for automatic 3-month TTL index deletion
    await collection.insertOne({
      nickname: cleanNickname,
      text: cleanText,
      ip,
      createdAt: new Date()
    });

    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Error posting comment:', err);
    return { success: false, error: `Failed to submit comment: ${err.message}` };
  }
}

// Get General Website Settings
export async function getSettings() {
  try {
    const collection = await getCollection('settings');
    const settings = await collection.findOne({ key: 'site_settings' });
    return {
      systemVersion: settings?.systemVersion || '4.2.0',
      authProtocol: settings?.authProtocol || 'V.04',
      isOverdriveOff: settings?.isOverdriveOff === true
    };
  } catch (err) {
    console.error('Failed to get settings:', err);
    return {
      systemVersion: '4.2.0',
      authProtocol: 'V.04',
      isOverdriveOff: false
    };
  }
}

// Update General Website Settings
export async function updateSettings(formData: FormData) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_session')) {
    throw new Error('Unauthorized');
  }

  const systemVersion = formData.get('systemVersion') as string || '4.2.0';
  const authProtocol = formData.get('authProtocol') as string || 'V.04';
  const isOverdriveOff = formData.get('isOverdriveOff') === 'true';

  try {
    const collection = await getCollection('settings');
    await collection.updateOne(
      { key: 'site_settings' },
      {
        $set: {
          systemVersion,
          authProtocol,
          isOverdriveOff,
          updatedAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    revalidatePath('/');
    revalidatePath('/certificates');
    revalidatePath('/admin');
    revalidatePath('/login');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: `Failed to save configuration: ${err.message}` };
  }
}

