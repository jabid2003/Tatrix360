export const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PC9zdmc+';

export function getImageBlurUrl(src: string): string {
  if (src.includes('cloudinary')) {
    const parts = src.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_20,h_20,c_fill,e_blur:100,q_auto,f_auto/${parts[1]}`;
    }
  }
  return BLUR_DATA_URL;
}
