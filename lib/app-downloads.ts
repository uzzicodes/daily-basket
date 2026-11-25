// One Android app serves customers and staff (staff sign in from Help → Staff sign in).
// Only completed, verified artifacts may be promoted. Expo internal-distribution APKs expire,
// so record the artifact's expiry: after it, /apps stops linking to the dead file.
export type AppDownload={url:string;expiresAt:string;buildPage:string};
// Daily Basket 1.0.8 / Android code 9, EAS build b5532cc4 (finished 25 Nov 2026).
export const appDownload:AppDownload={url:'https://expo.dev/artifacts/eas/LqTYMsEw0-NARIdbQv0KgzpyxP5XaFDxYqcmpwvHp3M.apk',expiresAt:'2026-12-09T13:12:06.689Z',buildPage:'https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-shopping/builds/b5532cc4-2cbd-4bd1-bced-05bf9cdccc03'};
export function downloadAvailable(download:AppDownload,now=Date.now()){const end=Date.parse(download.expiresAt);return !!download.url&&Number.isFinite(end)&&now<end;}
