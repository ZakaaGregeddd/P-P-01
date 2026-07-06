import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCollection } from '@/lib/db';
import AdminDashboard from './AdminDashboard';

export const revalidate = 0; // Disable caching

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has('admin_session');

  if (!isAuthenticated) {
    redirect('/login');
  }

  let dbCerts: any[] = [];
  try {
    const collection = await getCollection('certificates');
    dbCerts = await collection.find({}).sort({ dateIssued: -1 }).toArray();
  } catch (err) {
    console.error('Failed to load admin certificates list:', err);
  }

  const initialCerts = dbCerts.map((cert) => ({
    _id: cert._id.toString(),
    name: cert.name,
    issuer: cert.issuer,
    dateIssued: cert.dateIssued,
    credentialId: cert.credentialId,
    status: cert.status || 'active',
    fileUrl: cert.fileUrl || '',
  }));

  return <AdminDashboard initialCerts={initialCerts} />;
}
