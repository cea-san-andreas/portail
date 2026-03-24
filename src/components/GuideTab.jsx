import { BookOpen, Download, Upload, Plus, Search, Pencil, Trash2, Database } from 'lucide-react';

const steps = [
  {
    icon: Plus,
    title: 'Ajouter un document',
    description: 'Clique sur le bouton "Ajouter un document" dans l\'en-tête. Renseigne le titre, la catégorie, le type, le lien, les tags et la description.',
  },
  {
    icon: Search,
    title: 'Rechercher et filtrer',
    description: 'Utilise la barre de recherche et les filtres par catégorie, type et statut pour retrouver rapidement un document.',
  },
  {
    icon: Pencil,
    title: 'Modifier un document',
    description: 'Clique sur "Modifier" sur la fiche d\'un document pour mettre à jour ses informations.',
  },
  {
    icon: Trash2,
    title: 'Supprimer un document',
    description: 'Clique sur "Supprimer" pour retirer un document de la base. Cette action est irréversible.',
  },
  {
    icon: Download,
    title: 'Exporter la base',
    description: 'Clique sur "Exporter" pour télécharger un fichier JSON contenant tous les documents. Utile pour la sauvegarde.',
  },
  {
    icon: Upload,
    title: 'Importer une base',
    description: 'Clique sur "Importer" pour charger un fichier JSON et restaurer tes documents sur un autre appareil.',
  },
];

export default function GuideTab() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border bg-surface-alt/50">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-bold text-primary">Guide d'utilisation</h2>
        </div>
      </div>

      <div className="p-5 grid md:grid-cols-2 gap-4">
        {steps.map(({ icon: Icon, title, description }, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-surface-alt/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-gold-dark" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primary">{i + 1}. {title}</h3>
              <p className="text-sm text-text-muted mt-0.5">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 border-t border-border bg-surface-alt/30">
        <div className="flex items-start gap-3">
          <Database className="w-4 h-4 text-text-light mt-0.5 shrink-0" />
          <p className="text-sm text-text-light">
            Les données sont stockées localement dans le navigateur (localStorage).
            Le système est conçu pour être facilement connecté à une vraie base de données (Supabase, Firebase, API REST) en modifiant uniquement le fichier <code className="px-1.5 py-0.5 bg-surface rounded text-xs font-mono">src/data/seedDocuments.js</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
