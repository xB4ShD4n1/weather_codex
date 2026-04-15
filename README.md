# Weather Codex (Angular 20 + Ionic 8 + Capacitor)

Aplicación base para mostrar el tiempo de **Lugones (Asturias)** usando **Open-Meteo** (sin API key).

## Requisitos

- Node.js 22 (recomendado)
- Angular CLI 20

## Puesta en marcha

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Ejecuta en desarrollo:
   ```bash
   npm run start
   ```

## Fuente de datos (gratis)

Se usa `https://api.open-meteo.com/v1/forecast` con:
- Coordenadas de Lugones: `43.4021, -5.8129`
- Tiempo actual: temperatura, humedad, sensación térmica, código de estado y viento
- Próximas horas: temperatura por hora

## Despliegue en GitHub Pages

Sí, ahora queda preparado para desplegar automáticamente en GitHub Pages con GitHub Actions.

1. Sube este repo a GitHub y usa la rama `main`.
2. En **Settings → Pages**, selecciona **Source: GitHub Actions**.
3. Haz push a `main`.
4. El workflow `.github/workflows/deploy-pages.yml` compila y publica en Pages.

La URL final será normalmente:

`https://<tu-usuario>.github.io/<tu-repo>/`

### Build local para Pages

```bash
npm run build:pages
```

> Nota: el workflow usa automáticamente el nombre del repositorio para el `base-href`.

## Capacitor

Para preparar plataformas nativas:

```bash
npm run build
npx cap add android
npx cap add ios
npx cap sync
```
