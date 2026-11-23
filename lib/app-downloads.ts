// One Android app serves customers and staff (staff sign in from Help → Staff sign in).
// Only completed, verified artifacts may be promoted. Expo internal-distribution APKs expire,
// so record the artifact's expiry: after it, /apps stops linking to the dead file.
export type AppDownload={url:string;expiresAt:string;buildPage:string};
// Daily Basket 1.0.6 / Android code 7, EAS build 9a3bd77b (finished 23 Nov 2026).
export const appDownload:AppDownload={url:'https://expo.dev/artifacts/eas/XC-IjZND7P-VEiOnYw6JpwFEZ9t521PWlhM6D12oKw4.apk',expiresAt:'2026-12-07T11:48:07.037Z',buildPage:'https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-shopping/builds/9a3bd77b-38c5-43d1-b3fa-318c8f87464a'};
export function downloadAvailable(download:AppDownload,now=Date.now()){const end=Date.parse(download.expiresAt);return !!download.url&&Number.isFinite(end)&&now<end;}
