// One Android app serves customers and staff (staff sign in from Help → Staff sign in).
// Only completed, verified artifacts may be promoted. Expo internal-distribution APKs expire,
// so record the artifact's expiry: after it, /apps stops linking to the dead file.
export type AppDownload={url:string;expiresAt:string;buildPage:string};
// Daily Basket 1.0.7 / Android code 8, EAS build d1ba97eb (finished 25 Nov 2026).
export const appDownload:AppDownload={url:'https://expo.dev/artifacts/eas/h8bdEI7nO-Xyag14WL6vVDoccb6TfFuKs60ds8mMfTA.apk',expiresAt:'2026-12-09T11:27:12.817Z',buildPage:'https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-shopping/builds/d1ba97eb-c18f-4cdd-88dd-e0f6b8fbc19f'};
export function downloadAvailable(download:AppDownload,now=Date.now()){const end=Date.parse(download.expiresAt);return !!download.url&&Number.isFinite(end)&&now<end;}
