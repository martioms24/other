# Birthday App 🎂

App web d'aniversari amb quiz interactiu, detecció de buf i confeti.

## Estructura de rutes

| Ruta | Descripció |
|------|-----------|
| `/` | Pàgina de login (contrasenya: `28042004`) |
| `/birthday` | Pastís animat amb espelmes i detecció de buf |
| `/quiz` | Quiz de 10 preguntes |
| `/contract` | Visualitzador del contracte PDF |

---

## Instal·lació i execució local

### Prerequisits
- Node.js 18+ — [nodejs.org](https://nodejs.org)
- npm o pnpm

### Passos

```bash
# 1. Entrar al directori
cd birthday-app

# 2. Instal·lar dependències
npm install

# 3. Executar en mode desenvolupament
npm run dev
```

Obre [http://localhost:3000](http://localhost:3000) al navegador.

### Build de producció

```bash
npm run build
npm start
```

---

## Afegir les imatges (important)

Substitueix els SVG de `/public` per imatges reals si vols:

| Fitxer | Descripció |
|--------|-----------|
| `public/amic.jpeg` | ✅ Ja existeix |
| `public/food-hamburger.svg` | Foto d'una hamburguesa |
| `public/food-pizza.svg` | Foto d'una pizza |
| `public/food-risotto.svg` | Foto d'un risotto |
| `public/food-em-fa-pal.svg` | Imatge divertida |
| `public/artist-jackharlow.svg` | Foto/portada de Jack Harlow |
| `public/artist-relsb.svg` | Foto/portada de Rels B |
| `public/artist-badbunny.svg` | Foto/portada de Bad Bunny |
| `public/artist-mushka.svg` | Foto/portada de Mushka |
| `public/dessert-cheesecake.svg` | Foto d'un pastís de formatge |
| `public/dessert-gelat.svg` | Foto d'un gelat |
| `public/dessert-sacher.svg` | Foto d'un pastís Sacher |
| `public/dessert-coulant.svg` | Foto d'un coulant |
| `public/contract.pdf` | ⚠️ **Cal afegir-lo manualment** |

> **Nota:** Per substituir les imatges, simplement copia el fitxer a `/public` amb el mateix nom (pots usar `.jpg`, `.png` o `.webp` i actualitzar les extensions al codi del quiz a `src/app/quiz/page.tsx`).

---

## Desplegar a Vercel (gratuït)

### Opció 1: Interfície web de Vercel

1. Puja el codi a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create birthday-app --public --push
   ```

2. Ves a [vercel.com](https://vercel.com) → "Add New Project"
3. Importa el repositori de GitHub
4. Vercel detecta Next.js automàticament
5. Fes clic a **Deploy**
6. La URL es genera en ~1 minut

### Opció 2: Vercel CLI

```bash
# Instal·lar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Desplegar a producció
vercel --prod
```

---

## Funcionalitats

### Login
- Contrasenya: `28012024`
- Pista: *El dia que ens vam conèixer per primer cop*

### Pastís d'aniversari
- Pastís de coco amb gelat renderitzat en CSS pur
- 6 espelmes amb animació de flama
- Detecció de buf via **Web Audio API** (micròfon)
- Confeti quan s'apaguen les espelmes
- Redirecció automàtica al quiz

### Quiz (10 preguntes)
1. Data d'aniversari (text)
2. Nom dels gats (opció múltiple)
3. Nom de l'amic (opció múltiple amb imatge)
4. Primer dia que vau quedar (text lliure)
5. Menjar preferit (targetes amb imatge) ← **imatges necessàries**
6. Artista Spotify (targetes amb imatge) ← **imatges necessàries**
7. Noms d'Erasmus (selecció múltiple de 14 noms)
8. Postres preferit (targetes amb imatge) ← **imatges necessàries**
9. Vestimenta graduació (text lliure)
10. Ordenar amics (drag & drop + botons ↑↓)

**Resposta correcta → mostra la contrasenya: `3426`**

### Contracte secret
- Ruta `/contract`
- Mostra `/public/contract.pdf` encastat a la pàgina
- Botó de descàrrega

---

## Notes tècniques

- **Framework:** Next.js 14 (App Router)
- **Estils:** Tailwind CSS + CSS custom
- **Confeti:** `canvas-confetti`
- **Detecció de buf:** Web Audio API (`getUserMedia` + `AnalyserNode`)
- **Drag & drop:** HTML5 natiu + botons ↑↓ (mobile-friendly)
- **Imatges:** `next/image` amb `fill` per a les targetes
- **Sense base de dades** — tot és client-side
