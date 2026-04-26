import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const DOC_TYPES = [
  { key: 'ID_PROOF', label: 'ID Proof', icon: 'badge' },
  { key: 'ADMISSION_LETTER', label: 'Admission Letter', icon: 'description' },
  { key: 'MEDICAL_CERTIFICATE', label: 'Medical Certificate', icon: 'health_and_safety' },
  { key: 'POLICE_VERIFICATION', label: 'Police Verification', icon: 'local_police' },
  { key: 'PASSPORT_PHOTO', label: 'Passport Photo', icon: 'photo_camera' },
  { key: 'OTHER', label: 'Other Document', icon: 'attach_file' },
];

const StatusBadge = ({ status }) => {
  const cfg = {
    PENDING:  { cls: 'bg-yellow-100 text-yellow-700', icon: 'hourglass_empty' },
    VERIFIED: { cls: 'bg-green-100 text-green-700',   icon: 'verified' },
    REJECTED: { cls: 'bg-red-100 text-red-600',       icon: 'cancel' },
  }[status] || { cls: 'bg-gray-100 text-gray-600', icon: 'help' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.cls}`}>
      <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
      {status}
    </span>
  );
};

export default function StudentDocumentsTab({ toast }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/student/documents')
      .then(d => { if (Array.isArray(d)) setDocuments(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const getDocByType = (type) => documents.find(d => d.documentType === type);

  const handleUpload = async (type, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast('File must be under 10 MB', 'error'); return; }

    setUploading(p => ({ ...p, [type]: true }));
    const form = new FormData();
    form.append('documentType', type);
    form.append('file', file);
    try {
      const res = await api.upload('/api/student/documents/upload', form);
      if (res && res.id) { toast('Document uploaded successfully!', 'success'); load(); }
      else toast(res?.message || 'Upload failed', 'error');
    } catch { toast('Upload failed', 'error'); }
    setUploading(p => ({ ...p, [type]: false }));
  };

  const downloadDoc = async (doc) => {
    try {
      const blob = await api.download(`/api/student/documents/${doc.id}/download`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = doc.originalFilename || 'document';
      a.click(); URL.revokeObjectURL(url);
    } catch (err) {
      toast('File missing from server (cloud storage wiped)', 'error');
    }
  };

  const viewDoc = async (doc) => {
    try {
      const blob = await api.download(`/api/student/documents/${doc.id}/download`);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      toast('File missing from server (cloud storage wiped)', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <span className="material-symbols-outlined text-4xl animate-spin text-on-surface-variant">progress_activity</span>
    </div>
  );

  const verified = documents.filter(d => d.status === 'VERIFIED').length;
  const total = DOC_TYPES.length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header Stats */}
      <div className="p-5 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-3xl border border-secondary/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-bold text-secondary uppercase tracking-widest">Document Status</div>
            <div className="text-2xl font-extrabold text-on-surface mt-0.5">{verified} / {total} Verified</div>
          </div>
          <div className="w-14 h-14 relative flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="5" className="text-secondary/10" />
              <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="5"
                strokeDasharray={`${(verified / total) * 138.23} 138.23`}
                className="text-secondary transition-all duration-700" strokeLinecap="round" />
            </svg>
            <span className="absolute text-xs font-extrabold text-secondary">{Math.round((verified / total) * 100)}%</span>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> {verified} Verified</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span> {documents.filter(d=>d.status==='PENDING').length} Pending</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> {documents.filter(d=>d.status==='REJECTED').length} Rejected</span>
        </div>
      </div>

      {/* Document Cards */}
      <div className="grid gap-4">
        {DOC_TYPES.map(({ key, label, icon }) => {
          const doc = getDocByType(key);
          const isUploading = uploading[key];
          return (
            <div key={key} className={`bg-white rounded-2xl border p-5 transition-all ${doc?.status === 'VERIFIED' ? 'border-green-200' : doc?.status === 'REJECTED' ? 'border-red-200' : 'border-outline-variant/10'}`}>
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${doc ? 'bg-secondary/10' : 'bg-surface-container-high'}`}>
                  <span className={`material-symbols-outlined text-2xl ${doc ? 'text-secondary' : 'text-on-surface-variant'}`}>{icon}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-on-surface text-sm">{label}</div>
                  {doc ? (
                    <div className="mt-1 space-y-1">
                      <div className="text-xs text-on-surface-variant truncate">{doc.originalFilename}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={doc.status} />
                        {doc.status === 'REJECTED' && doc.adminNote && (
                          <span className="text-xs text-red-500 italic">"{doc.adminNote}"</span>
                        )}
                        {doc.verifiedBy && (
                          <span className="text-xs text-on-surface-variant">by {doc.verifiedBy}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-on-surface-variant mt-1">Not uploaded yet</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {doc && (
                    <>
                      <button onClick={() => viewDoc(doc)}
                        className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-colors"
                        title="View">
                        <span className="material-symbols-outlined text-base text-on-surface-variant">visibility</span>
                      </button>
                      <button onClick={() => downloadDoc(doc)}
                        className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-colors"
                        title="Download">
                        <span className="material-symbols-outlined text-base text-on-surface-variant">download</span>
                      </button>
                    </>
                  )}
                  <label className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${isUploading ? 'opacity-60 cursor-wait' : 'bg-secondary text-white hover:bg-secondary/90'}`}>
                    {isUploading
                      ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      : <span className="material-symbols-outlined text-sm">{doc ? 'refresh' : 'upload'}</span>
                    }
                    {isUploading ? 'Uploading…' : doc ? 'Replace' : 'Upload'}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={e => { if (e.target.files?.[0]) handleUpload(key, e.target.files[0]); e.target.value = ''; }}
                      disabled={isUploading} />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-on-surface-variant text-center pb-4">
        Accepted: PDF, JPG, PNG, DOC, DOCX · Max file size: 10 MB
      </p>
    </div>
  );
}
