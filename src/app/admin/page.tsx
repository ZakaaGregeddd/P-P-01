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
    dbCerts = await collection.find({})
      .project({
        name: 1,
        issuer: 1,
        dateIssued: 1,
        credentialId: 1,
        status: 1,
        fileUrl: 1,
        fileSize: 1,
        description: 1,
        createdAt: 1
      })
      .sort({ dateIssued: -1 })
      .toArray();
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
    fileSize: cert.fileSize || 0,
    description: cert.description || '',
  }));

  let initialBiodata = null;
  try {
    const biodataCollection = await getCollection('biodata');
    const bioDoc = await biodataCollection.findOne({ key: 'admin_biodata' });
    if (bioDoc) {
      initialBiodata = {
        name: bioDoc.name || '',
        designation: bioDoc.designation || '',
        specialization: bioDoc.specialization || '',
        statement: bioDoc.statement || '',
        sysVer: bioDoc.sysVer || '',
        status: bioDoc.status || '',
        photoUrl: bioDoc.photoUrl || '',
        competencies: bioDoc.competencies || []
      };
    }
  } catch (err) {
    console.error('Failed to load admin biodata:', err);
  }

  let initialProjects: any[] = [];
  try {
    const projectsCollection = await getCollection('projects');
    const dbProjects = await projectsCollection.find({}).toArray();
    initialProjects = dbProjects.map((p) => ({
      projectId: p.projectId,
      tag: p.tag || '',
      title: p.title || '',
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      linkUrl: p.linkUrl || '',
    }));
  } catch (err) {
    console.error('Failed to load admin projects list:', err);
  }

  return (
    <AdminDashboard 
      initialCerts={initialCerts} 
      initialBiodata={initialBiodata} 
      initialProjects={initialProjects} 
    />
  );
}
