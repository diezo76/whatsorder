// apps/web/lib/generateOrderPDF.ts
// Generateur de ticket de commande PDF pour impression cuisine

import jsPDF from 'jspdf';
import type { Order } from '@/types/order';
import { DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/shared/labels';

export function generateOrderPDF(order: Order, restaurantName?: string): void {
  // Format ticket thermique: 80mm de large (~226 points), longueur dynamique
  const pageWidth = 226;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  // Estimer la hauteur necessaire
  let estimatedHeight = 300; // Base
  estimatedHeight += order.items.length * 40;
  if (order.customerNotes) estimatedHeight += 20;
  if (order.deliveryAddress) estimatedHeight += 20;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [pageWidth, estimatedHeight],
  });

  let y = margin;

  // --- FONCTIONS UTILITAIRES ---
  const addLine = (text: string, fontSize: number = 8, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' | 'right' = 'left') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);

    const maxWidth = contentWidth;
    const lines = doc.splitTextToSize(text, maxWidth);

    for (const line of lines) {
      let xPos = margin;
      if (align === 'center') {
        xPos = pageWidth / 2;
      } else if (align === 'right') {
        xPos = pageWidth - margin;
      }
      doc.text(line, xPos, y, { align });
      y += fontSize * 1.4;
    }
  };

  const addSeparator = (char: string = '-') => {
    const sep = char.repeat(Math.floor(contentWidth / 4));
    addLine(sep, 7, 'normal', 'center');
  };

  const addDoubleColumn = (left: string, right: string, fontSize: number = 8, leftStyle: 'normal' | 'bold' = 'normal', rightStyle: 'normal' | 'bold' = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', leftStyle);
    doc.text(left, margin, y);
    doc.setFont('helvetica', rightStyle);
    doc.text(right, pageWidth - margin, y, { align: 'right' });
    y += fontSize * 1.4;
  };

  // --- EN-TETE ---
  addLine('================================', 7, 'normal', 'center');
  addLine(restaurantName || 'Restaurant', 12, 'bold', 'center');
  y += 2;
  addLine(`Commande #${order.orderNumber}`, 10, 'bold', 'center');
  y += 2;

  // Date et heure
  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  addLine(`${dateStr} ${timeStr}`, 8, 'normal', 'center');
  addLine('================================', 7, 'normal', 'center');
  y += 4;

  // --- CLIENT ---
  addLine(`Client: ${order.customer.name}`, 8, 'bold');
  addLine(`Tel: ${order.customer.phone}`, 8);
  if (order.customer.email) {
    addLine(`Email: ${order.customer.email}`, 7);
  }
  y += 2;

  // --- TYPE DE COMMANDE ---
  const deliveryLabel = DELIVERY_TYPE_LABELS[order.deliveryType] || order.deliveryType;
  addLine(`Type: ${deliveryLabel}`, 8, 'bold');

  if (order.deliveryZone) {
    addLine(`Zone: ${order.deliveryZone}`, 8);
  }
  if (order.deliveryAddress) {
    addLine(`Adresse: ${order.deliveryAddress}`, 7);
  }
  if (order.scheduledTime) {
    addLine(`Heure: ${order.scheduledTime}`, 8);
  }

  // --- PAIEMENT ---
  if (order.paymentMethod) {
    const paymentLabel = PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod;
    addLine(`Paiement: ${paymentLabel}`, 8);
  }

  addSeparator('-');
  y += 2;

  // --- ARTICLES ---
  addLine('ARTICLES', 9, 'bold', 'center');
  addSeparator('-');

  for (const item of order.items) {
    const itemName = item.name || item.menuItem.name;
    const customization = item.customization as any;
    
    // Ligne principale: quantite x nom - prix
    let mainLine = `${item.quantity}x ${itemName}`;
    if (customization?.variant) {
      mainLine += ` (${customization.variant})`;
    }
    addDoubleColumn(mainLine, `${item.subtotal.toFixed(2)}`, 8, 'bold', 'bold');

    // Options/modifiers
    if (customization?.modifiers && customization.modifiers.length > 0) {
      const modifiersText = `  > ${customization.modifiers.join(', ')}`;
      addLine(modifiersText, 7);
    }

    // Notes de l'item
    if (item.notes || customization?.notes) {
      addLine(`  Note: ${item.notes || customization.notes}`, 7);
    }
  }

  addSeparator('-');
  y += 2;

  // --- TOTAUX ---
  addDoubleColumn('Sous-total:', `${order.subtotal.toFixed(2)} EGP`, 8);

  if ((order.deliveryFee || 0) > 0) {
    addDoubleColumn('Frais livraison:', `${(order.deliveryFee || 0).toFixed(2)} EGP`, 8);
  }

  if ((order.discount || 0) > 0) {
    addDoubleColumn('Remise:', `-${(order.discount || 0).toFixed(2)} EGP`, 8);
  }

  addSeparator('=');
  addDoubleColumn('TOTAL:', `${order.total.toFixed(2)} EGP`, 11, 'bold', 'bold');
  addSeparator('=');

  // --- NOTES ---
  if (order.customerNotes) {
    y += 4;
    addLine('Notes client:', 8, 'bold');
    addLine(order.customerNotes, 7);
  }

  // --- PIED DE PAGE ---
  y += 8;
  addLine('================================', 7, 'normal', 'center');
  addLine('Merci pour votre commande !', 8, 'normal', 'center');
  addLine('================================', 7, 'normal', 'center');

  // Telecharger le PDF
  doc.save(`ticket-${order.orderNumber}.pdf`);
}
