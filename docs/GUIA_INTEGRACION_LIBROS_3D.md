# 📚 Guía Oficial: Integración de Libros 3D y Catálogo Editorial en INSTEIP

Esta guía documenta el estándar y procedimiento técnico para incorporar nuevos libros en la subpágina **`/libros`** de INSTEIP, logrando el mismo acabado fotorrealista 3D (Three.js WebGL) y galería interactiva en el catálogo que se implementó para el libro de **Acupuntura Estética Facial**.

---

## 1. 📁 Estructura y Formato de las Fotografías / Renders

Cada libro debe contar con su propia carpeta dentro de:
`frontend/src/assets/<nombre_carpeta_libro>/`

Se recomienda proveer **4 imágenes en alta resolución**:

| Archivo | Orientación / Aspect Ratio | Resolución Recomendada | Descripción y Uso |
| :--- | :--- | :--- | :--- |
| **`1.png`** | Vertical (~2:3) | `1024 × 1536 px` | **Portada Principal (Front Cover)**.<br>Usada en tarjetas del catálogo, modal de detalles y visor 2D. |
| **`2.png`** | Vertical (~2:3) | `1024 × 1536 px` | **Contraportada & Sinopsis (Back Cover)**.<br>Usada en la galería del modal y ficha técnica. |
| **`3.png`** | Horizontal (~3:2) | `1536 × 1024 px` | **Interior Abierto (Inside Spread)**.<br>Lado izquierdo: Guarda interior / solapa.<br>Lado derecho: Primera página con grabados / texto. |
| **`4.png`** | Horizontal (~3:2) | `1536 × 1024 px` | **Sobrecubierta Completa Desplegada (Full Jacket)**.<br>Izquierda: Contratapa · Centro: Lomo · Derecha: Portada. |

---

## 2. 🧮 Cálculo de Coordenadas de Recorte (`cropRatio`)

Para proyectar la imagen plana `4.png` sobre el libro 3D sin franjas oscuras ni distorsiones, se calculan las coordenadas normalizadas $[0, 1]$:

$$\text{cropRatio} = \{ \text{sx}, \text{sy}, \text{sw}, \text{sh} \}$$

Donde:
- `sx` = $X_{\text{inicio}} / \text{ancho\_total}$
- `sy` = $Y_{\text{inicio}} / \text{alto\_total}$
- `sw` = $\text{ancho\_recorte} / \text{ancho\_total}$
- `sh` = $\text{alto\_recorte} / \text{alto\_total}$

### 🔍 Script Automatizado para Obtener Coordenadas Exactas

Puedes ejecutar este script en la terminal para analizar cualquier nuevo set de imágenes y obtener los ratios listos para copiar y pegar:

```python
from PIL import Image
import numpy as np

# Ruta a la sobrecubierta completa (4.png)
img_path = r"frontend/src/assets/<nombre_carpeta>/4.png"
im = Image.open(img_path)
w, h = im.size
arr = np.array(im)

# Encontrar límites donde el color sea 100% sólido (sin sombras difusas en bordes)
# Ejemplo de rangos típicos para lienzo de 1536x1024:
# Tapa Frontal (Derecha): X ~ 840 a 1445 | Y ~ 55 a 965
# Contratapa (Izquierda): X ~ 90 a 695   | Y ~ 55 a 965
# Lomo (Centro):         X ~ 720 a 816   | Y ~ 55 a 965

print(f"Dimensiones de imagen: {w} x {h}")
print("Ratios listos para Three.js:")
print(f"Front Cover: {{ sx: {840/w:.5f}, sy: {55/h:.5f}, sw: {605/w:.5f}, sh: {910/h:.5f} }}")
print(f"Back Cover:  {{ sx: {90/w:.5f}, sy: {55/h:.5f}, sw: {605/w:.5f}, sh: {910/h:.5f} }}")
print(f"Spine:       {{ sx: {720/w:.5f}, sy: {55/h:.5f}, sw: {96/w:.5f}, sh: {910/h:.5f} }}")
```

---

## 3. 🛠️ Paso a Paso para la Integración en el Código

### Paso A: Registrar el Libro en la Estantería 3D
Archivo: `frontend/src/app/shared/components/newsletter-bookshelf/newsletter-bookshelf.component.ts`

1. **Añadir el elemento en `DEFAULT_INSTEIP_BOOKS`:**
```typescript
{
  id: 'ed-nuevo-libro',
  title: 'Título del Libro',
  date: 'EDICIÓN 2026',
  subtitle: 'Descripción breve para el archivador 3D.',
  author: 'Cuerpo Docente INSTEIP',
  price: 55,
  category: 'Acupuntura & MTC',
  color: '#002244', // Color base del lomo/cubierta (hex)
  foil: '#dfb76c',  // Color del relieve pan de oro o plata
  customTextures: {
    spread: 'assets/<nombre_carpeta>/4.png',
    insideSpread: 'assets/<nombre_carpeta>/3.png'
  }
}
```

2. **Verificar que `createCroppedTexture` utilice el color base:**
   - La función en el componente llena el fondo del Canvas con `bgColor = '#00274e'` para garantizar que los biseles de los bordes 3D nunca muestren líneas negras.

---

### Paso B: Registrar el Libro en el Catálogo y Modal
Archivo: `frontend/src/app/features/libros/libros.component.ts`

1. **Añadir el libro al arreglo `readonly libros: LibroItem[]`:**
```typescript
{
  id: 'slug-del-libro',
  titulo: 'Título Completo del Libro',
  subtitulo: 'Subtítulo descriptivo y enfoque clínico.',
  autor: 'Nombre del Autor o Área Docente INSTEIP',
  categoria: 'Acupuntura & MTC',
  categoriaSlug: 'acupuntura',
  precioSoles: 55,
  paginas: 210,
  anio: 'Edición 2026',
  formato: 'PDF Digital HD + Fichas Clínicas',
  portada: 'assets/<nombre_carpeta>/1.png',
  galeria: [
    {
      url: 'assets/<nombre_carpeta>/1.png',
      label: 'Portada Principal',
      descripcion: 'Encuadernación de lujo con estampado en oro y grabado botánico.'
    },
    {
      url: 'assets/<nombre_carpeta>/2.png',
      label: 'Contraportada & Sinopsis',
      descripcion: 'Resumen clínico, código de barras ISBN y sello oficial editorial INSTEIP.'
    },
    {
      url: 'assets/<nombre_carpeta>/3.png',
      label: 'Páginas Interiores',
      descripcion: 'Diseño interior en papel apergaminado y diagramas anatómicos.'
    },
    {
      url: 'assets/<nombre_carpeta>/4.png',
      label: 'Sobrecubierta Completa',
      descripcion: 'Despliegue integral de cubierta frontal, lomo dorado y contracubierta.'
    }
  ],
  destacado: true,
  nuevo: true,
  bestseller: true,
  resumen: 'Sinopsis completa del libro y enfoque terapéutico para los alumnos y terapeutas...',
  capitulos: [
    'Capítulo I: Fundamentos y Bases Teóricas',
    'Capítulo II: Cartografía y Topografía Anatómica',
    'Capítulo III: Protocolos Terapéuticos y Fichas de Consulta',
    'Capítulo IV: Casos Clínicos y Recomendaciones Terapéuticas'
  ],
  etiquetas: ['Acupuntura', 'MTC', 'Guía Clínica'],
  cursoRelacionado: {
    nombre: 'Nombre del Curso Relacionado',
    ruta: '/cursos/ruta-del-curso'
  }
}
```

---

## 4. 🎨 Mecánica de Renderizado 3D (Three.js)

El libro 3D utiliza la siguiente cinemática y mapeo de materiales:

```
                  ┌───────────────────────────────┐
                  │   Rotación 3D en Bookshelf    │
                  └──────────────┬────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
  bodyMesh (Geometría)                            coverMesh (Tapa Móvil)
  • +X: Primera página interior (3.png derecha)   • +X: Portada frontal (4.png derecha)
  • -X: Contracubierta (4.png izquierda)          • -X: Guarda interior (3.png izquierda)
  • +Z: Lomo (4.png centro)                       • Cantos (+Y, -Y, ±Z): Color tela sólido
  • +Y/-Y/-Z: Papel envejecido con relieve
```

---

## 5. 💡 Checklist de Calidad para Nuevos Libros

- [ ] Las imágenes están en formato `.png` en alta resolución.
- [ ] No hay márgenes transparentes superiores que causen franjas negras (`sy` comienza dentro del área azul/color base).
- [ ] La tapa delantera abre y revela la textura del interior (`3.png`).
- [ ] Al hacer clic en el libro 3D, se abre el modal con la galería de 4 vistas HD.
- [ ] Los enlaces a WhatsApp generan el mensaje con el título y precio correspondiente.
- [ ] La compilación `npm run build` en el frontend finaliza con **cero errores**.
