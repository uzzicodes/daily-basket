// One Android app serves customers and staff (staff sign in from Help → Staff sign in).
// Only completed, verified artifacts may be promoted. Expo internal-distribution APKs expire,
// so record the artifact's expiry: after it, /apps stops linking to the dead file.
export type AppDownload={url:string;expiresAt:string;buildPage:string};
// Daily Basket 1.0.5 / Android code 6, EAS build 3e6d4cc2 (finished 23 Nov 2026).
export const appDownload:AppDownload={url:'https://expo.dev/artifacts/eas/xu2wAD_yq6ajs-2g9U7FCmxI8oaC5XfVhciTuN2U9BU.apk',expiresAt:'2026-12-07T11:02:32.004Z',buildPage:'https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-shopping/builds/3e6d4cc2-a3c1-4c2f-a28d-d4e82f10869d'};
export function downloadAvailable(download:AppDownload,now=Date.now()){const end=Date.parse(download.expiresAt);return !!download.url&&Number.isFinite(end)&&now<end;}
