# Deploy a Vercel — Mapa de Consultoría Notion

Este zip contiene **todo** lo necesario para que el sitio funcione idéntico al preview:

```
index.html              ← página principal
vercel.json             ← cache headers para fuentes e imágenes
photo-circle.png        ← tu retrato (200×200 en el hero)
fonts/                  ← 4 TTF variable fonts locales
  Montserrat-VariableFont_wght.ttf
  Montserrat-Italic-VariableFont_wght.ttf
  Inter-VariableFont_opsz_wght.ttf
  Inter-Italic-VariableFont_opsz_wght.ttf
```

## 🚀 3 formas de deployar

### Opción 1 — Drag & drop (más fácil)
1. Ve a https://vercel.com/new
2. Arrastra **la carpeta entera** descomprimida sobre la zona de drop
3. Vercel detecta que es un sitio estático y te da una URL inmediata
4. Si ya tienes `mapa-consultoria-notion.vercel.app`, en el proyecto existente: **Settings → General → Override** o simplemente sustituye los archivos con un nuevo deploy en Production.

### Opción 2 — Vercel CLI
```bash
cd deploy/
npx vercel --prod
```

### Opción 3 — GitHub
1. Sube esta carpeta a un repo de GitHub
2. En Vercel → Import project → selecciona el repo
3. Cada push redespliega automático

## ⚠️ Errores comunes que matan la foto/fuentes

| Síntoma | Causa | Fix |
|---|---|---|
| Foto rota (icono roto) | Subiste solo `index.html` | Sube **toda la carpeta**, no solo el HTML |
| Texto sin tipografía | Falta la carpeta `fonts/` | Verifica que `fonts/` esté en la raíz del deploy |
| Fuentes desde CDN (warning) | Algún navegador cacheó la versión vieja | Hard refresh (Cmd/Ctrl+Shift+R) o deploy con cache cleared |

## 🌐 Para usar tu dominio actual

Si ya tienes el proyecto Vercel funcionando en `mapa-consultoria-notion.vercel.app`:

1. Abre el proyecto en Vercel
2. **Deployments** → arrastra esta carpeta sobre la zona de "Drag & drop"
3. Marca "Production" y deploy
4. Tu URL existente apunta automáticamente al nuevo deploy
