import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  AlertCircle, 
  Database, 
  Clock,
  ExternalLink,
  RefreshCw,
  Search,
  Check,
  Smartphone,
  Server,
  ShieldCheck,
  FolderOpen
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
  const [waFrom, setWaFrom] = useState('+918940808931');
  const [waMediaUrl, setWaMediaUrl] = useState('https://raw.githubusercontent.com/pdf-association/pdf-test-suite/master/pdf-test-suite.pdf');
  const [waMediaName, setWaMediaName] = useState('whatsapp_invoice.pdf');
  const [waJobId, setWaJobId] = useState<string | null>(null);
  const [waJobStatus, setWaJobStatus] = useState<string | null>(null);
  const [submittingWa, setSubmittingWa] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sandboxRef = useRef<HTMLDivElement>(null);

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
      fetchDocuments(); // Refresh list
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
      setWaJobId(result.jobId || 'simulated-job');
      setWaJobStatus(result.status || 'accepted');
    } catch (err) {
      console.error(err);
      setWaJobStatus('failed to trigger');
    } finally {
      setSubmittingWa(false);
    }
  };

  const scrollToSandbox = () => {
    sandboxRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtered documents search list
  const filteredDocs = documents.filter(doc => {
    const searchString = `${doc.originalFilename} ${doc.supplierName || ''} ${doc.documentType} ${doc.uploaderPhone || ''}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      {/* 1. Global Navigation */}
      <nav className="global-nav">
        <div className="global-nav-container">
          <a href="#" className="global-nav-logo">
            <span></span> Klerk
          </a>
          <div className="global-nav-links">
            <a href="#overview" className="global-nav-link">Overview</a>
            <a href="#whatsapp" className="global-nav-link">WhatsApp</a>
            <a href="#features" className="global-nav-link">Features</a>
            <a href="#sandbox" className="global-nav-link" onClick={scrollToSandbox}>Sandbox</a>
          </div>
          <div style={{ width: '20px' }}></div> {/* Spacer */}
        </div>
      </nav>

      {/* 2. Frosted Sub Navigation */}
      <div className="sub-nav-frosted">
        <div className="sub-nav-container">
          <a href="#" className="sub-nav-title">Klerk AI</a>
          <div className="sub-nav-actions">
            <span className="sub-nav-link" style={{ cursor: 'default', color: '#008a00', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#008a00', borderRadius: '50%' }}></span> Live
            </span>
            <button onClick={scrollToSandbox} className="button-primary" style={{ fontSize: '13px', padding: '6px 14px' }}>
              Try Sandbox
            </button>
          </div>
        </div>
      </div>

      {/* 3. Page Tiles Stack */}
      <div className="page-container">
        
        {/* Connection status warning */}
        {errorMsg && (
          <div className="utility-grid-section" style={{ padding: '24px' }}>
            <div style={{ backgroundColor: '#fff', border: '1px solid var(--colors-error)', borderRadius: '12px', padding: '20px', color: 'var(--colors-error)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <AlertCircle size={24} />
              <div>
                <h4 style={{ margin: 0, fontWeight: 600 }}>Connection Status Offline</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--colors-ink-muted-80)' }}>{errorMsg}. The simulated API endpoints will only function when the backend server is running.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tile 1: Hero Page (Light Canvas) */}
        <section id="overview" className="product-tile product-tile-light">
          <h1 className="tile-headline">AI Document Processing.</h1>
          <p className="tile-subcopy">Document logging at the speed of thought.</p>
          <p className="tile-tagline">Now featuring WhatsApp Multi-Tenancy & Folder Segregation</p>
          
          <div className="tile-ctas">
            <button onClick={scrollToSandbox} className="button-primary">Try Klerk Sandbox</button>
            <a href="https://github.com/shauatsmvec/klerk" target="_blank" rel="noreferrer" className="button-secondary-pill">View Repository</a>
          </div>

          <div className="product-image-container">
            <div className="product-image-shadow" style={{ width: '100%', maxWidth: '840px', backgroundColor: '#fafafc', padding: '24px' }}>
              {/* Fake visual hero showing a clean, gorgeous minimal document details card */}
              <div style={{ textAlign: 'left', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#7a7a7a', fontWeight: 600 }}>Extracted Invoice</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 600 }}>facture_locabenne_2026.pdf</h3>
                </div>
                <span className="status-pill processed">Processed & Shared</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', textAlign: 'left' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#7a7a7a' }}>Supplier</span>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>Locabenne SA</p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#7a7a7a' }}>Date</span>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>10/07/2026</p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#7a7a7a' }}>Total Amount</span>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: 'var(--colors-primary)' }}>1,240.00 €</p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#7a7a7a' }}>Uploader</span>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>martin_finance@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tile 2: WhatsApp Integration Hero (Dark Canvas) */}
        <section id="whatsapp" className="product-tile product-tile-dark">
          <h1 className="tile-headline">The WhatsApp Accounting Console.</h1>
          <p className="tile-subcopy">Send, confirm, and log. No custom app installation required.</p>
          <p className="tile-tagline" style={{ color: 'var(--colors-primary-on-dark)' }}>Dynamic Gmail Registration & Segregation</p>

          <div className="product-image-container" style={{ maxWidth: '640px' }}>
            {/* Phone Message UI Simulator Display Mock */}
            <div className="product-image-dark-shadow" style={{ width: '100%', backgroundColor: '#1d1d1f', borderRadius: '32px', border: '8px solid #333', padding: '24px', textAlign: 'left', fontFamily: 'system-ui' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #333', marginBottom: '16px' }}>
                <Smartphone style={{ color: 'var(--colors-primary-on-dark)' }} />
                <div>
                  <h4 style={{ margin: 0, color: '#fff' }}>Klerk Assistant</h4>
                  <span style={{ fontSize: '12px', color: '#7a7a7a' }}>+91 89408 08931</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ alignSelf: 'flex-start', backgroundColor: '#2a2a2c', borderRadius: '12px', padding: '10px 14px', maxWidth: '80%', fontSize: '14px', color: '#fff' }}>
                  👋 Welcome to *Klerk Accounting!*
                  <br/><br/>
                  You are not registered yet. To begin logging invoices, you must register your account.
                  <br/><br/>
                  👉 Reply *Register* to start registration.
                </div>
                <div style={{ alignSelf: 'flex-end', backgroundColor: 'var(--colors-primary)', borderRadius: '12px', padding: '10px 14px', maxWidth: '80%', fontSize: '14px', color: '#fff' }}>
                  Register
                </div>
                <div style={{ alignSelf: 'flex-start', backgroundColor: '#2a2a2c', borderRadius: '12px', padding: '10px 14px', maxWidth: '80%', fontSize: '14px', color: '#fff' }}>
                  📝 *Klerk Registration*
                  <br/><br/>
                  Please reply with your Gmail address to connect your invoices to your account.
                </div>
                <div style={{ alignSelf: 'flex-end', backgroundColor: 'var(--colors-primary)', borderRadius: '12px', padding: '10px 14px', maxWidth: '80%', fontSize: '14px', color: '#fff' }}>
                  martin@gmail.com
                </div>
                <div style={{ alignSelf: 'flex-start', backgroundColor: '#2a2a2c', borderRadius: '12px', padding: '10px 14px', maxWidth: '80%', fontSize: '14px', color: '#fff' }}>
                  ✅ *Registration Complete!*
                  <br/><br/>
                  Your WhatsApp number is now connected to *martin@gmail.com*. You can now start uploading your invoices!
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tile 3: Key Features (Light Parchment Canvas) */}
        <section id="features" className="product-tile product-tile-parchment">
          <h2 className="tile-headline" style={{ fontSize: '40px' }}>Built to perform quietly.</h2>
          <p className="tile-subcopy" style={{ fontSize: '24px', marginBottom: '48px' }}>Robust integrations configured as design tenets.</p>

          <div className="utility-grid-section" style={{ padding: 0 }}>
            <div className="utility-grid">
              
              <div className="store-utility-card">
                <div className="card-icon">
                  <Database size={20} />
                </div>
                <h3 className="card-title">User Registration</h3>
                <p className="card-description">Stateful PostgreSQL-backed registration sessions. Authenticates and whitelist-checks senders prior to ingestion.</p>
              </div>

              <div className="store-utility-card">
                <div className="card-icon">
                  <FolderOpen size={20} />
                </div>
                <h3 className="card-title">Gmail Segregation</h3>
                <p className="card-description">Dynamically resolves and builds folder paths on Google Drive matching the registered Gmail address ID.</p>
              </div>

              <div className="store-utility-card">
                <div className="card-icon">
                  <Server size={20} />
                </div>
                <h3 className="card-title">Multi-Tenant Ledgers</h3>
                <p className="card-description">Logs invoice details and Google Drive share links in a global Sheets ledger, tagged with the uploader's email.</p>
              </div>

              <div className="store-utility-card">
                <div className="card-icon">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="card-title">Double-Confirmation Gate</h3>
                <p className="card-description">OCR checks run instantly, prompting WhatsApp senders with extracted details for a secure Yes/No verification reply.</p>
              </div>

            </div>
          </div>
        </section>

        {/* Tile 4: Interactive Sandbox Dashboard Panel (Light Canvas) */}
        <section id="sandbox" ref={sandboxRef} className="product-tile product-tile-light" style={{ borderTop: '1px solid var(--colors-hairline)' }}>
          <h2 className="tile-headline" style={{ fontSize: '40px' }}>Try the Klerk Sandbox.</h2>
          <p className="tile-subcopy" style={{ fontSize: '24px' }}>Test registration, document uploads, and webhooks in real-time.</p>

          <div className="configurator-panel">
            
            {/* Sidebar Column: Actions & Configuration */}
            <div className="configurator-sidebar">
              
              {/* File Upload section */}
              <div>
                <h4 className="config-section-title">Ingest Document</h4>
                <div 
                  className={`dropzone ${uploading ? 'active' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ minHeight: '130px' }}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                  <Upload className="dropzone-icon" size={24} style={{ marginBottom: '8px' }} />
                  {uploading ? (
                    <p style={{ fontSize: '13px' }}><RefreshCw className="spin" size={12} /> Processing...</p>
                  ) : (
                    <p style={{ fontSize: '13px' }}>Drop PDF / Image or <span className="highlight">Browse</span></p>
                  )}
                </div>
              </div>

              {/* Webhook Simulator section */}
              <div>
                <h4 className="config-section-title">WhatsApp Simulator</h4>
                <form onSubmit={handleWaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label>From (Sender Phone)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={waFrom} 
                      onChange={(e) => setWaFrom(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Media Link URL</label>
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
                    className="button-primary" 
                    style={{ fontSize: '13px', width: '100%', padding: '10px 14px' }}
                    disabled={submittingWa || !!waJobId}
                  >
                    {submittingWa ? 'Sending Webhook...' : 'Simulate WhatsApp Upload'}
                  </button>
                </form>

                {waJobStatus && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--colors-canvas)', borderRadius: '8px', border: '1px solid var(--colors-hairline)', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--colors-ink-muted-80)' }}>Status:</span>
                      <span style={{ fontWeight: 600, color: 'var(--colors-primary)', textTransform: 'capitalize' }}>{waJobStatus}</span>
                    </div>
                    {waJobId && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--colors-ink-muted-80)' }}>Job ID:</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{waJobId.substring(0, 8)}...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Main Content Column: Processed Invoices Registry */}
            <div className="configurator-content">
              
              <div className="table-header-row">
                <h3 className="table-title">Processed Document Registry</h3>
                <div className="search-input-container">
                  <Search size={14} />
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search registry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--colors-ink-muted-80)' }}>
                          <RefreshCw className="spin" size={16} /> Connecting to database registry...
                        </td>
                      </tr>
                    ) : filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--colors-ink-muted-80)' }}>
                          No documents logged. Upload a file or run the WhatsApp simulator.
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
                          <td style={{ fontSize: '13px', color: 'var(--colors-ink-muted-80)' }}>{doc.uploaderPhone || 'Web Ingestion'}</td>
                          <td style={{ textTransform: 'capitalize' }}>{doc.documentType}</td>
                          <td>{doc.supplierName || '—'}</td>
                          <td>{doc.totalTtc || '—'}</td>
                          <td>
                            <span className={`status-pill ${doc.status === 'processed' ? 'processed' : 'review'}`}>
                              {doc.status === 'processed' ? <Check size={10} /> : <Clock size={10} />}
                              {doc.status === 'processed' ? 'Verified' : 'Needs Review'}
                            </span>
                          </td>
                          <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        </section>

      </div>

      {/* 4. Details Modal */}
      {selectedDoc && (
        <div className="detail-modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <h2>Document Metadata Details</h2>
              <button className="close-btn" onClick={() => setSelectedDoc(null)}>Close</button>
            </div>
            
            <div className="modal-body">
              {/* Left Column: Properties */}
              <div className="detail-section">
                <h3>Extracted Fields</h3>
                <div className="meta-grid">
                  <span className="meta-label">Filename:</span>
                  <span className="meta-val">{selectedDoc.originalFilename}</span>

                  <span className="meta-label">Uploader:</span>
                  <span className="meta-val">{selectedDoc.uploaderPhone || 'Web Ingestion'}</span>

                  <span className="meta-label">Type:</span>
                  <span className="meta-val" style={{ textTransform: 'capitalize' }}>{selectedDoc.documentType}</span>

                  <span className="meta-label">Supplier Name:</span>
                  <span className="meta-val">{selectedDoc.supplierName || '—'}</span>

                  <span className="meta-label">Document Date:</span>
                  <span className="meta-val">{selectedDoc.documentDate || '—'}</span>

                  <span className="meta-label">Due Date:</span>
                  <span className="meta-val">{selectedDoc.dueDate || '—'}</span>

                  <span className="meta-label">Total Amount:</span>
                  <span className="meta-val">{selectedDoc.totalTtc || '—'}</span>

                  <span className="meta-label">Google Drive Link:</span>
                  <span className="meta-val">
                    {selectedDoc.driveWebViewLink ? (
                      <a 
                        href={selectedDoc.driveWebViewLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="link-btn"
                      >
                        Open on Drive <ExternalLink size={12} />
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

      {/* 5. Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <h3>Explore Klerk</h3>
            <div className="footer-links">
              <a href="#overview" className="footer-link">Overview</a>
              <a href="#whatsapp" className="footer-link">WhatsApp Flow</a>
              <a href="#features" className="footer-link">Key Integrations</a>
              <a href="#sandbox" className="footer-link">Try Sandbox</a>
            </div>
          </div>
          <div className="footer-column">
            <h3>API Documentation</h3>
            <div className="footer-links">
              <a href="#" className="footer-link">Ingestion Webhooks</a>
              <a href="#" className="footer-link">Upload Services</a>
              <a href="#" className="footer-link">pg-boss Queues</a>
            </div>
          </div>
          <div className="footer-column">
            <h3>GCP Setup</h3>
            <div className="footer-links">
              <a href="#" className="footer-link">Google Drive API</a>
              <a href="#" className="footer-link">Google Sheets Sync</a>
              <a href="#" className="footer-link">OAuth Scopes</a>
            </div>
          </div>
          <div className="footer-column">
            <h3>Supabase</h3>
            <div className="footer-links">
              <a href="#" className="footer-link">PostgreSQL Database</a>
              <a href="#" className="footer-link">Row Level Security</a>
              <a href="#" className="footer-link">Schema Migrations</a>
            </div>
          </div>
        </div>
        
        <div className="footer-legal">
          <p style={{ margin: 0 }}>Copyright © 2026 Klerk Inc. All rights reserved. Deployed via Render and Supabase.</p>
          <div className="footer-legal-links">
            <a href="#" className="footer-legal-link">Privacy Policy</a>
            <a href="#" className="footer-legal-link">Terms of Use</a>
            <a href="#" className="footer-legal-link">Legal Notice</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
