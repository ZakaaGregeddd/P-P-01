'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addCertificate, deleteCertificate, logout, updateBiodata, updateProject, updateCertificate, updateSettings } from '../actions';

interface AdminCert {
  _id: string;
  name: string;
  issuer: string;
  dateIssued: string;
  credentialId: string;
  status: 'active' | 'expired';
  fileUrl: string;
  fileSize?: number;
  description?: string;
  customLabel?: string;
}

interface AdminSettings {
  systemVersion: string;
  authProtocol: string;
  isOverdriveOff: boolean;
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

interface AdminProject {
  projectId: string;
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

export default function AdminDashboard({ 
  initialCerts,
  initialBiodata,
  initialProjects = [],
  initialSettings
}: { 
  initialCerts: AdminCert[];
  initialBiodata: AdminBiodata | null;
  initialProjects?: AdminProject[];
  initialSettings?: AdminSettings;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [status, setStatus] = useState<'active' | 'expired'>('active');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [editingFileUrl, setEditingFileUrl] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  const [loading, setLoading] = useState(false);

  // Biodata state
  const [bioName, setBioName] = useState(initialBiodata?.name || 'J. DOE');
  const [bioDesignation, setBioDesignation] = useState(initialBiodata?.designation || 'Lead Architect // Systems Designer');
  const [bioSpecialization, setBioSpecialization] = useState(initialBiodata?.specialization || 'Computational Geometry & Structural Logic');
  const [bioStatement, setBioStatement] = useState(initialBiodata?.statement || 'Bridging the gap between speculative engineering and functional architecture through high-fidelity digital prototyping and mathematical precision.');
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

  // Projects states
  const proj1 = initialProjects.find(p => p.projectId === 'proj-1');
  const proj2 = initialProjects.find(p => p.projectId === 'proj-2');

  const [proj1Tag, setProj1Tag] = useState(proj1?.tag || 'PROJ_01');
  const [proj1Title, setProj1Title] = useState(proj1?.title || 'Neural Pathway Mapping');
  const [proj1Desc, setProj1Desc] = useState(proj1?.description || 'High-density data visualization system conceptualized for mapping complex associative networks.');
  const [proj1Link, setProj1Link] = useState(proj1?.linkUrl || '/projects/neural-pathway');
  const [proj1ImgUrl, setProj1ImgUrl] = useState(proj1?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7LtYjfirw2hK3RG-Xo5um7WLXaKwxJCaF7MS9JUL6hg4E68_gHj_btiSFcI3toAV83_3_1Ne7UVqwfXT2yXC9dTHL-GkDaQDA8JZBOPeiJrnkhJ8GE7sc0JvFidkqFBl6Oi3oqs7SefIDoQULaWPos6P79oZtU1c_SMWqjFTNyffLAqWegrQziFRqp9ux2MDps5rBs8AZ_A6_RzF0ZvCra2fhfdXNcn_HOzZAhjRSY7aUtCbN-oM');
  const [proj1File, setProj1File] = useState<File | null>(null);

  const [proj2Tag, setProj2Tag] = useState(proj2?.tag || 'PROJ_02');
  const [proj2Title, setProj2Title] = useState(proj2?.title || 'Void Terminal');
  const [proj2Desc, setProj2Desc] = useState(proj2?.description || 'Command line interface redesign focusing on cognitive offloading.');
  const [proj2Link, setProj2Link] = useState(proj2?.linkUrl || '/projects/void-terminal');
  const [proj2ImgUrl, setProj2ImgUrl] = useState(proj2?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsGpYQQnihiuoyOEwkpyV5zE_C-BoPuC1KONYQ7LMwYSCTI2o8bPwosHPejqCGQ2PCCcxfTpQXUtdLrpAMdQBsO-KPBg4S6Dmo9K63mC2YbYkTFss57VB_2bYDpvK7RBb9dreqUBn9VD-f91FqiBVdSTHIwnH-b7uZU6T0o92d62Wqmhvv6tLQnTWfUvalZRa_qkoFsa4niweyaxHn6KMAxnlx63_Zulkt8AqX_x7YsjXSbwDJo5g');
  const [proj2File, setProj2File] = useState<File | null>(null);

  const [projLoading, setProjLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'certificates' | 'settings'>('profile');

  // General Settings states
  const [sysVersion, setSysVersion] = useState(initialSettings?.systemVersion || '4.2.0');
  const [authProtocol, setAuthProtocol] = useState(initialSettings?.authProtocol || 'V.04');
  const [isOverdriveOff, setIsOverdriveOff] = useState(initialSettings?.isOverdriveOff || false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);

    const formData = new FormData();
    formData.append('systemVersion', sysVersion);
    formData.append('authProtocol', authProtocol);
    formData.append('isOverdriveOff', String(isOverdriveOff));

    try {
      const res = await updateSettings(formData);
      if (res.success) {
        alert('Global settings updated successfully.');
        router.refresh();
      } else {
        alert(res.error || 'Failed to update configuration.');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent, projNum: 1 | 2) => {
    e.preventDefault();
    setProjLoading(true);

    const formData = new FormData();
    formData.append('projectId', `proj-${projNum}`);
    if (projNum === 1) {
      formData.append('tag', proj1Tag);
      formData.append('title', proj1Title);
      formData.append('description', proj1Desc);
      formData.append('linkUrl', proj1Link);
      formData.append('imageUrl', proj1ImgUrl);
      if (proj1File) {
        formData.append('imageFile', proj1File);
      }
    } else {
      formData.append('tag', proj2Tag);
      formData.append('title', proj2Title);
      formData.append('description', proj2Desc);
      formData.append('linkUrl', proj2Link);
      formData.append('imageUrl', proj2ImgUrl);
      if (proj2File) {
        formData.append('imageFile', proj2File);
      }
    }

    try {
      const res = await updateProject(formData);
      if (res.success) {
        alert(`Project ${projNum} updated successfully.`);
        if (projNum === 1) {
          setProj1File(null);
        } else {
          setProj2File(null);
        }
        router.refresh();
      } else {
        alert(res.error || 'Failed to update project.');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProjLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !issuer || !dateIssued || !credentialId) {
      alert('Please fill in all text fields.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('issuer', issuer);
    formData.append('dateIssued', dateIssued);
    formData.append('credentialId', credentialId);
    formData.append('status', status);
    formData.append('description', description);
    formData.append('customLabel', customLabel);
    if (file) {
      formData.append('file', file);
    }

    try {
      let res;
      if (editingCertId) {
        formData.append('id', editingCertId);
        formData.append('fileUrl', editingFileUrl);
        res = await updateCertificate(formData);
      } else {
        res = await addCertificate(formData);
      }

      if (res.success) {
        alert(editingCertId ? 'Certificate updated successfully.' : 'Certificate recorded and saved successfully.');
        setName('');
        setIssuer('');
        setDateIssued('');
        setCredentialId('');
        setStatus('active');
        setDescription('');
        setFile(null);
        setCustomLabel('');
        setEditingCertId(null);
        setEditingFileUrl('');
        // Reset file input element manually
        const fileInput = document.getElementById('asset-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        router.refresh();
      } else {
        alert(res.error || `Failed to ${editingCertId ? 'update' : 'add'} certificate.`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
    setBioLoading(true);

    const formData = new FormData();
    formData.append('name', bioName);
    formData.append('designation', bioDesignation);
    formData.append('specialization', bioSpecialization);
    formData.append('statement', bioStatement);
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
        alert('Biodata updated successfully.');
        setBioPhotoFile(null);
        router.refresh();
      } else {
        alert(res.error || 'Failed to update biodata.');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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

        <div className="flex flex-col lg:flex-row gap-gutter items-stretch mt-8 w-full">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 border-b lg:border-b-0 lg:border-r border-outline-variant/30 pb-6 lg:pb-0 lg:pr-6 overflow-x-auto lg:overflow-x-visible shrink-0 z-20">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 font-technical-sm text-technical-sm tracking-wider border transition-all cursor-pointer text-left uppercase whitespace-nowrap lg:whitespace-normal w-fit lg:w-full ${
                activeTab === 'profile'
                  ? 'bg-secondary/15 border-secondary text-primary glow-text font-bold'
                  : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container/50 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              <span>BIODATA_NODE</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-3 px-4 py-3 font-technical-sm text-technical-sm tracking-wider border transition-all cursor-pointer text-left uppercase whitespace-nowrap lg:whitespace-normal w-fit lg:w-full ${
                activeTab === 'projects'
                  ? 'bg-secondary/15 border-secondary text-primary glow-text font-bold'
                  : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container/50 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
              <span>PROJECT_NODES</span>
            </button>

            <button
              onClick={() => setActiveTab('certificates')}
              className={`flex items-center gap-3 px-4 py-3 font-technical-sm text-technical-sm tracking-wider border transition-all cursor-pointer text-left uppercase whitespace-nowrap lg:whitespace-normal w-fit lg:w-full ${
                activeTab === 'certificates'
                  ? 'bg-secondary/15 border-secondary text-primary glow-text font-bold'
                  : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container/50 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
              <span>CERTIFICATE_DATA</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-3 font-technical-sm text-technical-sm tracking-wider border transition-all cursor-pointer text-left uppercase whitespace-nowrap lg:whitespace-normal w-fit lg:w-full ${
                activeTab === 'settings'
                  ? 'bg-secondary/15 border-secondary text-primary glow-text font-bold'
                  : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container/50 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">settings_accessibility</span>
              <span>SYSTEM_SETTINGS</span>
            </button>
          </aside>

          {/* Active Tab Panel */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <div className="max-w-4xl glass-panel rounded-lg p-4 sm:p-6 glow-effect transition-all duration-300">
                <div className="flex items-center justify-between mb-6 border-b border-outline/30 pb-4 relative z-10">
                  <h2 className="font-technical-sm text-technical-sm text-primary tracking-wider">
                    SYSTEM_CONFIG // BIODATA_EDIT
                  </h2>
                  <span className="material-symbols-outlined text-secondary text-sm">settings</span>
                </div>
                
                <form onSubmit={handleBioSubmit} className="space-y-6 relative z-10">


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
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <header className="mb-6">
                  <p className="font-technical-sm text-technical-sm text-secondary mb-1 tracking-widest glow-text">
                    RESOURCE.MANAGEMENT // BENTO_GRID_ITEMS
                  </p>
                  <h2 className="font-headline-md text-2xl text-primary tracking-tight">
                    Manage Featured Projects
                  </h2>
                </header>



                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  {/* PROJ 1 Form */}
                  <div className="glass-panel rounded-lg p-4 sm:p-6 glow-effect transition-all duration-300">
                    <div className="flex items-center justify-between mb-6 border-b border-outline/30 pb-4 relative z-10">
                      <h3 className="font-technical-sm text-technical-sm text-primary tracking-wider">
                        NODE_01 // PROJ_01 (LARGE_PANEL)
                      </h3>
                      <span className="material-symbols-outlined text-secondary text-sm">settings</span>
                    </div>
                    
                    <form onSubmit={(e) => handleProjectSubmit(e, 1)} className="space-y-6 relative z-10">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="font-label-caps text-label-caps text-on-surface-variant block">TAG</label>
                          <input 
                            type="text" 
                            value={proj1Tag}
                            onChange={(e) => setProj1Tag(e.target.value)}
                            className="w-full bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-3" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-label-caps text-label-caps text-on-surface-variant block">TITLE</label>
                          <input 
                            type="text" 
                            value={proj1Title}
                            onChange={(e) => setProj1Title(e.target.value)}
                            className="w-full bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-3" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block">DESCRIPTION</label>
                        <textarea 
                          value={proj1Desc}
                          onChange={(e) => setProj1Desc(e.target.value)}
                          rows={3}
                          className="w-full bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-3" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="font-label-caps text-label-caps text-on-surface-variant block">REDIRECT LINK</label>
                          <input 
                            type="text" 
                            value={proj1Link}
                            onChange={(e) => setProj1Link(e.target.value)}
                            className="w-full bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-3" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-label-caps text-label-caps text-on-surface-variant block">IMAGE FILE (OPTIONAL)</label>
                          <div className="border border-dashed border-outline/50 rounded p-2 text-center relative cursor-pointer hover:bg-secondary/5 transition-all">
                            <input 
                              type="file" 
                              accept=".png,.jpg,.jpeg"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setProj1File(e.target.files[0]);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <span className="font-technical-sm text-[11px] text-on-surface-variant block truncate">
                              {proj1File ? proj1File.name : 'Upload New Image'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block">IMAGE URL (FALLBACK)</label>
                        <input 
                          type="text" 
                          value={proj1ImgUrl}
                          onChange={(e) => setProj1ImgUrl(e.target.value)}
                          className="w-full bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-3" 
                        />
                      </div>

                      <div className="pt-4 border-t border-outline/30 flex justify-end">
                        <button 
                          type="submit" 
                          disabled={projLoading}
                          className="font-technical-sm text-technical-sm text-surface bg-secondary px-6 py-2 rounded hover:shadow-[0_0_15px_rgba(176,198,255,0.5)] transition-all font-bold cursor-pointer disabled:opacity-50"
                        >
                          {projLoading ? 'SAVING...' : 'SAVE_PROJECT_01'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* PROJ 2 Form */}
                  <div className="glass-panel rounded-lg p-4 sm:p-6 glow-effect transition-all duration-300">
                    <div className="flex items-center justify-between mb-6 border-b border-outline/30 pb-4 relative z-10">
                      <h3 className="font-technical-sm text-technical-sm text-primary tracking-wider">
                        NODE_02 // PROJ_02 (SMALL_PANEL)
                      </h3>
                      <span className="material-symbols-outlined text-secondary text-sm">settings</span>
                    </div>
                    
                    <form onSubmit={(e) => handleProjectSubmit(e, 2)} className="space-y-6 relative z-10">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="font-label-caps text-label-caps text-on-surface-variant block">TAG</label>
                          <input 
                            type="text" 
                            value={proj2Tag}
                            onChange={(e) => setProj2Tag(e.target.value)}
                            className="w-full bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-3" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-label-caps text-label-caps text-on-surface-variant block">TITLE</label>
                          <input 
                            type="text" 
                            value={proj2Title}
                            onChange={(e) => setProj2Title(e.target.value)}
                            className="w-full bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-3" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block">DESCRIPTION</label>
                        <textarea 
                          value={proj2Desc}
                          onChange={(e) => setProj2Desc(e.target.value)}
                          rows={3}
                          className="w-full bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-3" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="font-label-caps text-label-caps text-on-surface-variant block">REDIRECT LINK</label>
                          <input 
                            type="text" 
                            value={proj2Link}
                            onChange={(e) => setProj2Link(e.target.value)}
                            className="w-full bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-3" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-label-caps text-label-caps text-on-surface-variant block">IMAGE FILE (OPTIONAL)</label>
                          <div className="border border-dashed border-outline/50 rounded p-2 text-center relative cursor-pointer hover:bg-secondary/5 transition-all">
                            <input 
                              type="file" 
                              accept=".png,.jpg,.jpeg"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setProj2File(e.target.files[0]);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <span className="font-technical-sm text-[11px] text-on-surface-variant block truncate">
                              {proj2File ? proj2File.name : 'Upload New Image'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block">IMAGE URL (FALLBACK)</label>
                        <input 
                          type="text" 
                          value={proj2ImgUrl}
                          onChange={(e) => setProj2ImgUrl(e.target.value)}
                          className="w-full bg-surface-container/50 border border-outline/50 rounded text-technical-sm text-primary p-3" 
                        />
                      </div>

                      <div className="pt-4 border-t border-outline/30 flex justify-end">
                        <button 
                          type="submit" 
                          disabled={projLoading}
                          className="font-technical-sm text-technical-sm text-surface bg-secondary px-6 py-2 rounded hover:shadow-[0_0_15px_rgba(176,198,255,0.5)] transition-all font-bold cursor-pointer disabled:opacity-50"
                        >
                          {projLoading ? 'SAVING...' : 'SAVE_PROJECT_02'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                {/* Input Section: Add New Certificate */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="glass-panel rounded-lg p-4 sm:p-6 glow-effect transition-all duration-300">
                    <div className="flex items-center justify-between mb-6 border-b border-outline/30 pb-4 relative z-10">
                      <h2 className="font-technical-sm text-technical-sm text-primary tracking-wider">
                        {editingCertId ? 'CONFIG_NODE // EDIT_CERT' : 'INPUT_NODE // ADD_CERT'}
                      </h2>
                      <span className="material-symbols-outlined text-secondary text-sm">
                        {editingCertId ? 'edit_document' : 'add_circle'}
                      </span>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">


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
                          CUSTOM_LABEL (OPTIONAL)
                        </label>
                        <input 
                          type="text" 
                          value={customLabel}
                          onChange={(e) => setCustomLabel(e.target.value)}
                          className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all" 
                          placeholder="e.g. CORE_CREDENTIAL (or blank for default)" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block">
                          DESCRIPTION
                        </label>
                        <textarea 
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={2}
                          className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all" 
                          placeholder="Brief description of credentials..."
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
                            setDescription('');
                            setFile(null);
                            setEditingCertId(null);
                            setEditingFileUrl('');
                          }}
                          className="font-technical-sm text-technical-sm text-on-surface-variant px-4 py-2 border border-outline/50 rounded hover:text-primary hover:border-primary transition-all cursor-pointer"
                        >
                          {editingCertId ? 'CANCEL_EDIT' : 'RESET'}
                        </button>
                        <button 
                          type="submit" 
                          disabled={loading}
                          className="font-technical-sm text-technical-sm text-surface bg-secondary px-6 py-2 rounded hover:shadow-[0_0_15px_rgba(176,198,255,0.5)] transition-all font-bold cursor-pointer disabled:opacity-50"
                        >
                          {loading ? 'EXECUTING...' : (editingCertId ? 'EXECUTE_UPDATE' : 'EXECUTE_SAVE')}
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
                                      onClick={() => {
                                        setEditingCertId(cert._id);
                                        setName(cert.name);
                                        setIssuer(cert.issuer);
                                        setDateIssued(cert.dateIssued);
                                        setCredentialId(cert.credentialId);
                                        setStatus(cert.status);
                                        setDescription(cert.description || '');
                                        setEditingFileUrl(cert.fileUrl);
                                        setCustomLabel(cert.customLabel || '');
                                        
                                        // Optional: scroll form into view for mobile users
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="p-1 hover:text-secondary transition-colors cursor-pointer"
                                      title="Edit Certificate"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">edit</span>
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(cert._id)}
                                      className="p-1 hover:text-error transition-colors cursor-pointer"
                                      title="Delete Certificate"
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
            )}

            {activeTab === 'settings' && (
              <div className="max-w-4xl glass-panel rounded-lg p-4 sm:p-6 glow-effect transition-all duration-300">
                <div className="flex items-center justify-between mb-6 border-b border-outline/30 pb-4 relative z-10">
                  <h2 className="font-technical-sm text-technical-sm text-primary tracking-wider">
                    SYSTEM_CONFIG // GENERAL_SETTINGS
                  </h2>
                  <span className="material-symbols-outlined text-secondary text-sm">settings</span>
                </div>
                
                <form onSubmit={handleSettingsSubmit} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant block">
                      SYSTEM_VERSION
                    </label>
                    <input 
                      type="text" 
                      value={sysVersion}
                      onChange={(e) => setSysVersion(e.target.value)}
                      className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all" 
                      placeholder="e.g. 4.2.0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant block">
                      AUTHENTICATION_PROTOCOL_VERSION
                    </label>
                    <input 
                      type="text" 
                      value={authProtocol}
                      onChange={(e) => setAuthProtocol(e.target.value)}
                      className="w-full bg-surface-container/50 border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all" 
                      placeholder="e.g. V.04"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant block">
                      WEBSITE_OVERDRIVE_STATUS (PUBLIC ACCESS)
                    </label>
                    <select 
                      value={isOverdriveOff ? 'off' : 'on'}
                      onChange={(e) => setIsOverdriveOff(e.target.value === 'off')}
                      className="w-full bg-[#0d0d0d] border border-outline/50 rounded text-body-base text-primary p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 blueprint-grid transition-all cursor-pointer font-technical-sm"
                    >
                      <option value="on">ON // PUBLIC ACCESS ACTIVE</option>
                      <option value="off">OFF // RESTRICTED STANDBY MODE (OFFLINE EXCEPT LOGIN/ADMIN)</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-outline/30 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={settingsLoading}
                      className="font-technical-sm text-technical-sm text-surface bg-secondary px-6 py-2 rounded hover:shadow-[0_0_15px_rgba(176,198,255,0.5)] transition-all font-bold cursor-pointer disabled:opacity-50"
                    >
                      {settingsLoading ? 'COMMITING CONFIG...' : 'COMMIT_SYSTEM_CONFIG'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
