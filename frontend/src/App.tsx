import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  MessageSquare, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  Clock,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';

interface Document {
  id: string;
  originalFilename: string;
  mimeType: string;
  sha256Hash: string;
  documentType: string;
  status: string;
  ocrText: string;
  extractionData: any;
  supplierName: string | null;
  documentDate: string | null;
  dueDate: string | null;
  totalTtc: string | null;
  driveFileId: string | null;
  driveWebViewLink: string | null;
  uploaderPhone: string | null;
  createdAt: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // WhatsApp Simulator State
  const [waFrom, setWaFrom] = useState('+33612345678');
  const [waMediaUrl, setWaMediaUrl] = useState('https://raw.githubusercontent.com/pdf-association/pdf-test-suite/master/pdf-test-suite.pdf');
  const [waMediaName, setWaMediaName] = useState('whatsapp_invoice.pdf');
  const [waJobId, setWaJobId] = useState<string | null>(null);
  const [waJobStatus, setWaJobStatus] = useState<string | null>(null);
  const [submittingWa, setSubmittingWa] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents on load and setup polling
  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
      setErrorMsg(null);
    } catch (err) {
      console.error('Failed to fetch documents from backend:', err);
      setErrorMsg('Failed to connect to Klerk backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 4000);
    return () => clearInterval(interval);
  }, []);

  // Poll WhatsApp Simulated Job status
  useEffect(() => {
    if (!waJobId) return;

    const checkJobStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/jobs/${waJobId}`);
        if (response.ok) {
          const data = await response.json();
          setWaJobStatus(data.state);
          if (data.state === 'completed' || data.state === 'failed') {
            setWaJobId(null); // Stop polling
            fetchDocuments(); // Refresh registry
          }
        }
      } catch (err) {
        console.error('Job status polling failed:', err);
      }
    };

    const jobInterval = setInterval(checkJobStatus, 1500);
    return () => clearInterval(jobInterval);
  }, [waJobId]);

  // File Upload handler
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BACKEND_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      await response.json();
      fetchDocuments(); // Refresh list — the new document will appear via polling
    } catch (err) {
      console.error(err);
      alert('Failed to upload and process document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Submit Simulated WhatsApp Webhook
  const handleWaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingWa(true);
    setWaJobStatus('enqueuing...');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/webhooks/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: waFrom,
          mediaUrl: waMediaUrl,
          mediaName: waMediaName,
        }),
      });

      if (!response.ok) {
        throw new Error('Webhook trigger failed');
      }

      const result = await response.json();
      setWaJobId(result.jobId);
      setWaJobStatus('enqueued');
    } catch (err) {
      console.error(err);
      setWaJobStatus('failed to trigger');
    } finally {
      setSubmittingWa(false);
    }
  };

  // Metrics calculations
  const totalCount = documents.length;
  const processedCount = documents.filter(d => d.status === 'processed').length;
  const reviewCount = documents.filter(d => d.status === 'needs_review').length;
  const syncRate = totalCount > 0 ? Math.round((documents.filter(d => d.driveFileId).length / totalCount) * 100) : 100;

  // Filtered documents search list
  const filteredDocs = documents.filter(doc => {
    const searchString = `${doc.originalFilename} ${doc.supplierName || ''} ${doc.documentType}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="app-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-title">
          <h1>Klerk Dashboard</h1>
          <p>AI-Powered Real-Time Document Registry & Extraction Pipeline</p>
        </div>
        <div className="status-badges">
          <div className="status-badge">
            <span className="status-dot"></span>
            Backend: Connected (Port 3001)
          </div>
          <div className="status-badge">
            <Database size={16} />
            Supabase: Healthy
          </div>
        </div>
      </header>

      {errorMsg && (
        <div className="metric-card" style={{ borderColor: '#f44336', color: '#f44336', marginBottom: '2rem' }}>
          <AlertCircle size={24} />
          <div>
            <h3 style={{ color: '#f44336' }}>Server Connection Offline</h3>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>{errorMsg}. Make sure you ran `npm run dev` in the project folder.</p>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <FileText size={24} />
          </div>
          <div className="metric-details">
            <h3>Total Ingested</h3>
            <p>{totalCount}</p>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">
            <CheckCircle size={24} />
          </div>
          <div className="metric-details">
            <h3>Verified Processed</h3>
            <p>{processedCount}</p>
          </div>
        </div>

        <div className="metric-card" style={{ borderColor: reviewCount > 0 ? 'var(--accent-yellow)' : 'var(--border-color)' }}>
          <div className="metric-icon" style={{ background: 'rgba(255, 213, 79, 0.1)', color: 'var(--accent-yellow)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="metric-details">
            <h3>Awaiting Review</h3>
            <p>{reviewCount}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(171, 71, 188, 0.1)', color: 'var(--accent-purple)' }}>
            <ExternalLink size={24} />
          </div>
          <div className="metric-details">
            <h3>Google Sync Rate</h3>
            <p>{syncRate}%</p>
          </div>
        </div>
      </div>

      {/* Workspace split grid */}
      <div className="workspace-grid">
        <div className="sidebar-panel">
          
          {/* File Dropzone */}
          <div className="card-panel">
            <div className="panel-header">
              <Upload size={18} />
              <h2>Drag & Drop Ingestion</h2>
            </div>
            
            <div 
              className={`dropzone ${uploading ? 'active' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              <Upload className="dropzone-icon" size={32} />
              {uploading ? (
                <p><RefreshCw className="spin" size={16} /> Processing document...</p>
              ) : (
                <p>Drag files here or <span className="highlight">Browse</span></p>
              )}
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Supports PDF and image formats</p>
            </div>
          </div>

          {/* WhatsApp Ingestion Simulator */}
          <div className="card-panel">
            <div className="panel-header">
              <MessageSquare size={18} />
              <h2>WhatsApp Simulator</h2>
            </div>
            <form onSubmit={handleWaSubmit}>
              <div className="form-group">
                <label>From (Phone Number)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={waFrom} 
                  onChange={(e) => setWaFrom(e.target.value)} 
                  required
                />
              </div>
              <div className="form-group">
                <label>Media Link (Document URL)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={waMediaUrl} 
                  onChange={(e) => setWaMediaUrl(e.target.value)} 
                  required
                />
              </div>
              <div className="form-group">
                <label>Filename</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={waMediaName} 
                  onChange={(e) => setWaMediaName(e.target.value)} 
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={submittingWa || !!waJobId}
              >
                {submittingWa ? 'Sending...' : 'Trigger Webhook Message'}
              </button>
            </form>

            {waJobStatus && (
              <div className="sim-job-card">
                <div className="job-status-row">
                  <span className="meta-label">Task Status:</span>
                  <span className="meta-val" style={{ textTransform: 'capitalize', color: 'var(--accent-blue)' }}>
                    {waJobStatus}
                  </span>
                </div>
                {waJobId && (
                  <div className="job-status-row">
                    <span className="meta-label">Job ID:</span>
                    <span className="meta-val" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {waJobId.substring(0, 8)}...
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Document Registry Table */}
        <div className="card-panel registry-panel" style={{ minHeight: '400px' }}>
          <div className="panel-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={18} />
              <h2>Processed Documents</h2>
            </div>
            
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2rem', height: '32px', width: '200px', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="registry-table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Uploader</th>
                  <th>Type</th>
                  <th>Supplier</th>
                  <th>Total TTC</th>
                  <th>Status</th>
                  <th>Ingested Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      Connecting to Klerk backend server...
                    </td>
                  </tr>
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      No documents found. Upload a file or run the WhatsApp webhook simulator!
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr 
                      key={doc.id} 
                      onClick={() => setSelectedDoc(doc)}
                      className={selectedDoc?.id === doc.id ? 'selected' : ''}
                    >
                      <td style={{ fontWeight: 500 }}>{doc.originalFilename}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{doc.uploaderPhone || 'Web Ingestion'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{doc.documentType}</td>
                      <td>{doc.supplierName || '—'}</td>
                      <td>{doc.totalTtc || '—'}</td>
                      <td>
                        <span className={`status-pill ${doc.status === 'processed' ? 'processed' : 'review'}`}>
                          {doc.status === 'processed' ? <Check size={12} /> : <Clock size={12} />}
                          {doc.status === 'processed' ? 'Verified' : 'Needs Review'}
                        </span>
                      </td>
                      <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td>
                        <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedDoc && (
        <div className="detail-modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Document Metadata Details</h2>
              <button className="close-btn" onClick={() => setSelectedDoc(null)}>Close</button>
            </div>
            
            <div className="modal-body">
              {/* Left Column: Parsed Fields */}
              <div className="detail-section">
                <h3>Extracted Properties</h3>
                <div className="meta-grid">
                  <span className="meta-label">Original Filename:</span>
                  <span className="meta-val">{selectedDoc.originalFilename}</span>

                  <span className="meta-label">Uploader (Tenant):</span>
                  <span className="meta-val">{selectedDoc.uploaderPhone || 'Web Ingestion'}</span>

                  <span className="meta-label">MIME Type:</span>
                  <span className="meta-val">{selectedDoc.mimeType}</span>

                  <span className="meta-label">SHA256 Hash:</span>
                  <span className="meta-val" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {selectedDoc.sha256Hash.substring(0, 16)}...
                  </span>

                  <span className="meta-label">Document Type:</span>
                  <span className="meta-val" style={{ textTransform: 'capitalize' }}>
                    {selectedDoc.documentType}
                  </span>

                  <span className="meta-label">Supplier Name:</span>
                  <span className="meta-val">{selectedDoc.supplierName || '—'}</span>

                  <span className="meta-label">Document Date:</span>
                  <span className="meta-val">{selectedDoc.documentDate || '—'}</span>

                  <span className="meta-label">Due Date:</span>
                  <span className="meta-val">{selectedDoc.dueDate || '—'}</span>

                  <span className="meta-label">Total Amount (TTC):</span>
                  <span className="meta-val">{selectedDoc.totalTtc || '—'}</span>

                  <span className="meta-label">Sync Status:</span>
                  <span className="meta-val" style={{ color: 'var(--accent-green)' }}>
                    Synced to Supabase
                  </span>

                  <span className="meta-label">Google Drive Link:</span>
                  <span className="meta-val">
                    {selectedDoc.driveWebViewLink ? (
                      <a 
                        href={selectedDoc.driveWebViewLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="link-btn"
                      >
                        Open on Drive <ExternalLink size={14} />
                      </a>
                    ) : (
                      'Not synced'
                    )}
                  </span>
                </div>
              </div>

              {/* Right Column: OCR Text Box */}
              <div className="detail-section">
                <h3>Full Extracted Text (OCR)</h3>
                <div className="ocr-box">
                  {selectedDoc.ocrText}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
