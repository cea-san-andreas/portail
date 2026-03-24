/**
 * Galerie vitrine (carrousel) — liste figée dans le dépôt.
 * Les visiteurs ne peuvent pas modifier ces images depuis l’app ;
 * pour changer les visuels : remplacer les fichiers dans public/welcome-gallery/ (01.png … 08.png)
 * et ajuster les textes ci-dessous si besoin.
 */
const base = import.meta.env.BASE_URL;

export const WELCOME_GALLERY_IMAGES = Object.freeze([
  { src: `${base}welcome-gallery/01.png`, alt: 'Scène de concert en plein air de nuit — San Andreas' },
  { src: `${base}welcome-gallery/02.png`, alt: 'Grande scène événementielle « Fame or Shame »' },
  { src: `${base}welcome-gallery/03.png`, alt: 'Yacht de luxe au coucher du soleil' },
  { src: `${base}welcome-gallery/04.png`, alt: 'Amphithéâtre en plein jour — foule et scène' },
  { src: `${base}welcome-gallery/05.png`, alt: 'Pont arrière du yacht — terrasse et jacuzzi' },
  { src: `${base}welcome-gallery/06.png`, alt: 'Yacht et hélicoptère au large' },
  { src: `${base}welcome-gallery/07.png`, alt: 'Studio d’enregistrement — console de mixage' },
  { src: `${base}welcome-gallery/08.png`, alt: 'Espace accueil et lounge — disques décoratifs' },
]);
