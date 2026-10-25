export type Rule = { months: number; bps: number };
export interface Tier {
  name: string;
  setup: number;
  monthly: number;
  features: string[];
  rules?: Rule[];
  approved?: boolean;
  limits?: string;
  exclusions?: string;
  support?: string;
  legal?: LegalTemplate;
}
export interface LegalTemplate {
  _id: string;
  product: string;
  tier: string;
  version: number;
  title: string;
  body: string;
  approved: boolean;
  reviewer?: string;
  approvalKind?: "owner" | "legal_review";
}
export interface Quote {
  tier: string;
  months: number;
  originalMonthly: number;
  discountBps: number;
  discountApproximate?: boolean;
  authorizedDiscountBps?: number;
  monthly: number;
  setup: number;
  subtotal: number;
  tax: number;
  total: number;
  savings: number;
  addons?: number;
}
export interface OfferInput {
  priceRounding?: "exact" | "ending9";
  pages?: ProjectPage[];
  projectDetails?: ProjectDetails;
  title: string;
  product: string;
  recipientEmail: string;
  clientLabel: string;
  description: string;
  scope: string;
  milestones: string;
  delivery: string;
  paymentTerms: string;
  cancellation: string;
  thirdPartyCosts: string;
  ipTerms: string;
  dataExit: string;
  liability: string;
  jurisdiction: string;
  renewal: string;
  expires: string;
  tiers: Tier[];
  rules?: Rule[];
  tax: { mode: string; bps: number };
  discountSetup: boolean;
  internalNotes: string;
  composition?: {
    specialRequirements: string;
    deliveryDays: number;
    revisionRounds: number;
    depositPercent: number;
  };
  addons: { label: string; amount: number }[];
  attachments: string[];
}
export interface ProjectPage {
  name: string;
  path: string;
  description: string;
  tiers: string[];
}
export interface ProjectDetails {
  design: string;
  content: string;
  integrations: string;
  acceptance: string;
}
export interface Snapshot extends Omit<
  OfferInput,
  "recipientEmail" | "clientLabel" | "internalNotes" | "attachments"
> {
  version: number;
  createdAt: string;
  quotes: Quote[];
  privacyNotice: string;
  digest: string;
  attachments: { id: string; label: string; digest: string }[];
}
export interface Settings {
  rules: Rule[];
  businessName: string;
  businessId: string;
  businessAddress: string;
  adminEmail: string;
  adminPhone: string;
  whatsappConsent: boolean;
  privacyNotice: string;
  retentionPolicy: string;
  productionApproved: boolean;
  signingMode?: "production" | "test";
  whatsappEnabled?: boolean;
  whatsappTemplateName?: string;
  whatsappTemplateLanguage?: string;
  capabilities: {
    mail: boolean;
    whatsapp: boolean;
    whatsappCredentials?: boolean;
    pdf: boolean;
    binding: boolean;
    publishing?: boolean;
    storage: string;
  };
}
export interface Offer {
  _id: string;
  input: OfferInput;
  status: string;
  version: number;
  createdAt: string;
  state: string;
  url?: string;
  contractId?: string;
}
export interface Product {
  _id: string;
  label: string;
  tiers: Tier[];
}
export interface Audit {
  _id: string;
  action: string;
  at: string;
  subject: string;
}
export interface Job {
  _id: string;
  channel: string;
  kind: string;
  status: string;
  attempts: number;
}
export interface Contract {
  _id: string;
  clientLabel: string;
  offerId: string;
  email: string;
  product: string;
  tier: string;
  months: number;
  monthly: number;
  total: number;
  mode: string;
  createdAt: string;
  evidence: Record<string, unknown>;
  evidenceDigest: string;
  state?: { payment: string; service: string };
  payload?: { snapshot: Snapshot; signer: { fullName: string } };
  notifications?: Job[];
  audit?: Audit[];
}
export interface Dashboard {
  counts: Record<string, number>;
  awaitingPayment: number;
  activity: Audit[];
}
export interface OfferAccess {
  snapshot: Snapshot;
  email: string;
  mode: string;
  contractId?: string;
}
export type RequestError = Error & { status?: number };
