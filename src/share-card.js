export function buildShareContent(card, language = 'English') {
  if (!card || card.is_abstention) throw new Error('Safety notices are not shareable evidence cards');
  const es = language === 'Español';
  const level = card.claim_mapping_reviewed ? card.evidence_level : 'Not Addressed';
  const labels = {
    Supported: es ? 'Respaldado' : 'Supported',
    'Limited Evidence': es ? 'Evidencia limitada' : 'Limited evidence',
    'Not Addressed': es ? 'No abordado' : 'Not addressed',
  };
  if (!labels[level]) throw new Error('Invalid evidence level');
  const source = card.sources?.find(item => /^https:\/\/ods\.od\.nih\.gov\//.test(item.url ?? ''));
  const excerpt = source?.text ?? (es ? 'No hay un pasaje ODS local para esta consulta.' : 'No local ODS passage was found for this review.');
  const candidate = excerpt.slice(0, 460);
  const quote = excerpt.length > 460 && candidate.lastIndexOf(' ') > 0
    ? candidate.slice(0, candidate.lastIndexOf(' ')) : candidate;
  return {
    title: es ? 'Menos ruido. Más evidencia.' : 'Less hype. More evidence.',
    hype: es ? 'Una afirmación no es evidencia.' : 'A claim is not evidence.',
    heading: es ? 'LO QUE DICE LA FUENTE' : 'WHAT THE SOURCE SAYS',
    level, label: labels[level],
    context: level === 'Not Addressed'
      ? (es ? 'Sin conclusión revisada. No significa que sea falso.' : 'No reviewed conclusion. This does not mean “false.”')
      : (es ? 'Solo en el contexto revisado. No es una recomendación personal.' : 'Only in the reviewed context. Not a personal recommendation.'),
    quote,
    shortened: excerpt.length > 460,
    reference: source?.master_claim_id ?? 'CLM-000',
    url: source?.url ?? '',
    disclaimer: es ? 'Educación, no consejo médico. Etiquetas de la app, no de NIH.'
      : 'Education, not medical advice. App labels, not NIH ratings.',
    review: card.claim_mapping_reviewed
      ? (es ? 'Asignación de afirmación revisada' : 'Reviewed claim mapping')
      : (es ? 'Prototipo · revisión de afirmación pendiente' : 'Prototype · claim review pending'),
  };
}

export function shareContentText(content) {
  return [
    'SupplementQuest', content.title, content.hype, content.label, content.context,
    content.heading, content.quote,
    content.shortened ? '…' : '', content.reference, content.url, content.review, content.disclaimer,
  ].filter(Boolean).join('\n\n');
}

function wrappedLines(context, text, width) {
  const lines = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      // Split long URLs without shrinking citation text below a readable size.
      const pieces = [];
      let piece = '';
      for (const char of word) {
        if (context.measureText(piece + char).width > width) {
          pieces.push(piece);
          piece = char;
        } else piece += char;
      }
      if (piece) pieces.push(piece);
      for (const part of pieces) {
        const candidate = line ? `${line} ${part}` : part;
        if (context.measureText(candidate).width > width && line) {
          lines.push(line);
          line = part;
        } else line = candidate;
      }
    }
    lines.push(line);
  }
  return lines;
}

function drawWrapped(context, text, x, y, width, lineHeight) {
  for (const line of wrappedLines(context, text, width)) {
    context.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

export async function renderShareImage(content) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Graphic export is unavailable in this browser');
  ctx.fillStyle = '#f5f7f2';
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.fillStyle = '#173d4c';
  ctx.fillRect(0, 0, 1080, 260);
  ctx.fillStyle = '#c5dfd1';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('SUPPLEMENTQUEST', 64, 65);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px sans-serif';
  drawWrapped(ctx, content.title, 64, 135, 940, 58);
  ctx.font = '28px sans-serif';
  ctx.fillText(content.hype, 64, 225);
  ctx.fillStyle = content.level === 'Supported' ? '#e7f4e9'
    : content.level === 'Limited Evidence' ? '#fff5c2' : '#ffffff';
  ctx.fillRect(64, 306, 952, 84);
  ctx.fillStyle = '#173d4c';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(content.label, 88, 362);
  ctx.font = '28px sans-serif';
  drawWrapped(ctx, content.context, 64, 440, 940, 38);
  ctx.fillStyle = '#0d6159';
  ctx.font = 'bold 25px sans-serif';
  ctx.fillText(content.heading, 64, 550);
  ctx.fillStyle = '#243f49';
  ctx.font = '28px sans-serif';
  const quoteLines = wrappedLines(ctx, content.quote, 940);
  const visibleLines = quoteLines.slice(0, 12);
  const shortened = content.shortened || quoteLines.length > visibleLines.length;
  if (shortened) {
    let lastLine = visibleLines.at(-1) ?? '';
    while (ctx.measureText(lastLine + '…').width > 940) lastLine = lastLine.slice(0, -1);
    visibleLines[visibleLines.length - 1] = lastLine + '…';
  }
  visibleLines.forEach((line, index) => ctx.fillText(line, 64, 610 + index * 36));
  ctx.font = '22px sans-serif';
  ctx.fillText(content.heading === 'WHAT THE SOURCE SAYS'
    ? 'Source excerpt · read the full source for context.'
    : 'Extracto · lee la fuente completa para conocer el contexto.', 64, 1080);
  ctx.strokeStyle = '#c4d3cc';
  ctx.beginPath();
  ctx.moveTo(64, 1120);
  ctx.lineTo(1016, 1120);
  ctx.stroke();
  ctx.font = '22px sans-serif';
  let y = drawWrapped(ctx, `${content.reference} · ${content.review}`, 64, 1160, 940, 28);
  y = drawWrapped(ctx, content.url, 64, y + 6, 940, 28);
  drawWrapped(ctx, content.disclaimer, 64, y + 12, 940, 28);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG export failed')), 'image/png');
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
