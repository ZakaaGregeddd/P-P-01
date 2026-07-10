import { getCollection, Certificate } from '@/lib/db';
import CertificatesClient from './CertificatesClient';
import OfflineScreen from '../OfflineScreen';
import { getSettings } from '../actions';

export const revalidate = 0; // Disable cache so it fetches fresh certificates on reload

export default async function CertificatesPage() {
  const settings = await getSettings();
  if (settings.isOverdriveOff) {
    return (
      <div className="pt-16 pb-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto relative z-10 min-h-[80vh] flex flex-col justify-center">
        <OfflineScreen />
      </div>
    );
  }

  let certificates: Certificate[] = [];
  try {
    const collection = await getCollection('certificates');
    const dbCerts = await collection.find({})
      .project({
        name: 1,
        issuer: 1,
        dateIssued: 1,
        credentialId: 1,
        status: 1,
        fileUrl: 1,
        description: 1,
        customLabel: 1,
        createdAt: 1
      })
      .sort({ dateIssued: -1 })
      .toArray();
    
    // Map Mongo docs to Certificate objects and serialize IDs
    certificates = dbCerts.map(doc => ({
      _id: doc._id.toString(),
      name: doc.name,
      issuer: doc.issuer,
      dateIssued: doc.dateIssued,
      credentialId: doc.credentialId,
      status: doc.status || 'active',
      fileUrl: doc.fileUrl || '',
      description: doc.description || '',
      customLabel: doc.customLabel || '',
      createdAt: doc.createdAt || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Failed to load certificates:', err);
  }

  // Pre-seed some default certificates if database is empty so that it matches newCrtpage.html!
  const displayCerts = certificates.length > 0 ? certificates : [
    {
      _id: '1',
      name: 'Advanced Structural Analysis',
      issuer: 'Institute of Civil Engineering',
      dateIssued: '2023-11',
      credentialId: 'ASA-99201',
      status: 'active' as const,
      fileUrl: '',
      createdAt: '',
    },
    {
      _id: '2',
      name: 'Sustainable Urban Planning',
      issuer: 'Global Green Build Council',
      dateIssued: '2022-05',
      credentialId: 'SUP-4418X',
      status: 'active' as const,
      fileUrl: '',
      createdAt: '',
    },
    {
      _id: '3',
      name: 'Parametric Modeling Mastery',
      issuer: 'Design Computation Academy',
      dateIssued: '2024-01',
      credentialId: 'PMM-7002B',
      status: 'active' as const,
      fileUrl: '',
      createdAt: '',
    },
    {
      _id: '4',
      name: 'BIM Management Protocol',
      issuer: 'AEC Systems Hub',
      dateIssued: '2023-08',
      credentialId: 'BIM-5520A',
      status: 'active' as const,
      fileUrl: '',
      createdAt: '',
    },
    {
      _id: '5',
      name: 'Environmental Impact Sim.',
      issuer: 'EcoMetrics Lab',
      dateIssued: '2022-12',
      credentialId: 'ENV-3301Z',
      status: 'active' as const,
      fileUrl: '',
      createdAt: '',
    },
    {
      _id: '6',
      name: 'Smart Material Engineering',
      issuer: 'TechPoly Institute',
      dateIssued: '2021-09',
      credentialId: 'MAT-1188Q',
      status: 'active' as const,
      fileUrl: '',
      createdAt: '',
    },
    {
      _id: '7',
      name: 'Computational Fluid Dyn.',
      issuer: 'Airflow Analytics',
      dateIssued: '2023-03',
      credentialId: 'CFD-2022Y',
      status: 'active' as const,
      fileUrl: '',
      createdAt: '',
    },
    {
      _id: '8',
      name: 'Adaptive Reuse Certification',
      issuer: 'Heritage Design Org',
      dateIssued: '2020-11',
      credentialId: 'URB-9001K',
      status: 'active' as const,
      fileUrl: '',
      createdAt: '',
    }
  ];

  return (
    <div className="flex-grow pt-10 pb-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full relative z-10">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 glass-panel flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary">workspace_premium</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md text-primary uppercase">Certification Repository</h1>
            <div className="dimension-line mt-2 mb-2 w-64"></div>
            <p className="font-technical-sm text-[10px] sm:text-technical-sm text-on-surface-variant uppercase tracking-widest">
              System Index: 004 // Verified Technical Credentials
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Certificates Client Component */}
      <CertificatesClient initialCerts={displayCerts} />
    </div>
  );
}
