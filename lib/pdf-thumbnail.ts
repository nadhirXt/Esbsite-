import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Configuration du worker (obligatoire pour pdf.js)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

/**
 * Génère une miniature (Blob JPEG) à partir de la première page d'un fichier PDF.
 * @param file Fichier PDF uploadé
 * @returns Blob de l'image (JPEG) ou null si erreur / non-PDF
 */
export async function generatePDFThumbnail(file: File): Promise<Blob | null> {
  if (file.type !== 'application/pdf') return null;

  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Charger le document PDF
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Obtenir la première page
    const page = await pdf.getPage(1);
    
    // Définir l'échelle de rendu (1.5 offre une bonne qualité/taille)
    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    // Créer un canvas HTML5
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error("Impossible de créer le contexte 2D du canvas");
      return null;
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Rendre la page PDF sur le canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;

    // Convertir le canvas en Blob JPEG
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.8 // Qualité JPEG (80%)
      );
    });
  } catch (error) {
    console.error("Erreur lors de la génération de la miniature PDF :", error);
    return null;
  }
}
