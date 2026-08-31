import { jsPDF } from 'jspdf';
import type { Werk } from '../types';

/**
 * Export als PDF-Katalog — Konzept Abschnitt 5 ("eigene kleine Ausstellungs-
 * kataloge"). Läuft komplett clientseitig, kein Backend nötig.
 */
export function exportCollectionAsPdf(works: Werk[]) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(120, 100, 70);
  doc.text('Kunstwerke', margin, margin);
  doc.setFont('times', 'normal');
  doc.setFontSize(22);
  doc.setTextColor(30, 25, 20);
  doc.text('Sammlungskatalog', margin, margin + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  const dateLabel = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`${works.length} Werke · erstellt am ${dateLabel}`, margin, margin + 17);

  let y = margin + 30;
  const imageSize = 32;

  works.forEach((w, i) => {
    const entryHeight = 42;
    if (y + entryHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    if (w.photoDataUrl) {
      try {
        doc.addImage(w.photoDataUrl, 'JPEG', margin, y, imageSize, imageSize, undefined, 'FAST');
      } catch {
        // beschädigtes/unlesbares Foto — Katalogeintrag bleibt ohne Bild bestehen
      }
    }

    const textX = margin + imageSize + 6;
    const textWidth = contentWidth - imageSize - 6;
    let ty = y + 5;

    doc.setFont('times', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(25, 22, 18);
    doc.text(w.title || 'Unbenanntes Werk', textX, ty, { maxWidth: textWidth });
    ty += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(90, 80, 70);
    const artistLine = [w.artistCall, w.year].filter(Boolean).join(' · ');
    if (artistLine) {
      doc.text(artistLine, textX, ty, { maxWidth: textWidth });
      ty += 5;
    }

    doc.setTextColor(130, 125, 118);
    const placeLine = [w.museum, w.city].filter(Boolean).join(', ');
    if (placeLine) {
      doc.text(placeLine, textX, ty, { maxWidth: textWidth });
      ty += 5;
    }

    if (w.material) {
      doc.text(w.material, textX, ty, { maxWidth: textWidth });
    }

    y += entryHeight;
    if (i < works.length - 1) {
      doc.setDrawColor(225, 220, 210);
      doc.line(margin, y - 8, pageWidth - margin, y - 8);
    }
  });

  doc.save(`kunstwerke-katalog-${new Date().toISOString().slice(0, 10)}.pdf`);
}
