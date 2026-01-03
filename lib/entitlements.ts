import { Entitlements } from './types';

const DEMO_LICENSE_KEY = 'METHODICA-PRO-DEMO';
const ENTITLEMENTS_STORAGE_KEY = 'methodica_entitlements';

export function getDefaultEntitlements(): Entitlements {
  return {
    is_pro: false,
    features: {
      svg_export: false,
      pdf_export: false,
      full_equations: false,
    },
  };
}

export function getProEntitlements(): Entitlements {
  return {
    is_pro: true,
    features: {
      svg_export: true,
      pdf_export: true,
      full_equations: true,
    },
  };
}

export function loadEntitlements(): Entitlements {
  if (typeof window === 'undefined') {
    return getDefaultEntitlements();
  }

  const stored = localStorage.getItem(ENTITLEMENTS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getDefaultEntitlements();
    }
  }

  return getDefaultEntitlements();
}

export function saveEntitlements(ent: Entitlements): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ENTITLEMENTS_STORAGE_KEY, JSON.stringify(ent));
}

export async function verifyLicense(licenseKey: string): Promise<Entitlements> {
  if (licenseKey === DEMO_LICENSE_KEY) {
    const ent = getProEntitlements();
    saveEntitlements(ent);
    return ent;
  }

  // In a real app, this would call POST /api/license/verify
  // For now, we'll just return free entitlements
  const ent = getDefaultEntitlements();
  saveEntitlements(ent);
  return ent;
}

export function clearEntitlements(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ENTITLEMENTS_STORAGE_KEY);
}
