import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone,
  Database,
  FolderOpen,
  Server,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  UserCheck,
  FileText,
  CheckSquare,
  Share2
} from 'lucide-react';
import { useScroll, useTransform, motion } from 'framer-motion';
import RadialOrbitalTimeline from "./components/ui/radial-orbital-timeline";

const whatsappWorkflowData = [
  {
    id: 1,
    title: "1. Message Received",
    date: "Step 1",
    content: "System validates the incoming phone number. If unregistered, prompts to Register via WhatsApp chat state machine.",
    category: "Security",
    icon: MessageSquare,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "2. Account Connected",
    date: "Step 2",
    content: "User submits their Gmail. The database links the WhatsApp number to their email and initializes dedicated folder storage.",
    category: "Identity",
    icon: UserCheck,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 3,
    title: "3. Document Upload",
    date: "Step 3",
    content: "User uploads an invoice PDF or image. Klerk starts instant text OCR extraction and parses supplier details and total amounts.",
    category: "Ingestion",
    icon: FileText,
    relatedIds: [2, 4],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 4,
    title: "4. User Confirmation",
    date: "Step 4",
    content: "Bot sends back a parsed details preview card on WhatsApp. Senders reply 'Yes' to log it, or 'No' to discard the transaction.",
    category: "Verification",
    icon: CheckSquare,
    relatedIds: [3, 5],
    status: "completed" as const,
    energy: 85,
  },
  {
    id: 5,
    title: "5. Workspace Sync",
    date: "Step 5",
    content: "File is uploaded to the segregated Gmail folder on Google Drive. A transaction row is appended to Google Sheets and saved to Supabase.",
    category: "Sync",
    icon: Share2,
    relatedIds: [4],
    status: "completed" as const,
    energy: 100,
  },
];

type ModalType = 
  | 'privacy' 
  | 'terms' 
  | 'legal' 
  | 'ingestion_webhooks' 
  | 'upload_services' 
  | 'pg_boss_queues' 
  | 'google_drive_api' 
  | 'google_sheets_sync' 
  | 'oauth_scopes' 
  | 'postgresql_database' 
  | 'row_level_security' 
  | 'schema_migrations' 
  | null;

// Container Scroll Animation Component
export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.8, 0.95] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 0.25], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.25], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 0.25], [0, -40]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: isMobile ? "20px 10px" : "60px 20px",
        width: "100%",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          width: "100%",
          position: "relative",
          perspective: "1000px",
        }}
      >
        <motion.div
          style={{
            translateY: translate,
          }}
        >
          {titleComponent}
        </motion.div>
        
        <motion.div
          style={{
            rotateX: rotate,
            scale,
            boxShadow:
              "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
            maxWidth: "840px",
            marginTop: "16px",
            marginLeft: "auto",
            marginRight: "auto",
            width: "100%",
            border: "4px solid #6C6C6C",
            padding: isMobile ? "8px" : "24px",
            backgroundColor: "#222222",
            borderRadius: "30px",
          }}
        >
          <div 
            style={{
              height: "100%",
              width: "100%",
              overflow: "hidden",
              borderRadius: "16px",
              backgroundColor: "var(--colors-canvas)",
              padding: isMobile ? "12px" : "24px"
            }}
          >
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleDocClick = (e: React.MouseEvent, type: ModalType) => {
    e.preventDefault();
    setActiveModal(type);
  };

  return (
    <div>
      {/* Active Development Banner */}
      <div style={{ backgroundColor: 'var(--colors-primary)', color: '#ffffff', fontSize: '12px', fontWeight: 600, padding: '10px 24px', textAlign: 'center', letterSpacing: '0.03em', width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 1001 }}>
        🚀 DEVELOPMENT PORTFOLIO SHOWCASE: This is an active sample application showcasing document parsing architecture.
      </div>

      {/* 1. Global Navigation */}
      <nav className="global-nav" style={{ top: '34px' }}>
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
      <div className="sub-nav-frosted" style={{ top: '78px' }}>
        <div className="sub-nav-container">
          <a href="#" className="sub-nav-title">Klerk AI</a>
          <div className="sub-nav-actions">
            <span className="sub-nav-link" style={{ cursor: 'default', color: '#008a00', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#008a00', borderRadius: '50%' }}></span> Showcase Live
            </span>
          </div>
        </div>
      </div>

      {/* 3. Page Tiles Stack */}
      <div className="page-container" style={{ marginTop: '130px' }}>

        {/* Tile 1: Hero Page (Light Canvas) featuring the 3D Scroll Container Animation */}
        <section id="overview" className="product-tile product-tile-light" style={{ padding: '48px 24px' }}>
          
          <ContainerScroll
            titleComponent={
              <div style={{ textAlign: 'center' }}>
                <h1 className="tile-headline" style={{ margin: '0 auto 8px auto' }}>
                  AI Document Ingestion.
                </h1>
                <p className="tile-subcopy" style={{ marginBottom: '24px' }}>
                  Document logging at the speed of thought.
                </p>
                <p className="tile-tagline" style={{ marginBottom: '32px' }}>
                  Now featuring WhatsApp Multi-Tenancy & Folder Segregation
                </p>
                <div className="tile-ctas" style={{ marginBottom: '16px' }}>
                  <a href="#whatsapp" className="button-primary">Explore WhatsApp Console</a>
                  <a href="https://github.com/shauatsmvec/klerk" target="_blank" rel="noreferrer" className="button-secondary-pill">View Repository</a>
                </div>
              </div>
            }
          >
            {/* The child card element tilts back dynamically in 3D space on scroll */}
            <div style={{ textAlign: 'left', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#7a7a7a', fontWeight: 600 }}>Extracted Invoice</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 600, color: 'var(--colors-ink)' }}>facture_locabenne_2026.pdf</h3>
              </div>
              <span className="status-pill processed">Processed & Shared</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px', textAlign: 'left' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#7a7a7a' }}>Supplier</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: 'var(--colors-ink)' }}>Locabenne SA</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#7a7a7a' }}>Date</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: 'var(--colors-ink)' }}>10/07/2026</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#7a7a7a' }}>Total Amount</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: 'var(--colors-primary)' }}>1,240.00 €</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#7a7a7a' }}>Uploader</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: 'var(--colors-ink)' }}>martin_finance@gmail.com</p>
              </div>
            </div>
          </ContainerScroll>
          
        </section>

        {/* Tile 2: WhatsApp Integration Hero (Dark Canvas) - Side-by-side layout */}
        <section id="whatsapp" className="product-tile product-tile-dark" style={{ padding: '80px 24px 64px 24px' }}>
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

          {/* Timeline Animation for the WhatsApp Ingestion Workflow */}
          <div style={{ width: '100%', maxWidth: '980px', marginTop: '64px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '48px' }}>
            <h3 style={{ fontSize: '21px', fontWeight: 600, color: '#fff', marginBottom: '24px', letterSpacing: '-0.01em', textAlign: 'center' }}>
              Interactive WhatsApp Ingestion Workflow
            </h3>
            <RadialOrbitalTimeline timelineData={whatsappWorkflowData} />
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
                {activeModal === 'ingestion_webhooks' && 'API: Ingestion Webhooks'}
                {activeModal === 'upload_services' && 'API: Document Upload Services'}
                {activeModal === 'pg_boss_queues' && 'Architecture: pg-boss Tasks'}
                {activeModal === 'google_drive_api' && 'GCP: Google Drive Storage'}
                {activeModal === 'google_sheets_sync' && 'GCP: Google Sheets Ledger'}
                {activeModal === 'oauth_scopes' && 'GCP: OAuth 2.0 Credentials'}
                {activeModal === 'postgresql_database' && 'Supabase: SQL Database'}
                {activeModal === 'row_level_security' && 'Supabase: Row Level Security'}
                {activeModal === 'schema_migrations' && 'Supabase: SQL Schema Migrations'}
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

                {activeModal === 'ingestion_webhooks' && (
                  <div>
                    <p>Klerk listens for incoming messages from Meta's servers on the endpoint <code>POST /api/webhooks/whatsapp</code>.</p>
                    <h3>Webhook Lifecycle</h3>
                    <ul>
                      <li><strong>GET Verification Handshake</strong>: Responds to Meta verification challenges using the configured <code>WHATSAPP_VERIFY_TOKEN</code>.</li>
                      <li><strong>User Registry Check</strong>: Verifies if the incoming phone number exists in our database. Unregistered users are prompted to Register first.</li>
                      <li><strong>Pending State Hold</strong>: Holds new documents in a temporary <code>pending_documents</code> table to support user verification loops before final commit.</li>
                    </ul>
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--colors-hairline)', display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks" target="_blank" rel="noreferrer" className="link-btn">Official Documentation <ExternalLink size={12} /></a>
                      <a href="https://github.com/shauatsmvec/klerk/blob/main/project/src/api/server.ts" target="_blank" rel="noreferrer" className="link-btn">GitHub Source <ExternalLink size={12} /></a>
                    </div>
                  </div>
                )}

                {activeModal === 'upload_services' && (
                  <div>
                    <p>The direct upload service endpoint is <code>POST /api/documents/upload</code>.</p>
                    <h3>Service Mechanics</h3>
                    <ul>
                      <li><strong>MIME Check</strong>: Rejects files that do not match <code>application/pdf</code> or standard image file formats.</li>
                      <li><strong>SHA-256 Deduplication</strong>: Rejects files if their unique SHA-256 hash already matches an entry in the database.</li>
                      <li><strong>Extraction Flow</strong>: Runs asynchronous text OCR, LLM text classification, and outputs structured extraction metadata mapping.</li>
                    </ul>
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--colors-hairline)', display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <a href="https://expressjs.com/en/resources/middleware/multer.html" target="_blank" rel="noreferrer" className="link-btn">Official Documentation <ExternalLink size={12} /></a>
                      <a href="https://github.com/shauatsmvec/klerk/blob/main/project/src/services/DocumentService.ts" target="_blank" rel="noreferrer" className="link-btn">GitHub Source <ExternalLink size={12} /></a>
                    </div>
                  </div>
                )}

                {activeModal === 'pg_boss_queues' && (
                  <div>
                    <p>Klerk separates request handling and processing queues using <code>pg-boss</code>.</p>
                    <h3>Asynchronous Queue Flow</h3>
                    <ul>
                      <li><strong>Job Dispatch</strong>: WhatsApp webhook downloads file media and enqueues it to the <code>document-processing</code> queue table.</li>
                      <li><strong>Background Worker</strong>: An independent worker thread polls, locks, and processes the job in the background, avoiding timeout errors.</li>
                    </ul>
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--colors-hairline)', display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <a href="https://github.com/timgit/pg-boss" target="_blank" rel="noreferrer" className="link-btn">Official Documentation <ExternalLink size={12} /></a>
                      <a href="https://github.com/shauatsmvec/klerk/blob/main/project/src/queue/QueueService.ts" target="_blank" rel="noreferrer" className="link-btn">GitHub Source <ExternalLink size={12} /></a>
                    </div>
                  </div>
                )}

                {activeModal === 'google_drive_api' && (
                  <div>
                    <p>Klerk isolates tenant directories dynamically using the Google Drive API.</p>
                    <h3>Directory Structure</h3>
                    <ul>
                      <li><strong>Segregated Paths</strong>: Saves documents to <code>Compta/[email]/[Year]/[Month]/[DocType]</code>.</li>
                      <li><strong>Self-Healing Fallback</strong>: If directory creation fails, documents default to the root <code>klerk_service</code> folder, prefixed with the user's Gmail to maintain layout isolation.</li>
                    </ul>
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--colors-hairline)', display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <a href="https://developers.google.com/drive/api/guides/folder" target="_blank" rel="noreferrer" className="link-btn">Official Documentation <ExternalLink size={12} /></a>
                      <a href="https://github.com/shauatsmvec/klerk/blob/main/project/src/services/GoogleDriveService.ts" target="_blank" rel="noreferrer" className="link-btn">GitHub Source <ExternalLink size={12} /></a>
                    </div>
                  </div>
                )}

                {activeModal === 'google_sheets_sync' && (
                  <div>
                    <p>Every processed transaction appends a log entry to a global Sheets table.</p>
                    <h3>Ledger Columns</h3>
                    <p>Records: <code>Date</code>, <code>Supplier</code>, <code>Document Type</code>, <code>Amount TTC</code>, <code>Drive View Link</code>, <code>Status</code>, and the registered <code>Uploader</code> email address.</p>
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--colors-hairline)', display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <a href="https://developers.google.com/sheets/api/guides/values" target="_blank" rel="noreferrer" className="link-btn">Official Documentation <ExternalLink size={12} /></a>
                      <a href="https://github.com/shauatsmvec/klerk/blob/main/project/src/services/GoogleSheetsService.ts" target="_blank" rel="noreferrer" className="link-btn">GitHub Source <ExternalLink size={12} /></a>
                    </div>
                  </div>
                )}

                {activeModal === 'oauth_scopes' && (
                  <div>
                    <p>Google workspace integration relies on OAuth 2.0 Web Client scopes:</p>
                    <ul>
                      <li><code>https://www.googleapis.com/auth/drive.file</code> - Allows folder creation and file uploads inside Klerk folders.</li>
                      <li><code>https://www.googleapis.com/auth/spreadsheets</code> - Allows appending rows and updating cells in your log spreadsheet.</li>
                    </ul>
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--colors-hairline)', display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <a href="https://developers.google.com/identity/protocols/oauth2/scopes" target="_blank" rel="noreferrer" className="link-btn">Official Documentation <ExternalLink size={12} /></a>
                      <a href="https://github.com/shauatsmvec/klerk/blob/main/documentation/usage_guide/usage_guide.md" target="_blank" rel="noreferrer" className="link-btn">GitHub Source <ExternalLink size={12} /></a>
                    </div>
                  </div>
                )}

                {activeModal === 'postgresql_database' && (
                  <div>
                    <p>Our metadata registry is hosted on Supabase (PostgreSQL).</p>
                    <h3>Database Tables</h3>
                    <ul>
                      <li><code>users</code>: Links phone numbers to Gmail addresses.</li>
                      <li><code>documents</code>: Stores filenames, hashes, OCR text, and metadata.</li>
                      <li><code>conversation_states</code>: Tracks active chat registration sessions.</li>
                    </ul>
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--colors-hairline)', display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <a href="https://supabase.com/docs/guides/database" target="_blank" rel="noreferrer" className="link-btn">Official Documentation <ExternalLink size={12} /></a>
                      <a href="https://github.com/shauatsmvec/klerk/blob/main/project/src/infrastructure/database.ts" target="_blank" rel="noreferrer" className="link-btn">GitHub Source <ExternalLink size={12} /></a>
                    </div>
                  </div>
                )}

                {activeModal === 'row_level_security' && (
                  <div>
                    <p>Row Level Security (RLS) policies are active on Supabase tables.</p>
                    <h3>Database Rules</h3>
                    <ul>
                      <li><strong>Read Isolation</strong>: Users can only query files linked to their phone number.</li>
                      <li><strong>Developer Override</strong>: Dashboards bypass policies using service role keys.</li>
                    </ul>
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--colors-hairline)', display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <a href="https://www.postgresql.org/docs/current/ddl-rowsecurity.html" target="_blank" rel="noreferrer" className="link-btn">Official Documentation <ExternalLink size={12} /></a>
                      <a href="https://github.com/shauatsmvec/klerk/blob/main/project/migrations/20260710_create_multitenancy_tables.sql" target="_blank" rel="noreferrer" className="link-btn">GitHub Source <ExternalLink size={12} /></a>
                    </div>
                  </div>
                )}

                {activeModal === 'schema_migrations' && (
                  <div>
                    <p>Schema changes are tracked via database migrations:</p>
                    <ul>
                      <li><code>20260707_create_documents_table.sql</code>: Sets up the base invoice registry.</li>
                      <li><code>20260710_create_multitenancy_tables.sql</code>: Configures multi-tenant relationships and user tracking schemas.</li>
                    </ul>
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--colors-hairline)', display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <a href="https://supabase.com/docs/guides/cli/local-development#database-migrations" target="_blank" rel="noreferrer" className="link-btn">Official Documentation <ExternalLink size={12} /></a>
                      <a href="https://github.com/shauatsmvec/klerk/tree/main/project/migrations" target="_blank" rel="noreferrer" className="link-btn">GitHub Source <ExternalLink size={12} /></a>
                    </div>
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
              <span onClick={(e) => handleDocClick(e, 'ingestion_webhooks')} className="footer-link" style={{ cursor: 'pointer' }}>Ingestion Webhooks</span>
              <span onClick={(e) => handleDocClick(e, 'upload_services')} className="footer-link" style={{ cursor: 'pointer' }}>Upload Services</span>
              <span onClick={(e) => handleDocClick(e, 'pg_boss_queues')} className="footer-link" style={{ cursor: 'pointer' }}>pg-boss Queues</span>
            </div>
          </div>
          <div className="footer-column">
            <h3>GCP Setup</h3>
            <div className="footer-links">
              <span onClick={(e) => handleDocClick(e, 'google_drive_api')} className="footer-link" style={{ cursor: 'pointer' }}>Google Drive API</span>
              <span onClick={(e) => handleDocClick(e, 'google_sheets_sync')} className="footer-link" style={{ cursor: 'pointer' }}>Google Sheets Sync</span>
              <span onClick={(e) => handleDocClick(e, 'oauth_scopes')} className="footer-link" style={{ cursor: 'pointer' }}>OAuth Scopes</span>
            </div>
          </div>
          <div className="footer-column">
            <h3>Supabase</h3>
            <div className="footer-links">
              <span onClick={(e) => handleDocClick(e, 'postgresql_database')} className="footer-link" style={{ cursor: 'pointer' }}>PostgreSQL Database</span>
              <span onClick={(e) => handleDocClick(e, 'row_level_security')} className="footer-link" style={{ cursor: 'pointer' }}>Row Level Security</span>
              <span onClick={(e) => handleDocClick(e, 'schema_migrations')} className="footer-link" style={{ cursor: 'pointer' }}>Schema Migrations</span>
            </div>
          </div>
        </div>
        
        <div className="footer-legal">
          <p style={{ margin: 0 }}>Copyright © 2026 Klerk Inc. All rights reserved. Deployed via Render and Supabase.</p>
          <div className="footer-legal-links">
            <span onClick={(e) => handleDocClick(e, 'privacy')} className="footer-legal-link">Privacy Policy</span>
            <span onClick={(e) => handleDocClick(e, 'terms')} className="footer-legal-link">Terms of Use</span>
            <span onClick={(e) => handleDocClick(e, 'legal')} className="footer-legal-link">Legal Notice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
