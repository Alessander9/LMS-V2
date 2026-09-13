import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  NgZone,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export interface NewsletterBookshelfItem {
  id: string;
  title: string;
  date: string;
  subtitle?: string;
  href?: string;
  color?: string;
  foil?: string;
  author?: string;
  price?: number;
  category?: string;
  customTextures?: {
    spread?: string;
    insideSpread?: string;
  };
}

interface BookLayout extends NewsletterBookshelfItem {
  x: number;
  width: number;
  bookHeight: number;
  depth: number;
  motif: number;
  color: string;
  foil: string;
}

interface BookMeshObject {
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  coverPivotGroup: THREE.Group;
  coverMesh: THREE.Mesh;
  book: BookLayout;
  index: number;
  textures: {
    cover: THREE.CanvasTexture | null;
    spine: THREE.CanvasTexture | null;
    back: THREE.CanvasTexture | null;
    insideCover: THREE.CanvasTexture | null;
    innerPage: THREE.CanvasTexture | null;
    paper: THREE.CanvasTexture | null;
  };
  focusFlight: {
    startedAt: number;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: number;
  } | null;
  exitFlight: {
    startedAt: number;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: number;
  } | null;
  selectedAt: number;
  wasSelected: boolean;
}

const PALETTE = [
  '#002244', // Plataforma LMS Corporate Navy
  '#003767', // Plataforma LMS Deep Ocean
  '#0b1e4b', // Midnight Navy
  '#16277a', // Royal Indigo
  '#004d8c', // Deep Blue
  '#0066aa', // Vibrant Blue
  '#1e293b', // Slate Dark
  '#005299', // Classic Navy
  '#25252a', // Obsidian
  '#06264a', // Dark Plataforma LMS Navy
  '#1f3a60', // Steel Blue
  '#112233', // Deep Ink
];

const DEFAULT_LMS_BOOKS: NewsletterBookshelfItem[] = [
  {
    id: 'ed-1',
    title: 'Atlas y Tratado Clínico de Acupuntura Tradicional China',
    date: 'EDICIÓN 2026',
    subtitle: 'Meridianos, puntos principales y extraordinarios, protocolos y casos reales.',
    author: 'Especialistas MTC Plataforma LMS',
    price: 65,
    category: 'Acupuntura & MTC',
    color: '#002244',
    foil: '#f2ead8'
  },
  {
    id: 'ed-2',
    title: 'Manual de Electroacupuntura Clínica y Neuromodulación',
    date: 'NUEVO 2026',
    subtitle: 'Frecuencias en Hz, selección de ondas y casos clínicos reales.',
    author: 'Lic. Lázaro Regalado',
    price: 55,
    category: 'Electroacupuntura',
    color: '#003767',
    foil: '#ffffff'
  },
  {
    id: 'ed-3',
    title: 'Tratado de Auriculoterapia China y Francesa: Mapas y Protocolos',
    date: 'BESTSELLER',
    subtitle: 'Topografía somatotópica de la oreja, diagnóstico y tratamiento del dolor.',
    author: 'Dirección Académica',
    price: 48,
    category: 'Auriculoterapia',
    color: '#16277a',
    foil: '#f2ead8'
  },
  {
    id: 'ed-4',
    title: 'Guía Terapéutica de Digitopresión Mecánica y Masaje Funcional',
    date: 'EDICIÓN 2026',
    subtitle: 'Técnicas de presión digital, desbloqueo de meridianos y liberación miofascial.',
    author: 'Fisioterapia Plataforma LMS',
    price: 45,
    category: 'Masaje Terapéutico',
    color: '#0b1e4b',
    foil: '#ffffff'
  },
  {
    id: 'ed-5',
    title: 'Compendio de Fitoterapia y Plantas Medicinales del Perú y Oriente',
    date: 'FARMACOPEA',
    subtitle: 'Monografías botánicas, principios activos, sinergias y fórmulas magistrales.',
    author: 'Docencia Botánica',
    price: 50,
    category: 'Fitoterapia',
    color: '#004d8c',
    foil: '#f2ead8'
  },
  {
    id: 'ed-6',
    title: 'Dietética Energética y Nutrición según los 5 Elementos',
    date: 'EDICIÓN 2026',
    subtitle: 'Propiedades térmicas, trofología y planes nutricionales personalizados.',
    author: 'Nutrición Integrativa',
    price: 45,
    category: 'Dietética',
    color: '#1f3a60',
    foil: '#ffffff'
  },
  {
    id: 'ed-7',
    title: 'Manual Clínico de Moxibustión, Ventosas y Terapias Térmicas',
    date: 'EDICIÓN 2026',
    subtitle: 'Técnicas de calor con artemisa, ventosaterapia de succión y sangría.',
    author: 'Cuerpo Docente MTC',
    price: 42,
    category: 'Acupuntura',
    color: '#1e293b',
    foil: '#f2ead8'
  },
  {
    id: 'ed-8',
    title: 'Atlas Clínico de Reflexología Podal y Zonas Reflejas',
    date: 'EDICIÓN 2026',
    subtitle: 'Mapas neuro-reflejos de la planta del pie y abordaje integral.',
    author: 'Especialistas Reflexología',
    price: 45,
    category: 'Reflexología',
    color: '#005299',
    foil: '#ffffff'
  },
  {
    id: 'ed-9',
    title: 'Tratado Clásico del Emperador Amarillo (Huangdi Neijing)',
    date: 'HISTÓRICO',
    subtitle: 'Bases filosóficas del Yin-Yang, Wu Xing y bioenergética humana.',
    author: 'Traducción Académica',
    price: 60,
    category: 'Clásicos MTC',
    color: '#002244',
    foil: '#f2ead8'
  },
  {
    id: 'ed-10',
    title: 'Neuromodulación y Puntos Gatillo Miofasciales',
    date: 'AVANZADO',
    subtitle: 'Integración de punción seca, electroestimulación y dolor musculoesquelético.',
    author: 'Investigación Plataforma LMS',
    price: 55,
    category: 'Electroacupuntura',
    color: '#003767',
    foil: '#ffffff'
  },
  {
    id: 'ed-11',
    title: 'Semiología Clínica del Pulso y de la Lengua en MTC',
    date: 'DIAGNÓSTICO',
    subtitle: 'Guía visual con más de 100 fotografías clínicas y patrones patológicos.',
    author: 'Comité Docente',
    price: 52,
    category: 'Acupuntura & MTC',
    color: '#16277a',
    foil: '#f2ead8'
  },
  {
    id: 'ed-12',
    title: 'Acupuntura Estética Facial y Protocolos Rejuvenecedores',
    date: 'ESTÉTICA',
    subtitle: 'Bases, técnicas y aplicaciones para una práctica terapéutica segura y efectiva. Microagujas, tonificación y rejuvenecimiento.',
    author: 'Cuerpo Docente en Estética Plataforma LMS',
    price: 55,
    category: 'Estética Integral',
    color: '#0a3d74',
    foil: '#dfb76c',
    customTextures: {
      spread: 'assets/libroPortada_Acu_Estetica/4.png',
      insideSpread: 'assets/libroPortada_Acu_Estetica/3.png'
    }
  }
];

function hash(input: string) {
  let value = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function seeded(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function luminance(hex: string) {
  const color = Number.parseInt(hex.replace('#', ''), 16);
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return channel((color >> 16) & 255) * 0.2126 + channel((color >> 8) & 255) * 0.7152 + channel(color & 255) * 0.0722;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  if (context.roundRect) {
    context.roundRect(x, y, width, height, radius);
  } else {
    context.rect(x, y, width, height);
  }
}

function drawMotif(
  context: CanvasRenderingContext2D,
  motif: number,
  x: number,
  y: number,
  size: number,
  color: string
) {
  context.save();
  context.translate(x + size / 2, y + size / 2);
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = Math.max(2, size * 0.035);

  if (motif === 0) {
    for (let index = -2; index <= 2; index += 1) {
      context.beginPath();
      context.arc(0, 0, size * (0.12 + index * 0.035), 0, Math.PI * 2);
      context.stroke();
    }
  } else if (motif === 1) {
    context.rotate(Math.PI / 4);
    for (let index = -1; index <= 1; index += 1) {
      context.strokeRect(
        -size * (0.24 + index * 0.055),
        -size * (0.24 + index * 0.055),
        size * (0.48 + index * 0.11),
        size * (0.48 + index * 0.11)
      );
    }
  } else if (motif === 2) {
    for (let index = 0; index < 6; index += 1) {
      context.rotate(Math.PI / 3);
      roundedRect(context, -size * 0.045, -size * 0.36, size * 0.09, size * 0.28, size * 0.04);
      context.fill();
    }
    context.beginPath();
    context.arc(0, 0, size * 0.11, 0, Math.PI * 2);
    context.fill();
  } else if (motif === 3) {
    context.beginPath();
    for (let index = 0; index < 12; index += 1) {
      const radius = index % 2 ? size * 0.17 : size * 0.35;
      const angle = -Math.PI / 2 + (index * Math.PI) / 6;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (index === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.closePath();
    context.stroke();
  } else if (motif === 4) {
    for (let row = -2; row <= 2; row += 1) {
      for (let column = -2; column <= 2; column += 1) {
        if ((row + column) % 2 === 0) {
          context.beginPath();
          context.arc(column * size * 0.13, row * size * 0.13, size * 0.035, 0, Math.PI * 2);
          context.fill();
        }
      }
    }
  } else if (motif === 5) {
    for (let index = -2; index <= 2; index += 1) {
      context.beginPath();
      context.moveTo(-size * 0.34, index * size * 0.12);
      context.bezierCurveTo(
        -size * 0.12,
        index * size * 0.12 - size * 0.11,
        size * 0.12,
        index * size * 0.12 + size * 0.11,
        size * 0.34,
        index * size * 0.12
      );
      context.stroke();
    }
  } else if (motif === 6) {
    context.beginPath();
    context.moveTo(0, -size * 0.37);
    context.lineTo(size * 0.34, size * 0.28);
    context.lineTo(-size * 0.34, size * 0.28);
    context.closePath();
    context.stroke();
    context.beginPath();
    context.arc(0, size * 0.02, size * 0.11, 0, Math.PI * 2);
    context.fill();
  } else {
    context.rotate(Math.PI / 4);
    context.fillRect(-size * 0.035, -size * 0.36, size * 0.07, size * 0.72);
    context.fillRect(-size * 0.36, -size * 0.035, size * 0.72, size * 0.07);
    context.beginPath();
    context.arc(0, 0, size * 0.25, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();
}

function addTexture(context: CanvasRenderingContext2D, width: number, height: number, seed: number) {
  const image = context.getImageData(0, 0, width, height);
  const random = seeded(seed);
  for (let offset = 0; offset < image.data.length; offset += 4) {
    const noise = (random() - 0.5) * 6;
    image.data[offset] = Math.max(0, Math.min(255, image.data[offset] + noise));
    image.data[offset + 1] = Math.max(0, Math.min(255, image.data[offset + 1] + noise));
    image.data[offset + 2] = Math.max(0, Math.min(255, image.data[offset + 2] + noise));
  }
  context.putImageData(image, 0, 0);
}

function drawClothWeave(context: CanvasRenderingContext2D, width: number, height: number, seed: number) {
  const random = seeded(seed);
  context.save();
  context.lineCap = 'round';

  context.globalCompositeOperation = 'multiply';
  for (let x = 0.5; x < width; x += 3) {
    context.strokeStyle = `rgba(18, 16, 14, ${0.03 + random() * 0.035})`;
    context.lineWidth = 0.35 + random() * 0.3;
    context.beginPath();
    context.moveTo(x + (random() - 0.5) * 0.5, 0);
    context.lineTo(x + (random() - 0.5) * 0.5, height);
    context.stroke();
  }

  context.globalCompositeOperation = 'screen';
  for (let y = 0.5; y < height; y += 3) {
    context.strokeStyle = `rgba(255, 248, 232, ${0.035 + random() * 0.03})`;
    context.lineWidth = 0.3 + random() * 0.25;
    context.beginPath();
    context.moveTo(0, y + (random() - 0.5) * 0.5);
    context.lineTo(width, y + (random() - 0.5) * 0.5);
    context.stroke();
  }

  context.globalCompositeOperation = 'overlay';
  for (let index = 0; index < Math.floor((width * height) / 850); index += 1) {
    const x = random() * width;
    const y = random() * height;
    const length = 3 + random() * 13;
    context.strokeStyle = `rgba(255, 255, 255, ${0.035 + random() * 0.055})`;
    context.lineWidth = 0.35 + random() * 0.4;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + (random() - 0.5) * 2, y + length);
    context.stroke();
  }

  context.globalCompositeOperation = 'source-over';
  const edgeShade = context.createLinearGradient(0, 0, width, 0);
  edgeShade.addColorStop(0, 'rgba(0,0,0,.16)');
  edgeShade.addColorStop(0.045, 'rgba(0,0,0,.025)');
  edgeShade.addColorStop(0.5, 'rgba(255,255,255,.025)');
  edgeShade.addColorStop(0.955, 'rgba(0,0,0,.025)');
  edgeShade.addColorStop(1, 'rgba(0,0,0,.18)');
  context.fillStyle = edgeShade;
  context.fillRect(0, 0, width, height);
  context.restore();
}

function paperTexture(book: BookLayout) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 768;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const random = seeded(hash(`${book.id}-paper`));

  context.fillStyle = '#eee9dc';
  context.fillRect(0, 0, canvas.width, canvas.height);
  addTexture(context, canvas.width, canvas.height, hash(`${book.id}-paper-noise`));

  for (let y = 0.5; y < canvas.height; y += 2) {
    const warm = Math.floor(116 + random() * 35);
    context.strokeStyle = `rgba(${warm}, ${warm - 6}, ${warm - 17}, ${0.09 + random() * 0.1})`;
    context.lineWidth = random() > 0.94 ? 1 : 0.42;
    context.beginPath();
    context.moveTo((random() - 0.5) * 4, y);
    context.bezierCurveTo(
      canvas.width * 0.33,
      y + (random() - 0.5) * 0.8,
      canvas.width * 0.66,
      y + (random() - 0.5) * 0.8,
      canvas.width + (random() - 0.5) * 4,
      y
    );
    context.stroke();
  }

  for (let x = 0.5; x < canvas.width; x += 4) {
    context.strokeStyle = `rgba(124, 103, 72, ${0.025 + random() * 0.04})`;
    context.lineWidth = 0.35;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + (random() - 0.5) * 1.5, canvas.height);
    context.stroke();
  }

  const edgeShade = context.createLinearGradient(0, 0, canvas.width, 0);
  edgeShade.addColorStop(0, 'rgba(96,72,42,.2)');
  edgeShade.addColorStop(0.08, 'rgba(138,112,72,.035)');
  edgeShade.addColorStop(0.5, 'rgba(255,255,255,.16)');
  edgeShade.addColorStop(0.92, 'rgba(138,112,72,.035)');
  edgeShade.addColorStop(1, 'rgba(96,72,42,.18)');
  context.fillStyle = edgeShade;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function createCroppedTexture(
  imageSrc: string,
  targetWidth: number,
  targetHeight: number,
  cropRatio: { sx: number; sy: number; sw: number; sh: number },
  fallbackDraw: (ctx: CanvasRenderingContext2D) => void,
  bgColor: string = '#00274e'
): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');
  if (!context) return null;

  // Fill solid background so there is never transparent or dark border
  context.fillStyle = bgColor;
  context.fillRect(0, 0, targetWidth, targetHeight);

  // Draw procedural fallback immediately so 3D model is never blank
  fallbackDraw(context);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  // Load custom image and replace texture once loaded
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const sx = Math.floor(img.naturalWidth * cropRatio.sx);
    const sy = Math.floor(img.naturalHeight * cropRatio.sy);
    const sw = Math.floor(img.naturalWidth * cropRatio.sw);
    const sh = Math.floor(img.naturalHeight * cropRatio.sh);

    context.fillStyle = bgColor;
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
    texture.needsUpdate = true;
  };
  img.src = imageSrc;

  return texture;
}

function coverTexture(book: BookLayout, brand: string, face: 'cover' | 'spine' | 'back') {
  if (typeof document === 'undefined') return null;

  const targetWidth = (face === 'cover' || face === 'back') ? 512 : 112;
  const targetHeight = 768;

  const drawProcedural = (context: CanvasRenderingContext2D) => {
    context.fillStyle = book.color;
    context.fillRect(0, 0, targetWidth, targetHeight);
    addTexture(context, targetWidth, targetHeight, hash(`${book.id}-${face}-noise`));
    drawClothWeave(context, targetWidth, targetHeight, hash(`${book.id}-${face}-weave`));

    context.fillStyle = book.foil;
    context.strokeStyle = book.foil;
    context.textBaseline = 'top';
    context.shadowColor = 'rgba(0, 0, 0, .3)';
    context.shadowBlur = 1.4;
    context.shadowOffsetX = 0.8;
    context.shadowOffsetY = 1.1;

    if (face === 'cover') {
      const margin = 52;
      context.font = '600 20px ui-monospace, SFMono-Regular, monospace';
      context.fillText(book.date, margin, 54);

      context.font = '700 48px Georgia, serif';
      const words = book.title.split(/\s+/);
      const lines: string[] = [];
      let line = '';
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (context.measureText(next).width < targetWidth - margin * 2 || !line) {
          line = next;
        } else {
          lines.push(line);
          line = word;
        }
      }
      if (line) lines.push(line);

      lines.slice(0, 5).forEach((text, index) => context.fillText(text, margin, 150 + index * 56));
      context.fillRect(margin, 150 + Math.min(lines.length, 5) * 56 + 18, 80, 4);

      drawMotif(context, book.motif, 310, 490, 130, book.foil);

      context.font = '700 18px ui-monospace, SFMono-Regular, monospace';
      context.fillText(brand.toUpperCase(), margin, 680);
    } else if (face === 'back') {
      const margin = 48;
      context.strokeStyle = book.foil;
      context.lineWidth = 2;
      context.strokeRect(28, 28, targetWidth - 56, targetHeight - 56);
      context.lineWidth = 1;
      context.strokeRect(34, 34, targetWidth - 68, targetHeight - 68);

      drawMotif(context, book.motif, targetWidth / 2 - 35, 55, 70, book.foil);

      context.font = '700 20px Georgia, serif';
      context.fillText('Plataforma LMS · EDICIÓN OFICIAL', margin, 150);
      context.fillRect(margin, 178, 55, 2.5);

      context.font = '500 15px Georgia, serif';
      const summary = book.subtitle || 'Guía y manual formativo desarrollado por el cuerpo docente del Instituto Superior de Terapias Integrales Plataforma LMS.';
      const words = summary.split(/\s+/);
      const lines: string[] = [];
      let line = '';
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (context.measureText(next).width < targetWidth - margin * 2 || !line) {
          line = next;
        } else {
          lines.push(line);
          line = word;
        }
      }
      if (line) lines.push(line);
      lines.slice(0, 5).forEach((text, index) => context.fillText(text, margin, 205 + index * 28));

      context.font = '700 13px ui-monospace, SFMono-Regular, monospace';
      context.fillText('FONDO EDITORIAL Plataforma LMS', margin, 420);
      context.font = '500 11px ui-monospace, SFMono-Regular, monospace';
      context.fillText(`ISBN: 978-612-48${Math.abs(hash(book.id)).toString().slice(0, 5)}-01`, margin, 442);
      context.fillText('LIMA, PERÚ · DERECHOS RESERVADOS', margin, 460);

      context.fillStyle = book.foil;
      for (let bx = margin; bx < targetWidth - margin; bx += 4) {
        if ((hash(`${bx}-${book.id}`) % 6) !== 0) {
          context.fillRect(bx, 500, (bx % 3 === 0 ? 2.5 : 1.5), 44);
        }
      }
      context.font = '600 11px ui-monospace, SFMono-Regular, monospace';
      context.fillText('9 786124 802611', margin + 80, 558);

      context.font = '700 13px ui-monospace, SFMono-Regular, monospace';
      context.fillText(brand.toUpperCase(), margin, 675);
    } else {
      const gradient = context.createLinearGradient(0, 0, targetWidth, 0);
      gradient.addColorStop(0, 'rgba(0,0,0,.28)');
      gradient.addColorStop(0.18, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.82, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,.28)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, targetWidth, targetHeight);

      context.fillStyle = book.foil;
      context.fillRect(20, 24, targetWidth - 40, 3);
      context.fillRect(20, 706, targetWidth - 40, 3);

      context.save();
      context.translate(targetWidth / 2, 54);
      context.rotate(Math.PI / 2);
      context.font = '700 34px Georgia, serif';
      const title = book.title.length > 34 ? `${book.title.slice(0, 32)}…` : book.title;
      context.fillText(title, 0, 12);
      context.restore();

      drawMotif(context, book.motif, 28, 626, 56, book.foil);
    }
  };

  if (book.customTextures?.spread) {
    let cropRatio = { sx: 0.54688, sy: 0.05371, sw: 0.39388, sh: 0.88867 }; // Front cover
    if (face === 'back') {
      cropRatio = { sx: 0.05859, sy: 0.05371, sw: 0.39388, sh: 0.88867 }; // Back cover
    } else if (face === 'spine') {
      cropRatio = { sx: 0.46875, sy: 0.05371, sw: 0.06250, sh: 0.88867 }; // Spine
    }
    return createCroppedTexture(book.customTextures.spread, targetWidth, targetHeight, cropRatio, drawProcedural, book.color || '#00274e');
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');
  if (!context) return null;

  drawProcedural(context);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function insideCoverTexture(book: BookLayout, brand: string): THREE.CanvasTexture {
  const targetWidth = 512;
  const targetHeight = 768;

  const drawProcedural = (context: CanvasRenderingContext2D) => {
    context.fillStyle = book.color;
    context.fillRect(0, 0, targetWidth, targetHeight);

    const vignette = context.createRadialGradient(
      targetWidth / 2, targetHeight / 2, 80,
      targetWidth / 2, targetHeight / 2, 380
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0.15)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.65)');
    context.fillStyle = vignette;
    context.fillRect(0, 0, targetWidth, targetHeight);

    context.strokeStyle = book.foil;
    context.lineWidth = 2;
    context.strokeRect(30, 30, targetWidth - 60, targetHeight - 60);
    context.lineWidth = 1;
    context.strokeRect(36, 36, targetWidth - 72, targetHeight - 72);

    drawMotif(context, book.motif, targetWidth / 2 - 40, targetHeight / 2 - 80, 80, book.foil);

    context.fillStyle = book.foil;
    context.textAlign = 'center';
    context.font = '700 13px ui-monospace, monospace';
    context.fillText('FONDO EDITORIAL Plataforma LMS', targetWidth / 2, targetHeight / 2 + 35);
    context.font = '500 11px ui-monospace, monospace';
    context.fillText('BIBLIOTECA DIGITAL DE TERAPIAS INTEGRALES', targetWidth / 2, targetHeight / 2 + 55);
  };

  if (book.customTextures?.insideSpread) {
    const cropRatio = { sx: 0.03255, sy: 0.02930, sw: 0.45573, sh: 0.91797 }; // Inside left flap
    const customTex = createCroppedTexture(book.customTextures.insideSpread, targetWidth, targetHeight, cropRatio, drawProcedural, book.color || '#00274e');
    if (customTex) return customTex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.CanvasTexture(canvas);

  drawProcedural(context);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function innerPageTexture(book: BookLayout, brand: string): THREE.CanvasTexture {
  const targetWidth = 512;
  const targetHeight = 768;

  const drawProcedural = (context: CanvasRenderingContext2D) => {
    context.fillStyle = '#f8f4ec';
    context.fillRect(0, 0, targetWidth, targetHeight);

    const paperGrad = context.createLinearGradient(0, 0, targetWidth, 0);
    paperGrad.addColorStop(0, 'rgba(0,0,0,0.14)');
    paperGrad.addColorStop(0.08, 'rgba(0,0,0,0.03)');
    paperGrad.addColorStop(0.95, 'rgba(0,0,0,0.01)');
    paperGrad.addColorStop(1, 'rgba(0,0,0,0.08)');
    context.fillStyle = paperGrad;
    context.fillRect(0, 0, targetWidth, targetHeight);

    const margin = 48;
    context.fillStyle = '#0f2744';
    context.textAlign = 'left';

    context.font = '700 10px ui-monospace, monospace';
    context.fillText('Plataforma LMS · EDICIÓN ACADÉMICA CLÍNICA', margin, 60);

    context.strokeStyle = '#005299';
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(margin, 70);
    context.lineTo(targetWidth - margin, 70);
    context.stroke();

    context.font = '700 24px Georgia, serif';
    const words = book.title.split(/\s+/);
    let line = '';
    let y = 115;
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (context.measureText(next).width < targetWidth - margin * 2) {
        line = next;
      } else {
        context.fillText(line, margin, y);
        y += 30;
        line = w;
      }
    }
    if (line) {
      context.fillText(line, margin, y);
      y += 30;
    }

    context.font = '600 12px Georgia, serif';
    context.fillStyle = '#005299';
    context.fillText(`Autor: ${book.author || 'Cuerpo Docente Plataforma LMS'}`, margin, y + 10);
    y += 35;

    context.fillStyle = '#0f2744';
    context.font = '700 11px ui-monospace, monospace';
    context.fillText('ÍNDICE GENERAL & PROTOCOLOS', margin, y + 10);
    y += 24;

    context.font = '500 11.5px Georgia, serif';
    context.fillStyle = '#334155';
    const sampleCaps = [
      '• Cap. I: Fundamentos y Bases Epistemológicas',
      '• Cap. II: Cartografía y Topografía Anatómica',
      '• Cap. III: Protocolos de Consulta y Casos Clínicos',
      '• Cap. IV: Dosificación, Frecuencias y Seguridad',
      '• Cap. V: Fichas de Evaluación Práctica'
    ];
    sampleCaps.forEach((cap, i) => {
      context.fillText(cap, margin, y + 10 + i * 22);
    });

    context.strokeStyle = '#cbd5e1';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(margin, 650);
    context.lineTo(targetWidth - margin, 650);
    context.stroke();

    context.font = '600 9px ui-monospace, monospace';
    context.fillStyle = '#64748b';
    context.fillText('FONDO EDITORIAL Plataforma LMS · LIMA, PERÚ', margin, 668);
    context.textAlign = 'right';
    context.fillText('Pág. 1', targetWidth - margin, 668);
  };

  if (book.customTextures?.insideSpread) {
    const cropRatio = { sx: 0.50130, sy: 0.03418, sw: 0.44596, sh: 0.91309 }; // Inner page right
    const customTex = createCroppedTexture(book.customTextures.insideSpread, targetWidth, targetHeight, cropRatio, drawProcedural, '#f8f4ec');
    if (customTex) return customTex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.CanvasTexture(canvas);

  drawProcedural(context);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function damp(current: number, target: number, speed: number, delta: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));
}

const BOOK_ENTER_DURATION = 520;
const BOOK_EXIT_DURATION = 400;

function bezierCoordinate(t: number, point1: number, point2: number) {
  const inverse = 1 - t;
  return 3 * inverse * inverse * t * point1 + 3 * inverse * t * t * point2 + t * t * t;
}

function easeSmoothOut(progress: number) {
  let t = progress;
  for (let iteration = 0; iteration < 5; iteration += 1) {
    const x = bezierCoordinate(t, 0.22, 0.36);
    const inverse = 1 - t;
    const slope = 3 * inverse * inverse * 0.22 + 6 * inverse * t * (0.36 - 0.22) + 3 * t * t * (1 - 0.36);
    if (Math.abs(slope) < 0.0001) break;
    t = THREE.MathUtils.clamp(t - (x - progress) / slope, 0, 1);
  }
  return bezierCoordinate(t, 1, 1);
}

function easeInOutCubic(progress: number) {
  return progress < 0.5 ? 4 * progress * progress * progress : 1 - ((-2 * progress + 2) ** 3) / 2;
}

@Component({
  selector: 'app-newsletter-bookshelf',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="newsletter-bookshelf-container relative w-full overflow-hidden bg-slate-900 select-none text-slate-100 rounded-3xl border border-slate-800 shadow-2xl" [style.height.px]="height">
      
      <!-- Stage Canvas Container -->
      <div
        #stageRef
        class="stage-canvas-wrapper relative w-full h-full cursor-grab active:cursor-grabbing outline-none"
        tabindex="0"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="onPointerUp($event)"
        (pointerleave)="onPointerLeave()"
        (wheel)="onWheel($event)"
        (keydown)="onKeyDown($event)">
        <canvas #canvasRef class="w-full h-full block"></canvas>
      </div>

      <!-- Floating Hover Tooltip -->
      <div
        #tooltipRef
        class="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+16px)] whitespace-nowrap rounded-xl bg-slate-950/95 backdrop-blur-md px-3.5 py-2 font-mono text-[11px] leading-4 text-white shadow-2xl border border-white/10 transition-opacity duration-150"
        [class.opacity-100]="hoveredBook && selectedIndex === null"
        [class.opacity-0]="!hoveredBook || selectedIndex !== null">
        <div class="font-bold text-cyan-300">{{ hoveredBook?.title }}</div>
        <div class="flex items-center gap-2 text-slate-400 text-[10px]">
          <span>{{ hoveredBook?.date }}</span>
          <span>•</span>
          <span class="text-amber-300 font-bold">S/ {{ hoveredBook?.price }}</span>
        </div>
      </div>

      <!-- Header / Instruction Badge -->
      <div class="absolute top-4 left-4 sm:left-6 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold shadow-lg">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>ARCHIVADOR 3D INTERACTIVO</span>
        </div>
        <span class="hidden sm:inline text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
          🖱️ Arrastra para recorrer · Clic para abrir libro
        </span>
      </div>

      <!-- Navigation & Orbit Controls Overlay (Bottom) -->
      <div class="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        <!-- Left buttons: Pan Left / Right -->
        <div class="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            (click)="panCamera(-1)"
            class="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all shadow-md active:scale-95"
            title="Desplazar a la izquierda">
            <span class="material-symbols-outlined text-lg block">chevron_left</span>
          </button>
          <button
            type="button"
            (click)="panCamera(1)"
            class="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all shadow-md active:scale-95"
            title="Desplazar a la derecha">
            <span class="material-symbols-outlined text-lg block">chevron_right</span>
          </button>
        </div>

        <!-- Selected Book Info & Actions Banner -->
        <div *ngIf="selectedBook" class="pointer-events-auto flex flex-wrap items-center gap-2 sm:gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 shadow-2xl animate-fade-in max-w-full">
          <div class="hidden lg:block">
            <span class="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">3d_rotation</span> Inspección 360° Activa
            </span>
            <span class="text-xs font-bold text-white max-w-[200px] truncate block">{{ selectedBook.title }}</span>
          </div>

          <!-- Quick Rotate Actions -->
          <div class="flex items-center gap-1">
            <button
              type="button"
              (click)="rotateSelected(-Math.PI / 2)"
              class="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
              title="Girar 90° a la izquierda">
              <span class="material-symbols-outlined text-sm">rotate_left</span>
              <span class="hidden sm:inline">Girar -90°</span>
            </button>
            <button
              type="button"
              (click)="rotateSelected(Math.PI)"
              class="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
              title="Ver Contratapa (180°)">
              <span class="material-symbols-outlined text-sm">flip</span>
              <span class="hidden sm:inline">Contratapa (180°)</span>
            </button>
            <button
              type="button"
              (click)="rotateSelected(Math.PI / 2)"
              class="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
              title="Girar 90° a la derecha">
              <span class="material-symbols-outlined text-sm">rotate_right</span>
              <span class="hidden sm:inline">Girar +90°</span>
            </button>
          </div>

          <!-- Open / Close 3D Cover Toggle Button -->
          <button
            type="button"
            (click)="toggleCover()"
            class="px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-all"
            [ngClass]="isCoverOpen
              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20'
              : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-cyan-500/25'"
            title="Abrir o cerrar la portada del libro en 3D">
            <span class="material-symbols-outlined text-sm">{{ isCoverOpen ? 'menu_book' : 'auto_stories' }}</span>
            <span>{{ isCoverOpen ? 'Cerrar Portada' : 'Abrir Portada' }}</span>
          </button>

          <button
            type="button"
            (click)="openBook(selectedIndex!)"
            class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
            title="Abrir ficha detallada completa">
            <span class="material-symbols-outlined text-sm">visibility</span>
            <span class="hidden sm:inline">Ver Ficha</span>
          </button>
          <button
            type="button"
            (click)="closeInspection()"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Cerrar vista 3D">
            <span class="material-symbols-outlined text-base block">close</span>
          </button>
        </div>

      </div>

      <!-- Side Sheet / Ficha Técnica Panel (Synchronized with 3D Cover Opening) -->
      <div
        *ngIf="isCoverOpen && selectedBook"
        class="absolute right-3 sm:right-6 top-14 bottom-16 w-[310px] sm:w-[370px] bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-3xl p-5 shadow-2xl shadow-cyan-950/30 overflow-y-auto flex flex-col justify-between space-y-3.5 z-20 animate-slide-in-right pointer-events-auto">
        
        <div class="space-y-3">
          <!-- Header badge & Close Button -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[9px] font-bold uppercase tracking-wider">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              PORTADA ABIERTA · FICHA TÉCNICA
            </span>
            <button
              type="button"
              (click)="toggleCover()"
              class="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Cerrar Portada">
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <!-- Title & Author -->
          <div class="space-y-1">
            <span class="text-[9px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
              {{ selectedBook.category || 'Medicina Tradicional China' }}
            </span>
            <h3 class="text-base font-extrabold text-white leading-snug">
              {{ selectedBook.title }}
            </h3>
            <p class="text-xs text-slate-400 font-medium">
              Autor: <strong class="text-slate-200">{{ selectedBook.author || 'Equipo de Especialistas Plataforma LMS' }}</strong>
            </p>
          </div>

          <!-- Synopsis -->
          <div class="space-y-1">
            <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">📖 Sinopsis</span>
            <p class="text-[11px] text-slate-300 leading-relaxed max-h-24 overflow-y-auto pr-1">
              {{ selectedBook.subtitle || 'Obra clínica de referencia formativa para terapeutas y alumnos, con protocolos prácticos, esquemas y tablas de aplicación inmediata.' }}
            </p>
          </div>

          <!-- Quick Specs -->
          <div class="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-300">
            <div>
              <span class="text-slate-500 block">FORMATO:</span>
              <strong class="text-cyan-300">PDF Digital HD</strong>
            </div>
            <div>
              <span class="text-slate-500 block">EDITORIAL:</span>
              <strong class="text-cyan-300">Plataforma LMS Perú</strong>
            </div>
          </div>

          <!-- Table of Contents Preview -->
          <div class="space-y-1">
            <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">📑 Contenido & Índice</span>
            <div class="space-y-1 text-[10.5px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <div class="flex items-start gap-1.5"><span class="text-cyan-400">✓</span> Cap. I: Fundamentos y Bases Teóricas</div>
              <div class="flex items-start gap-1.5"><span class="text-cyan-400">✓</span> Cap. II: Topografía y Puntos Clínicos</div>
              <div class="flex items-start gap-1.5"><span class="text-cyan-400">✓</span> Cap. III: Protocolos Terapéuticos y Fichas</div>
              <div class="flex items-start gap-1.5"><span class="text-cyan-400">✓</span> Cap. IV: Casos Clínicos y Dosificación</div>
            </div>
          </div>
        </div>

        <!-- Footer Pricing & CTAs -->
        <div class="pt-2 border-t border-slate-800 space-y-2">
          <div class="flex items-baseline justify-between">
            <span class="text-[10px] font-mono text-slate-400 uppercase">Inversión:</span>
            <span class="text-xl font-black text-cyan-300 font-mono">S/ {{ selectedBook.price || 50 }}</span>
          </div>

          <div class="flex items-center gap-2">
            <a
              [href]="getWhatsAppLink(selectedBook)"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20 transition-all">
              <span class="material-symbols-outlined text-sm">chat</span>
              <span>Comprar WhatsApp</span>
            </a>
            <button
              type="button"
              (click)="openBook(selectedIndex!)"
              class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
              title="Abrir ficha completa en modal">
              <span class="material-symbols-outlined text-sm block">open_in_new</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .stage-canvas-wrapper {
      touch-action: pan-y;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.25s ease forwards;
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(35px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in-right {
      animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class NewsletterBookshelfComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stageRef') stageRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tooltipRef') tooltipRef!: ElementRef<HTMLDivElement>;

  @Input() items: NewsletterBookshelfItem[] = DEFAULT_LMS_BOOKS;
  @Input() height: number = 600;
  @Input() brand: string = 'Plataforma LMS · EDICIONES';

  @Output() selectBook = new EventEmitter<{ item: NewsletterBookshelfItem; index: number }>();
  @Output() viewDetails = new EventEmitter<{ item: NewsletterBookshelfItem; index: number }>();

  books: BookLayout[] = [];
  hoveredIndex: number | null = null;
  selectedIndex: number | null = null;
  currentIndex = 0;

  get selectedBook(): BookLayout | null {
    return this.selectedIndex !== null && this.books[this.selectedIndex] ? this.books[this.selectedIndex] : null;
  }

  get hoveredBook(): BookLayout | null {
    return this.hoveredIndex !== null && this.books[this.hoveredIndex] ? this.books[this.hoveredIndex] : null;
  }

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2(-1000, -1000);
  private bookObjects: BookMeshObject[] = [];

  private cameraX = { current: 0 };
  private orbit = { yaw: 0, pitch: 0 };
  private animFrameId?: number;
  private resizeObserver?: ResizeObserver;
  private lastTime = performance.now();

  private gesture: {
    mode: 'pending' | 'drag' | 'orbit';
    x: number;
    y: number;
    startX: number;
    startedAt: number;
  } | null = null;

  private suppressClick = false;
  private switchTimer: any = null;
  private pendingSelection: number | null = null;
  private reducedMotion = false;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.books = this.deriveLayout(this.items.length ? this.items : DEFAULT_LMS_BOOKS);
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initThree();
      this.startLoop();
    });

    if (typeof window !== 'undefined') {
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = motion.matches;
      motion.addEventListener?.('change', (e) => (this.reducedMotion = e.matches));
    }
  }

  ngOnDestroy(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.switchTimer) clearTimeout(this.switchTimer);
    this.resizeObserver?.disconnect();

    this.bookObjects.forEach((b) => {
      b.bodyMesh.geometry.dispose();
      b.coverMesh.geometry.dispose();
      Object.values(b.textures).forEach((t) => t?.dispose());
    });

    this.renderer?.dispose();
  }

  private deriveLayout(items: NewsletterBookshelfItem[]): BookLayout[] {
    let cursor = 0;
    return items.map<BookLayout>((item) => {
      const random = seeded(hash(item.id));
      const fallbackColor = PALETTE[Math.floor(random() * PALETTE.length)]!;
      const width = 0.34 + random() * 0.28;
      const bookHeight = 3.65 + (random() * 2 - 1) * 0.22;
      const color = item.color ?? fallbackColor;
      const foil = item.foil ?? (luminance(color) < 0.5 ? '#f2ead8' : '#ffffff');
      if (random() < 0.14) cursor += 0.2;
      const x = cursor + width / 2;
      cursor += width + 0.07;
      return {
        ...item,
        x,
        width,
        bookHeight,
        depth: bookHeight * 0.67,
        motif: Math.floor(random() * 8),
        color,
        foil
      };
    });
  }

  private getBounds() {
    const last = this.books.at(-1)?.x ?? 0;
    const stageWidth = this.stageRef?.nativeElement?.clientWidth || 1000;
    const aspect = stageWidth / Math.max(420, this.height);
    const visibleSpan = 2 * 11.5 * Math.tan((35 * Math.PI) / 360) * aspect;
    const inset = visibleSpan * 0.31;
    const min = Math.min(last / 2, (this.books[0]?.x ?? 0) + inset);
    const max = Math.max(last / 2, last - inset);
    return max <= min ? { min: last / 2, max: last / 2, visibleSpan } : { min, max, visibleSpan };
  }

  private moveCamera(next: number) {
    const bounds = this.getBounds();
    this.cameraX.current = THREE.MathUtils.clamp(next, bounds.min, bounds.max);
    this.currentIndex = this.nearestBook(this.cameraX.current);
  }

  private nearestBook(x: number): number {
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    this.books.forEach((book, index) => {
      const next = Math.abs(book.x - x);
      if (next < distance) {
        nearest = index;
        distance = next;
      }
    });
    return nearest;
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = this.stageRef.nativeElement.clientWidth || 1000;
    const height = this.height || 600;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 60);

    const bounds = this.getBounds();
    this.cameraX.current = bounds.min;
    this.camera.position.set(this.cameraX.current, 2.45, 11.5);
    this.camera.lookAt(this.cameraX.current, 1.85, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.9);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd0dae8, 1.5);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(5, 8, 7);
    this.scene.add(dirLight);

    const dirLightBack = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLightBack.position.set(-6, 4, -7);
    this.scene.add(dirLightBack);

    const topLight = new THREE.DirectionalLight(0xffffff, 1.0);
    topLight.position.set(0, 10, 0);
    this.scene.add(topLight);

    // Build 3D Books with Hinged Cover Structure
    this.books.forEach((book, index) => {
      const group = new THREE.Group();
      group.position.set(book.x, book.bookHeight / 2, 0);

      const textures = {
        cover: coverTexture(book, this.brand, 'cover'),
        spine: coverTexture(book, this.brand, 'spine'),
        back: coverTexture(book, this.brand, 'back'),
        insideCover: insideCoverTexture(book, this.brand),
        innerPage: innerPageTexture(book, this.brand),
        paper: paperTexture(book)
      };

      const coverThickness = 0.038;
      const bodyWidth = Math.max(0.08, book.width - coverThickness);

      // Body Geometry: block of pages + back cover + spine + inner page
      const bodyGeometry = new RoundedBoxGeometry(
        bodyWidth,
        book.bookHeight,
        book.depth,
        2,
        0.006
      );

      const bodyMaterials: THREE.Material[] = [
        new THREE.MeshStandardMaterial({
          map: textures.innerPage ?? undefined,
          roughness: 0.92,
          bumpMap: textures.innerPage ?? undefined,
          bumpScale: 0.005
        }), // +X: First inner page revealed when cover opens!
        new THREE.MeshStandardMaterial({
          map: textures.back ?? undefined,
          color: textures.back ? 0xffffff : book.color,
          roughness: 0.8,
          metalness: 0.015,
          bumpMap: textures.back ?? undefined,
          bumpScale: 0.007
        }), // -X: Back Cover
        new THREE.MeshStandardMaterial({
          map: textures.paper ?? undefined,
          color: textures.paper ? 0xf1eadc : 0xe9e4d8,
          roughness: 0.93,
          bumpMap: textures.paper ?? undefined,
          bumpScale: 0.008
        }), // +Y: Top Paper
        new THREE.MeshStandardMaterial({
          map: textures.paper ?? undefined,
          color: textures.paper ? 0xece3d3 : 0xddd7ca,
          roughness: 0.96,
          bumpMap: textures.paper ?? undefined,
          bumpScale: 0.006
        }), // -Y: Bottom Paper
        new THREE.MeshStandardMaterial({
          map: textures.spine ?? undefined,
          color: textures.spine ? 0xffffff : book.color,
          roughness: 0.8,
          metalness: 0.015,
          bumpMap: textures.spine ?? undefined,
          bumpScale: 0.007
        }), // +Z: Spine
        new THREE.MeshStandardMaterial({
          map: textures.paper ?? undefined,
          color: textures.paper ? 0xf3eadc : 0xe6e0d4,
          roughness: 0.94,
          bumpMap: textures.paper ?? undefined,
          bumpScale: 0.007
        }) // -Z: Fore-edge Paper
      ];

      const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterials);
      bodyMesh.position.set(-coverThickness / 2, 0, 0);
      bodyMesh.userData = { bookIndex: index };
      group.add(bodyMesh);

      // Hinged Front Cover Pivot Group (pivot on spine edge: X = +book.width/2 - coverThickness/2, Z = +book.depth/2)
      const coverPivotGroup = new THREE.Group();
      coverPivotGroup.position.set(book.width / 2 - coverThickness / 2, 0, book.depth / 2);

      const coverGeometry = new RoundedBoxGeometry(
        coverThickness,
        book.bookHeight,
        book.depth,
        2,
        0.006
      );

      const coverEdgeColor = book.customTextures ? '#00274e' : book.color;
      const clothMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(coverEdgeColor),
        roughness: 0.5,
        metalness: 0.05
      });

      const coverMaterials: THREE.Material[] = [
        new THREE.MeshStandardMaterial({
          map: textures.cover ?? undefined,
          color: textures.cover ? 0xffffff : book.color,
          roughness: 0.8,
          metalness: 0.015,
          bumpMap: textures.cover ?? undefined,
          bumpScale: 0.007
        }), // +X: Front Cover Outside
        new THREE.MeshStandardMaterial({
          map: textures.insideCover ?? undefined,
          roughness: 0.82,
          bumpMap: textures.insideCover ?? undefined,
          bumpScale: 0.006
        }), // -X: Inside Cover Flap
        clothMat, // +Y
        clothMat, // -Y
        clothMat, // +Z
        clothMat  // -Z
      ];

      const coverMesh = new THREE.Mesh(coverGeometry, coverMaterials);
      coverMesh.position.set(0, 0, -book.depth / 2);
      coverMesh.userData = { bookIndex: index };
      coverPivotGroup.add(coverMesh);
      group.add(coverPivotGroup);

      this.scene!.add(group);

      this.bookObjects.push({
        group,
        bodyMesh,
        coverPivotGroup,
        coverMesh,
        book,
        index,
        textures,
        focusFlight: null,
        exitFlight: null,
        selectedAt: 0,
        wasSelected: false
      });
    });

    // Resize observer
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry || !this.renderer || !this.camera) return;
      const w = entry.contentRect.width;
      const h = this.height;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
    this.resizeObserver.observe(this.stageRef.nativeElement);
  }

  private startLoop(): void {
    const loop = (time: number) => {
      const delta = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      this.updatePhysics(delta);

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private updatePhysics(delta: number): void {
    if (!this.camera) return;

    // Smooth camera pan
    this.camera.position.x = damp(this.camera.position.x, this.cameraX.current, 8, delta);
    this.camera.lookAt(this.camera.position.x, 1.85, 0);

    // Update each book object
    const now = performance.now();
    this.bookObjects.forEach((obj) => {
      const isSelected = this.selectedIndex === obj.index;
      const isHovered = this.hoveredIndex === obj.index && this.selectedIndex === null;

      // Detect transition to selected/unselected
      if (isSelected && !obj.wasSelected) {
        obj.selectedAt = now;
        obj.focusFlight = {
          startedAt: now,
          position: obj.group.position.clone(),
          rotation: obj.group.rotation.clone(),
          scale: obj.group.scale.x
        };
        obj.exitFlight = null;
      } else if (!isSelected && obj.wasSelected) {
        obj.exitFlight = {
          startedAt: now,
          position: obj.group.position.clone(),
          rotation: obj.group.rotation.clone(),
          scale: obj.group.scale.x
        };
        obj.focusFlight = null;
      }
      obj.wasSelected = isSelected;

      // Cover opening rotation
      const isCoverOpenTarget = (isSelected && this.isCoverOpen);
      const targetCoverAngle = isCoverOpenTarget ? -Math.PI * 0.76 : 0;
      obj.coverPivotGroup.rotation.y = damp(obj.coverPivotGroup.rotation.y, targetCoverAngle, 8, delta);

      const motion = this.reducedMotion ? 1000 : isSelected ? 7 : 11;
      const selectedFor = (now - obj.selectedAt) / 1000;
      const autoYaw = isSelected && !this.reducedMotion && !this.isCoverOpen ? Math.sin(selectedFor * 0.85) * 0.28 : 0;
      const autoPitch = isSelected && !this.reducedMotion ? Math.sin(selectedFor * 0.55) * 0.04 : 0;

      let targetX = obj.book.x;
      let targetY = obj.book.bookHeight / 2 + (isHovered ? 0.25 : 0);
      let targetZ = isHovered ? 0.22 : 0;
      let targetScale = 1;

      if (isSelected) {
        const openShift = this.isCoverOpen ? -1.15 : 0;
        targetX = this.cameraX.current + openShift;
        targetY = 1.95;
        targetZ = this.isCoverOpen ? 2.55 : 2.4; // Well clear of shelf, beautifully framed with zoom out
        targetScale = this.isCoverOpen ? 0.88 : 0.92;
      } else if (this.selectedIndex !== null) {
        // Part neighboring books away from the inspected book
        const offset = obj.index < this.selectedIndex ? (this.isCoverOpen ? -1.45 : -1.1) : (this.isCoverOpen ? 1.45 : 1.1);
        targetX = obj.book.x + offset;
        targetScale = 0.88;
        targetZ = 0;
      }

      obj.bodyMesh.renderOrder = isSelected ? 100 : 0;
      obj.coverMesh.renderOrder = isSelected ? 101 : 1;

      const targetRotationY = isSelected ? -Math.PI / 2 + this.orbit.yaw + autoYaw : 0;
      const targetRotationX = isSelected ? this.orbit.pitch + autoPitch : 0;

      if (isSelected && obj.focusFlight) {
        const flight = obj.focusFlight;
        const progress = this.reducedMotion ? 1 : Math.min(1, (now - flight.startedAt) / BOOK_ENTER_DURATION);
        const depthProgress = easeSmoothOut(progress);
        const travelProgress = easeSmoothOut(THREE.MathUtils.clamp((progress - 0.06) / 0.94, 0, 1));
        const turnProgress = easeInOutCubic(progress);
        const depthArc = Math.sin(Math.PI * progress) * 0.12;

        obj.group.position.set(
          THREE.MathUtils.lerp(flight.position.x, targetX, travelProgress),
          THREE.MathUtils.lerp(flight.position.y, targetY, travelProgress),
          THREE.MathUtils.lerp(flight.position.z, targetZ, depthProgress) + depthArc
        );
        obj.group.rotation.x = THREE.MathUtils.lerp(flight.rotation.x, targetRotationX, turnProgress);
        obj.group.rotation.y = THREE.MathUtils.lerp(flight.rotation.y, targetRotationY, turnProgress);
        obj.group.rotation.z = THREE.MathUtils.lerp(flight.rotation.z, 0, turnProgress);
        const scale = THREE.MathUtils.lerp(flight.scale, targetScale, turnProgress);
        obj.group.scale.setScalar(scale);

        if (progress >= 1) obj.focusFlight = null;
      } else if (!isSelected && obj.exitFlight) {
        const exit = obj.exitFlight;
        const progress = this.reducedMotion ? 1 : Math.min(1, (now - exit.startedAt) / BOOK_EXIT_DURATION);
        const alignProgress = easeSmoothOut(progress);
        const slotProgress = easeSmoothOut(THREE.MathUtils.clamp((progress - 0.3) / 0.7, 0, 1));

        obj.group.position.set(
          THREE.MathUtils.lerp(exit.position.x, obj.book.x, alignProgress),
          THREE.MathUtils.lerp(exit.position.y, obj.book.bookHeight / 2, alignProgress),
          THREE.MathUtils.lerp(exit.position.z, 0, slotProgress)
        );
        obj.group.rotation.x = THREE.MathUtils.lerp(exit.rotation.x, 0, alignProgress);
        obj.group.rotation.y = THREE.MathUtils.lerp(exit.rotation.y, 0, alignProgress);
        obj.group.rotation.z = THREE.MathUtils.lerp(exit.rotation.z, 0, alignProgress);
        const scale = THREE.MathUtils.lerp(exit.scale, 1, alignProgress);
        obj.group.scale.setScalar(scale);

        if (progress >= 1) obj.exitFlight = null;
      } else {
        obj.group.position.x = damp(obj.group.position.x, targetX, motion, delta);
        obj.group.position.y = damp(obj.group.position.y, targetY, motion, delta);
        obj.group.position.z = damp(obj.group.position.z, targetZ, motion, delta);
        obj.group.rotation.x = damp(obj.group.rotation.x, targetRotationX, motion, delta);
        obj.group.rotation.y = damp(obj.group.rotation.y, targetRotationY, motion, delta);
        obj.group.rotation.z = damp(obj.group.rotation.z, 0, motion, delta);
        const scale = damp(obj.group.scale.x, targetScale, motion, delta);
        obj.group.scale.setScalar(scale);
      }
    });
  }

  // Pointer & Raycasting Events
  onPointerDown(event: PointerEvent): void {
    const stage = this.stageRef.nativeElement;
    stage.setPointerCapture(event.pointerId);

    this.gesture = {
      mode: 'pending',
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startedAt: performance.now()
    };
    this.suppressClick = false;
  }

  onPointerMove(event: PointerEvent): void {
    const stage = this.stageRef.nativeElement;
    const rect = stage.getBoundingClientRect();

    // Position tooltip
    if (this.tooltipRef?.nativeElement) {
      this.tooltipRef.nativeElement.style.left = `${event.clientX - rect.left}px`;
      this.tooltipRef.nativeElement.style.top = `${event.clientY - rect.top}px`;
    }

    const active = this.gesture;
    if (active) {
      const dx = event.clientX - active.x;
      const dy = event.clientY - active.y;

      if (active.mode === 'pending') {
        if (Math.hypot(event.clientX - active.startX, event.clientY - active.y) > 6) {
          active.mode = this.selectedIndex !== null ? 'orbit' : 'drag';
          this.suppressClick = true;
        }
      }

      if (active.mode === 'orbit') {
        this.orbit.yaw += dx * 0.012;
        this.orbit.pitch = THREE.MathUtils.clamp(this.orbit.pitch + dy * 0.008, -Math.PI / 2.3, Math.PI / 2.3);
      } else if (active.mode === 'drag') {
        this.moveCamera(this.cameraX.current - dx * 0.0085);
      }

      active.x = event.clientX;
      active.y = event.clientY;
      return;
    }

    // Raycast for hover
    if (this.camera && this.renderer) {
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const meshes = this.bookObjects.flatMap((b) => [b.bodyMesh, b.coverMesh]);
      const intersects = this.raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0 && this.selectedIndex === null) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const index = hitMesh.userData['bookIndex'];
        this.setHoveredIndex(index);
        stage.style.cursor = 'pointer';
      } else {
        this.setHoveredIndex(null);
        stage.style.cursor = 'grab';
      }
    }
  }

  onPointerUp(event: PointerEvent): void {
    const stage = this.stageRef.nativeElement;
    if (stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }

    const wasDragging = this.suppressClick;
    this.gesture = null;

    window.requestAnimationFrame(() => {
      this.suppressClick = false;
    });

    if (!wasDragging) {
      // Check raycast click on book
      const rect = stage.getBoundingClientRect();
      if (this.camera) {
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const meshes = this.bookObjects.flatMap((b) => [b.bodyMesh, b.coverMesh]);
        const intersects = this.raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          const index = hitMesh.userData['bookIndex'];
          this.selectBookIndex(index);
        } else if (this.selectedIndex !== null) {
          this.closeInspection();
        }
      }
    }
  }

  onPointerLeave(): void {
    this.gesture = null;
    this.setHoveredIndex(null);
  }

  onWheel(event: WheelEvent): void {
    if (this.selectedIndex !== null) return;
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    if (horizontal || event.shiftKey) {
      event.preventDefault();
      this.moveCamera(this.cameraX.current + (horizontal ? event.deltaX : event.deltaY) * 0.012);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.selectedIndex !== null) {
      event.preventDefault();
      this.closeInspection();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (this.selectedIndex !== null) this.switchFocused(1);
      else this.panCamera(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (this.selectedIndex !== null) this.switchFocused(-1);
      else this.panCamera(-1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (this.selectedIndex === null) this.selectBookIndex(this.currentIndex);
      else this.toggleCover();
    }
  }

  private setHoveredIndex(index: number | null): void {
    if (this.hoveredIndex !== index) {
      this.hoveredIndex = index;
      this.cdr.markForCheck();
    }
  }

  isCoverOpen = false;

  toggleCover(): void {
    if (this.selectedIndex === null) return;
    this.isCoverOpen = !this.isCoverOpen;
    this.cdr.markForCheck();
  }

  getWhatsAppLink(book: BookLayout | null): string {
    if (!book) return 'https://wa.me/51939371250';
    const text = `Hola Plataforma LMS, deseo adquirir el libro digital "${book.title}" (S/ ${book.price || 50}).`;
    return `https://wa.me/51939371250?text=${encodeURIComponent(text)}`;
  }

  selectBookIndex(index: number): void {
    if (this.selectedIndex === index) {
      // Already selected in 3D, keep rotating smoothly without opening modal
      return;
    }

    if (this.selectedIndex !== null) {
      this.pendingSelection = index;
      this.moveCamera(this.books[index].x);
      this.setHoveredIndex(null);
      this.selectedIndex = null;
      this.isCoverOpen = false;
      this.orbit = { yaw: 0, pitch: 0 };
      if (this.switchTimer !== null) clearTimeout(this.switchTimer);
      this.switchTimer = setTimeout(() => {
        const next = this.pendingSelection;
        this.pendingSelection = null;
        this.switchTimer = null;
        if (next !== null) this.presentBook(next);
      }, this.reducedMotion ? 0 : BOOK_EXIT_DURATION);
      this.cdr.markForCheck();
      return;
    }

    if (this.switchTimer !== null) {
      this.pendingSelection = index;
      return;
    }

    this.presentBook(index);
  }

  presentBook(index: number): void {
    this.moveCamera(this.books[index].x);
    this.orbit = { yaw: 0, pitch: 0 };
    this.setHoveredIndex(null);
    this.selectedIndex = index;
    this.isCoverOpen = false;
    this.selectBook.emit({ item: this.books[index], index });
    this.cdr.markForCheck();
  }

  openBook(index: number): void {
    const book = this.books[index];
    if (!book) return;
    this.viewDetails.emit({ item: book, index });
  }

  closeInspection(): void {
    this.selectedIndex = null;
    this.isCoverOpen = false;
    this.orbit = { yaw: 0, pitch: 0 };
    this.cdr.markForCheck();
  }

  switchFocused(direction: number): void {
    if (this.selectedIndex === null) return;
    const next = THREE.MathUtils.clamp(this.selectedIndex + direction, 0, this.books.length - 1);
    if (next !== this.selectedIndex) {
      this.selectBookIndex(next);
    }
  }

  readonly Math = Math;

  rotateSelected(deltaAngle: number): void {
    if (this.selectedIndex === null) return;
    this.orbit.yaw += deltaAngle;
    this.cdr.markForCheck();
  }

  panCamera(dir: number): void {
    const bounds = this.getBounds();
    this.moveCamera(this.cameraX.current + dir * bounds.visibleSpan * 0.25);
  }
}
