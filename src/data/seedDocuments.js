export const STORAGE_KEY = 'cea-documents-v1';

export const CATEGORIES = ['Fondamentaux', 'Associations', 'Événementiel', 'Archives', 'Autres'];
export const TYPES = ['Officiel', 'Modèle', 'Suivi', 'Dossier', 'Archive'];
export const STATUSES = ['Actif', 'En révision', 'Archivé'];

export const seedDocuments = [
  {
    id: '1',
    title: 'Guide complet des procédures CEA',
    category: 'Fondamentaux',
    type: 'Officiel',
    status: 'Actif',
    tags: ['procédure', 'guide', 'cea'],
    link: 'https://docs.google.com/document/d/1IfhxKrPhn--jCDfFpuiT2kDmccrlrMo7zpyhxbDM24s/edit?usp=sharing',
    description: 'Document de référence principal pour les procédures du CEA. Contient toutes les démarches internes, les protocoles de validation, et les étapes à suivre pour chaque opération du pôle.',
    contact: '555-0100',
    important: true,
    updatedAt: '2026-03-20'
  },
  {
    id: '2',
    title: 'Tableau suivi associations',
    category: 'Associations',
    type: 'Suivi',
    status: 'Actif',
    tags: ['association', 'suivi'],
    link: 'https://docs.google.com/spreadsheets/d/1r-ngudJKDWjhWLvMP7NOh9-4CfGgsjDfSt_oNuOV3ws/edit?usp=sharing',
    description: 'Suivi central des associations enregistrées auprès du CEA. Inclut les statuts d\'agrément, les dates de renouvellement et les responsables désignés.',
    contact: '555-0101',
    important: true,
    updatedAt: '2026-03-20'
  },
  {
    id: '3',
    title: 'Modèle contrat association',
    category: 'Associations',
    type: 'Modèle',
    status: 'Actif',
    tags: ['contrat', 'modèle', 'association'],
    link: 'https://docs.google.com/document/d/1ezHJuwsIO_2_bLCQBeNCQ_-C6Ksvc2I1EynRjo70aeQ/edit?usp=sharing',
    description: 'Modèle officiel de contrat pour les associations. À utiliser obligatoirement pour toute nouvelle convention entre le CEA et une association.',
    contact: '555-0101',
    important: true,
    updatedAt: '2026-03-20'
  },
  {
    id: '4',
    title: 'Dossier événementiel',
    category: 'Événementiel',
    type: 'Dossier',
    status: 'Actif',
    tags: ['événementiel', 'dossier'],
    link: 'https://drive.google.com/drive/folders/1Tz5hzM2aSt-dJ-jvDGliBU_T4NcmDxeI?usp=drive_link',
    description: 'Dossier principal du pôle événementiel. Contient les plannings, les autorisations, les budgets prévisionnels et les comptes-rendus de chaque événement organisé.',
    contact: '555-0102',
    important: true,
    updatedAt: '2026-03-20'
  }
];

/**
 * POINT DE BRANCHEMENT — PERSISTANCE
 *
 * Pour brancher une vraie base de données (Supabase, Firebase, API REST, etc.),
 * remplace les fonctions ci-dessous par des appels réseau.
 *
 * Exemple avec une API REST :
 *   export async function loadDocuments() {
 *     const res = await fetch('/api/documents');
 *     return res.json();
 *   }
 *   export async function saveDocuments(docs) {
 *     await fetch('/api/documents', { method: 'PUT', body: JSON.stringify(docs) });
 *   }
 */
export function loadDocuments() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedDocuments;
  try {
    return JSON.parse(raw);
  } catch {
    return seedDocuments;
  }
}

export function saveDocuments(docs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}
