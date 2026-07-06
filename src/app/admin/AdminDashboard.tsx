'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addCertificate, deleteCertificate, logout, updateBiodata } from '../actions';

interface AdminCert {
  _id: string;
  name: string;
  issuer: string;
  dateIssued: string;
  credentialId: string;
  status: 'active' | 'expired';
  fileUrl: string;
  fileSize?: number;
}

interface AdminBiodata {
  name: string;
  designation: string;
  specialization: string;
  statement: string;
  sysVer: string;
  status: string;
  photoUrl: string;
  competencies?: Array<{ name: string; value: number }>;
}

export default function AdminDashboard({ 
  initialCerts,
  initialBiodata
}: { 
  initialCerts: AdminCert[];
  initialBiodata: AdminBiodata | null;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [status, setStatus] = useState<'active' | 'expired'>('active');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Biodata state
  const [bioName, setBioName] = useState(initialBiodata?.name || 'J. DOE');
  const [bioDesignation, setBioDesignation] = useState(initialBiodata?.designation || 'Lead Architect // Systems Designer');
  const [bioSpecialization, setBioSpecialization] = useState(initialBiodata?.specialization || 'Computational Geometry & Structural Logic');
  const [bioStatement, setBioStatement] = useState(initialBiodata?.statement || 'Bridging the gap between speculative engineering and functional architecture through high-fidelity digital prototyping and mathematical precision.');
  const [bioSysVer, setBioSysVer] = useState(initialBiodata?.sysVer || '4.2.0');
  const [bioStatus, setBioStatus] = useState(initialBiodata?.status || 'ONLINE');
  const [bioPhotoUrl, setBioPhotoUrl] = useState(initialBiodata?.photoUrl || '');
  const [bioPhotoFile, setBioPhotoFile] = useState<File | null>(null);

  // Competencies state
  const [comp1Name, setComp1Name] = useState(initialBiodata?.competencies?.[0]?.name || 'Systems Architecture');
  const [comp1Value, setComp1Value] = useState(initialBiodata?.competencies?.[0]?.value || 94);
  const [comp2Name, setComp2Name] = useState(initialBiodata?.competencies?.[1]?.name || 'Generative Design');
  const [comp2Value, setComp2Value] = useState(initialBiodata?.competencies?.[1]?.value || 88);
  const [comp3Name, setComp3Name] = useState(initialBiodata?.competencies?.[2]?.name || 'Structural Logic');
  const [comp3Value, setComp3Value] = useState(initialBiodata?.competencies?.[2]?.value || 91);

  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState('');
  const [bioSuccess, setBioSuccess] = useState('');

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!name || !issuer || !dateIssued || !credentialId) {
      setError('Please fill in all text fields.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('issuer', issuer);
    formData.append('dateIssued', dateIssued);
    formData.append('credentialId', credentialId);
    formData.append('status', status);
    if (file) {
      formData.append('file', file);
    }

    try {
      const res = await addCertificate(formData);
      if (res.success) {
        setSuccess('Certificate recorded and saved successfully.');
        setName('');
        setIssuer('');
        setDateIssued('');
        setCredentialId('');
        setStatus('active');
        setFile(null);
        // Reset file input element manually
        const fileInput = document.getElementById('asset-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        router.refresh();
      } else {
        setError(res.error || 'Failed to add certificate.');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    
    try {
      const res = await deleteCertificate(id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || 'Failed to delete');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleBioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBioError('');
    setBioSuccess('');
    setBioLoading(true);

    const formData = new FormData();
    formData.append('name', bioName);
    formData.append('designation', bioDesignation);
    formData.append('specialization', bioSpecialization);
    formData.append('statement', bioStatement);
    formData.append('sysVer', bioSysVer);
    formData.append('status', bioStatus);
    formData.append('photoUrl', bioPhotoUrl);
    if (bioPhotoFile) {
      formData.append('photoFile', bioPhotoFile);
    }
    formData.append('comp1Name', comp1Name);
    formData.append('comp1Value', String(comp1Value));
    formData.append('comp2Name', comp2Name);
    formData.append('comp2Value', String(comp2Value));
    formData.append('comp3Name', comp3Name);
    formData.append('comp3Value', String(comp3Value));

    try {
      const res = await updateBiodata(formData);
      if (res.success) {
        setBioSuccess('Biodata updated successfully.');
        setBioPhotoFile(null);
        router.refresh();
      } else {
        setBioError(res.error || 'Failed to update biodata.');
      }
    } catch (err: any) {
      setBioError(`Error: ${err.message}`);
    } finally {
      setBioLoading(false);
    }
  };

  return (
    <div className="flex pt-4 min-h-[calc(100vh-160px)] max-w-max-width mx-auto w-full relative z-10">
      {/* Background blueprint guide decoration */}
      <div className="fixed inset-0 blueprint-grid-lg pointer-events-none opacity-20 z-[-1]"></div>

      <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12">
        {/* Header */}
        <header className="mb-12 relative flex justify-between items-start">
          <div>
            <div className="absolute -left-4 top-2 bottom-2 w-[1px] bg-secondary/50 hidden md:block"></div>
            <p className="font-technical-sm text-technical-sm text-secondary mb-2 tracking-widest glow-text">
              SYSTEM.ADMIN // CONTROL_PANEL_v1.6
            </p>
            <h1 className="font-headline-md text-headline-md text-primary tracking-tight">
              Control Panel &amp; Management
            </h1>
            <div className="dimension-line mt-6 max-w-md hidden md:block"></div>
          </div>
          <button 
            onClick={handleLogout}
            className="font-label-caps text-label-caps text-on-surface-variant border border-outline-variant px-4 py-2 hover:text-error hover:border-error transition-all cursor-pointer"
          >
            DISCONNECT_SESSION
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Input Section: Add New Certificate */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel rounded-lg p-6 glow-effect transition-all duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-outline/30 pb-4 relative z-10">
                <h2 className="font-technical-sm text-technical-sm text-primary tracking-wider">
                  INPUT_NODE // ADD_CERT
                </h2>
                <span className="material-symbols-outlined text-secondary text-sm">add_circle</span>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {error && (
                  <div className="border border-error/50 bg-error/10 text-error p-3 rounded text-technical-sm font-technical-sm tracking-wider uppercase text-center">
                    ERROR: {error}
                  </div>
                )}
                {success && (
                  <div className="border border-secondary/50 bg-secondary/10 text-secondary p-3 rounded text-technical-sm font-technical-sm tracking-wider uppercase text-center">
                    SUCCESS: {success}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block">
                    CERTIFICATE_NAME
                  </label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all" 
                    placeholder="e.g. Advanced Structural Eng" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block">
                    ISSUING_ORG
                  </label>
                  <input 
                    type="text" 
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all" 
                    placeholder="e.g. AIA" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant block">
                      DATE_ISSUED
                    </label>
                    <input 
                      type="month" 
                      value={dateIssued}
                      onChange={(e) => setDateIssued(e.target.value)}
                      className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant block">
                      STATUS
                    </label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'active' | 'expired')}
                      className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all"
                    >
                      <option value="active">ACTIVE</option>
                      <option value="expired">EXPIRED</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block">
                    CREDENTIAL_ID
                  </label>
                  <input 
                    type="text" 
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                    className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all" 
                    placeholder="ID-XXXX-YYYY" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block">
                    ASSET_UPLOAD
                  </label>
                  <div className="border-2 border-dashed border-outline/50 rounded-lg p-6 text-center hover:border-secondary/70 hover:bg-secondary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 relative">
                    <input 
                      type="file" 
                      id="asset-upload"
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="material-symbols-outlined text-secondary opacity-70">cloud_upload</span>
                    <span className="font-technical-sm text-technical-sm text-on-surface-variant block">
                      {file ? file.name : 'Drop schematic file here or click to browse'}
                    </span>
                    <span className="font-label-caps text-label-caps text-outline-variant block mt-2">
                      SUPPORTS: PDF, PNG, JPG (MAX 5MB)
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-outline/30 flex justify-end gap-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setName('');
                      setIssuer('');
                      setDateIssued('');
                      setCredentialId('');
                      setFile(null);
                    }}
                    className="font-technical-sm text-technical-sm text-on-surface-variant px-4 py-2 border border-outline/50 rounded hover:text-primary hover:border-primary transition-all cursor-pointer"
                  >
                    RESET
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="font-technical-sm text-technical-sm text-surface bg-secondary px-6 py-2 rounded hover:shadow-[0_0_15px_rgba(176,198,255,0.5)] transition-all font-bold cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'EXECUTING...' : 'EXECUTE_SAVE'}
                  </button>
                </div>
              </form>
            </div>

            {/* Biodata Config Form */}
            <div className="glass-panel rounded-lg p-6 glow-effect transition-all duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-outline/30 pb-4 relative z-10">
                <h2 className="font-technical-sm text-technical-sm text-primary tracking-wider">
                  SYSTEM_CONFIG // BIODATA_EDIT
                </h2>
                <span className="material-symbols-outlined text-secondary text-sm">settings</span>
              </div>
              
              <form onSubmit={handleBioSubmit} className="space-y-6 relative z-10">
                {bioError && (
                  <div className="border border-error/50 bg-error/10 text-error p-3 rounded text-technical-sm font-technical-sm tracking-wider uppercase text-center">
                    ERROR: {bioError}
                  </div>
                )}
                {bioSuccess && (
                  <div className="border border-secondary/50 bg-secondary/10 text-secondary p-3 rounded text-technical-sm font-technical-sm tracking-wider uppercase text-center">
                    SUCCESS: {bioSuccess}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block">
                    PERSONNEL_NAME
                  </label>
                  <input 
                    type="text" 
                    value={bioName}
                    onChange={(e) => setBioName(e.target.value)}
                    className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all" 
                    placeholder="e.g. J. DOE" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block">
                    DESIGNATION
                  </label>
                  <input 
                    type="text" 
                    value={bioDesignation}
                    onChange={(e) => setBioDesignation(e.target.value)}
                    className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all" 
                    placeholder="e.g. Lead Architect // Systems Designer" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block">
                    SPECIALIZATION
                  </label>
                  <input 
                    type="text" 
                    value={bioSpecialization}
                    onChange={(e) => setBioSpecialization(e.target.value)}
                    className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all" 
                    placeholder="e.g. Computational Geometry" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block">
                    STATEMENT
                  </label>
                  <textarea 
                    value={bioStatement}
                    onChange={(e) => setBioStatement(e.target.value)}
                    rows={3}
                    className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all resize-none" 
                    placeholder="Statement..." 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant block">
                      SYSTEM_VERSION
                    </label>
                    <input 
                      type="text" 
                      value={bioSysVer}
                      onChange={(e) => setBioSysVer(e.target.value)}
                      className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all" 
                      placeholder="4.2.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant block">
                      STATUS
                    </label>
                    <input 
                      type="text" 
                      value={bioStatus}
                      onChange={(e) => setBioStatus(e.target.value)}
                      className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all" 
                      placeholder="ONLINE"
                    />
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="space-y-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block">
                    PROFILE_PHOTO_UPLOAD
                  </label>
                  <div className="border-2 border-dashed border-outline/50 rounded-lg p-6 text-center hover:border-secondary/70 hover:bg-secondary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 relative">
                    <input 
                      type="file" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setBioPhotoFile(e.target.files[0]);
                        }
                      }}
                      accept=".png,.jpg,.jpeg"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="material-symbols-outlined text-secondary opacity-70">photo_camera</span>
                    <span className="font-technical-sm text-technical-sm text-on-surface-variant block">
                      {bioPhotoFile ? bioPhotoFile.name : 'Choose profile image file'}
                    </span>
                    <span className="font-label-caps text-label-caps text-outline-variant block mt-2">
                      SUPPORTS: PNG, JPG (MAX 5MB)
                    </span>
                  </div>
                  {bioPhotoUrl && !bioPhotoFile && (
                    <div className="text-[10px] font-technical-sm text-secondary truncate mt-1">
                      CURRENT: {bioPhotoUrl}
                    </div>
                  )}
                </div>

                {/* Core Competencies Edit */}
                <div className="space-y-4 border-t border-outline/25 pt-4">
                  <div className="font-label-caps text-[10px] text-secondary tracking-widest">
                    [ COMPETENCY_DATA ]
                  </div>
                  
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <input 
                      type="text" 
                      value={comp1Name}
                      onChange={(e) => setComp1Name(e.target.value)}
                      className="col-span-8 bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-2" 
                      placeholder="Competency 1" 
                    />
                    <input 
                      type="number" 
                      value={comp1Value}
                      onChange={(e) => setComp1Value(parseInt(e.target.value || '0'))}
                      className="col-span-4 bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-2" 
                      min="0" max="100"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-3 items-center">
                    <input 
                      type="text" 
                      value={comp2Name}
                      onChange={(e) => setComp2Name(e.target.value)}
                      className="col-span-8 bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-2" 
                      placeholder="Competency 2" 
                    />
                    <input 
                      type="number" 
                      value={comp2Value}
                      onChange={(e) => setComp2Value(parseInt(e.target.value || '0'))}
                      className="col-span-4 bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-2" 
                      min="0" max="100"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-3 items-center">
                    <input 
                      type="text" 
                      value={comp3Name}
                      onChange={(e) => setComp3Name(e.target.value)}
                      className="col-span-8 bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-2" 
                      placeholder="Competency 3" 
                    />
                    <input 
                      type="number" 
                      value={comp3Value}
                      onChange={(e) => setComp3Value(parseInt(e.target.value || '0'))}
                      className="col-span-4 bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-2" 
                      min="0" max="100"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-outline/30 flex justify-end gap-4">
                  <button 
                    type="submit" 
                    disabled={bioLoading}
                    className="font-technical-sm text-technical-sm text-surface bg-secondary px-6 py-2 rounded hover:shadow-[0_0_15px_rgba(176,198,255,0.5)] transition-all font-bold cursor-pointer disabled:opacity-50"
                  >
                    {bioLoading ? 'UPDATING...' : 'UPDATE_BIODATA'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Table Section: Recent Certificates */}
          <div className="lg:col-span-7 flex flex-col gap-6 mt-8 lg:mt-0">
            <div className="glass-panel rounded-lg p-0 glow-effect transition-all duration-300 h-full flex flex-col">
              <div className="p-6 border-b border-outline/30 flex items-center justify-between relative z-10 bg-surface/40 backdrop-blur-sm">
                <h2 className="font-technical-sm text-technical-sm text-primary tracking-wider">
                  DATA_TABLE // RECENT_CERTS
                </h2>
              </div>
              
              <div className="overflow-x-auto relative z-10 flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline/30 bg-surface-container/30">
                      <th className="p-4 font-label-caps text-label-caps text-on-surface-variant font-normal">CERTIFICATE</th>
                      <th className="p-4 font-label-caps text-label-caps text-on-surface-variant font-normal hidden md:table-cell">ORG</th>
                      <th className="p-4 font-label-caps text-label-caps text-on-surface-variant font-normal">STATUS</th>
                      <th className="p-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="font-technical-sm text-technical-sm text-on-surface divide-y divide-outline/20">
                    {initialCerts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-on-surface-variant italic">
                          No certificate records found in database.
                        </td>
                      </tr>
                    ) : (
                      initialCerts.map((cert) => (
                        <tr key={cert._id} className="hover:bg-primary/5 transition-colors group">
                          <td className="p-4">
                            <div className="text-primary font-bold">{cert.name}</div>
                            <div className="text-outline-variant text-[10px] mt-1">ID: {cert.credentialId}</div>
                          </td>
                          <td className="p-4 hidden md:table-cell text-on-surface-variant">
                            {cert.issuer}
                          </td>
                          <td className="p-4">
                            {cert.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-secondary border border-secondary/30 px-2 py-1 rounded bg-secondary/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_5px_rgba(176,198,255,0.8)]"></span> ACTIVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-outline border border-outline/30 px-2 py-1 rounded bg-outline/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> EXPIRED
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleDelete(cert._id)}
                                className="p-1 hover:text-error transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-outline/30 bg-surface/40 backdrop-blur-sm relative z-10 flex justify-between items-center">
                <span className="font-label-caps text-label-caps text-outline-variant">
                  TOTAL_RECORDS: {String(initialCerts.length).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
