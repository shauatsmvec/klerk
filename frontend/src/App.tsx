import React, { useState } from 'react';
import { 
  Smartphone,
  Database,
  FolderOpen,
  Server,
  ShieldCheck
} from 'lucide-react';

type ModalType = 'privacy' | 'terms' | 'legal' | null;

export default function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleLegalClick = (e: React.MouseEvent, type: ModalType) => {
    e.preventDefault();
    setActiveModal(type);
  };

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
          </div>
        </div>
      </div>

      {/* 3. Page Tiles Stack */}
      <div className="page-container">

        {/* Tile 1: Hero Page (Light Canvas) */}
        <section id="overview" className="product-tile product-tile-light">
          <h1 className="tile-headline">AI Document Ingestion.</h1>
          <p className="tile-subcopy">Document logging at the speed of thought.</p>
          <p className="tile-tagline">Now featuring WhatsApp Multi-Tenancy & Folder Segregation</p>
          
          <div className="tile-ctas">
            <a href="#whatsapp" className="button-primary">Explore WhatsApp Console</a>
            <a href="https://github.com/shauatsmvec/klerk" target="_blank" rel="noreferrer" className="button-secondary-pill">View Repository</a>
          </div>

          <div className="product-image-container">
            <div className="product-image-shadow" style={{ width: '100%', maxWidth: '840px', backgroundColor: '#fafafc', padding: '24px' }}>
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

        {/* Tile 2: WhatsApp Integration Hero (Dark Canvas) - Side-by-side layout */}
        <section id="whatsapp" className="product-tile product-tile-dark">
          <div className="whatsapp-row-tile">
            
            {/* Left Column: Mobile phone message mockup */}
            <div className="product-image-container">
              <div className="product-image-dark-shadow" style={{ width: '100%', maxWidth: '440px', backgroundColor: '#1d1d1f', borderRadius: '32px', border: '8px solid #333', padding: '24px', textAlign: 'left', fontFamily: 'system-ui' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #333', marginBottom: '16px' }}>
                  <Smartphone style={{ color: 'var(--colors-primary-on-dark)' }} />
                  <div>
                    <h4 style={{ margin: 0, color: '#fff' }}>Klerk Assistant</h4>
                    <span style={{ fontSize: '12px', color: '#7a7a7a' }}>+91 89408 08931</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ alignSelf: 'flex-start', backgroundColor: '#2a2a2c', borderRadius: '12px', padding: '10px 14px', maxWidth: '80%', fontSize: '13px', color: '#fff', lineHeight: 1.4 }}>
                    👋 Welcome to *Klerk Accounting!*
                    <br/><br/>
                    You are not registered yet. To begin logging invoices, you must register your account.
                    <br/><br/>
                    👉 Reply *Register* to start registration.
                  </div>
                  <div style={{ alignSelf: 'flex-end', backgroundColor: 'var(--colors-primary)', borderRadius: '12px', padding: '10px 14px', maxWidth: '80%', fontSize: '13px', color: '#fff' }}>
                    Register
                  </div>
                  <div style={{ alignSelf: 'flex-start', backgroundColor: '#2a2a2c', borderRadius: '12px', padding: '10px 14px', maxWidth: '80%', fontSize: '13px', color: '#fff', lineHeight: 1.4 }}>
                    📝 *Klerk Registration*
                    <br/><br/>
                    Please reply with your Gmail address to connect your invoices to your account.
                  </div>
                  <div style={{ alignSelf: 'flex-end', backgroundColor: 'var(--colors-primary)', borderRadius: '12px', padding: '10px 14px', maxWidth: '80%', fontSize: '13px', color: '#fff' }}>
                    martin@gmail.com
                  </div>
                  <div style={{ alignSelf: 'flex-start', backgroundColor: '#2a2a2c', borderRadius: '12px', padding: '10px 14px', maxWidth: '80%', fontSize: '13px', color: '#fff', lineHeight: 1.4 }}>
                    ✅ *Registration Complete!*
                    <br/><br/>
                    Your WhatsApp number is now connected to *martin@gmail.com*. You can now start uploading your invoices!
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Copy text details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h1 className="tile-headline" style={{ fontSize: '48px', margin: 0 }}>The WhatsApp Accounting Console.</h1>
              <p className="tile-subcopy" style={{ fontSize: '24px', margin: 0 }}>Send, confirm, and log. No custom app installation required.</p>
              <p className="tile-tagline" style={{ color: 'var(--colors-primary-on-dark)', margin: 0 }}>Dynamic Gmail Registration & Segregation</p>
            </div>

          </div>
        </section>

        {/* Tile 3: Key Features (Light Parchment Canvas) - Beautiful 2x2 grid */}
        <section id="features" className="product-tile product-tile-parchment">
          <div className="utility-grid-section" style={{ padding: 0 }}>
            <h2 className="utility-grid-title">Built to perform quietly.</h2>
            <p className="utility-grid-sub">Robust integrations configured as design tenets.</p>
            
            <div className="utility-grid-2x2">
              
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

      </div>

      {/* 4. Document/Legal Modals */}
      {activeModal && (
        <div className="detail-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <h2>
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'terms' && 'Terms of Use'}
                {activeModal === 'legal' && 'Legal Notice'}
              </h2>
              <button className="close-btn" onClick={() => setActiveModal(null)}>Close</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-text-content">
                {activeModal === 'privacy' && (
                  <div>
                    <p><strong>Effective Date: July 10, 2026</strong></p>
                    <p>At Klerk, we are committed to protecting the privacy and security of your financial document data. This Privacy Policy describes how we collect, use, and store information when you use the Klerk document parsing platform and WhatsApp integration.</p>
                    
                    <h3>1. Information We Collect</h3>
                    <ul>
                      <li><strong>WhatsApp Senders</strong>: We collect the sender's phone number and the phone number ID to manage account validation and routing.</li>
                      <li><strong>Gmail Profiles</strong>: Senders explicitly link their phone number to a Gmail address, which is saved in our database to categorize documents.</li>
                      <li><strong>Document Files & Text</strong>: We temporarily process incoming PDFs and images to extract metadata (supplier name, invoice date, amount due, and total TTC). Full parsed text is indexed securely in Supabase.</li>
                    </ul>

                    <h3>2. Google Integration & Data Segregation</h3>
                    <p>To guarantee complete data isolation, Klerk creates dedicated directory structures on Google Drive mapped specifically to each user's registered Gmail address. Transaction ledgers logged in Google Sheets are linked to the respective user email identifier.</p>

                    <h3>3. Data Retention</h3>
                    <p>Extracted metadata is permanently stored in your Supabase database. Temporary files uploaded to our servers during processing are deleted immediately after Google Drive sync or user cancellation.</p>
                  </div>
                )}

                {activeModal === 'terms' && (
                  <div>
                    <p><strong>Effective Date: July 10, 2026</strong></p>
                    <p>By registering your WhatsApp phone number and accessing the Klerk platform, you agree to these Terms of Use. Please read them carefully.</p>
                    
                    <h3>1. Description of Service</h3>
                    <p>Klerk is an AI-driven invoice and receipt processing helper. It parses metadata from files sent via WhatsApp, uploads structured data to your Google Sheets ledger, and stores files on Google Drive.</p>

                    <h3>2. Accuracy & Confirmation Gate</h3>
                    <p>While Klerk leverages state-of-the-art OCR and Mistral AI models to parse data, extraction is not infallible. Senders are presented with a detailed confirmation preview on WhatsApp. You are solely responsible for verifying the accuracy of the totals and dates before replying "Yes" to log the record.</p>

                    <h3>3. User Responsibilities</h3>
                    <p>You agree to only submit documents that you have the right to process. You must not upload any malicious files, executable scripts, or content that violates confidentiality guidelines.</p>
                  </div>
                )}

                {activeModal === 'legal' && (
                  <div>
                    <h3>1. Website Host & Publisher</h3>
                    <p>Klerk is an open-source MVP application developed for invoice logging automation.</p>
                    <p>
                      <strong>Publisher</strong>: Klerk Inc.
                      <br/>
                      <strong>Hosting Infrastructure</strong>: Render Cloud Hosting & Supabase PostgreSQL Database.
                    </p>

                    <h3>2. Intellectual Property</h3>
                    <p>The code layout, repository, and design tokens of the Klerk landing page are open-source and subject to the repository license agreements.</p>

                    <h3>3. Contact Information</h3>
                    <p>For any system issues, questions regarding OCR parsing quality, or data removal requests, please open an issue in the Klerk GitHub repository.</p>
                  </div>
                )}
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
            </div>
          </div>
          <div className="footer-column">
            <h3>API Documentation</h3>
            <div className="footer-links">
              <a href="https://github.com/shauatsmvec/klerk" target="_blank" rel="noreferrer" className="footer-link">Ingestion Webhooks</a>
              <a href="https://github.com/shauatsmvec/klerk" target="_blank" rel="noreferrer" className="footer-link">Upload Services</a>
              <a href="https://github.com/shauatsmvec/klerk" target="_blank" rel="noreferrer" className="footer-link">pg-boss Queues</a>
            </div>
          </div>
          <div className="footer-column">
            <h3>GCP Setup</h3>
            <div className="footer-links">
              <a href="https://github.com/shauatsmvec/klerk" target="_blank" rel="noreferrer" className="footer-link">Google Drive API</a>
              <a href="https://github.com/shauatsmvec/klerk" target="_blank" rel="noreferrer" className="footer-link">Google Sheets Sync</a>
              <a href="https://github.com/shauatsmvec/klerk" target="_blank" rel="noreferrer" className="footer-link">OAuth Scopes</a>
            </div>
          </div>
          <div className="footer-column">
            <h3>Supabase</h3>
            <div className="footer-links">
              <a href="https://github.com/shauatsmvec/klerk" target="_blank" rel="noreferrer" className="footer-link">PostgreSQL Database</a>
              <a href="https://github.com/shauatsmvec/klerk" target="_blank" rel="noreferrer" className="footer-link">Row Level Security</a>
              <a href="https://github.com/shauatsmvec/klerk" target="_blank" rel="noreferrer" className="footer-link">Schema Migrations</a>
            </div>
          </div>
        </div>
        
        <div className="footer-legal">
          <p style={{ margin: 0 }}>Copyright © 2026 Klerk Inc. All rights reserved. Deployed via Render and Supabase.</p>
          <div className="footer-legal-links">
            <span onClick={(e) => handleLegalClick(e, 'privacy')} className="footer-legal-link">Privacy Policy</span>
            <span onClick={(e) => handleLegalClick(e, 'terms')} className="footer-legal-link">Terms of Use</span>
            <span onClick={(e) => handleLegalClick(e, 'legal')} className="footer-legal-link">Legal Notice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
