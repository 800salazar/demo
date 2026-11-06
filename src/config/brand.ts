/** Public, owner-selected media in the shared Supabase project's landing bucket. */
export const brandAssetBase = "https://acwlzsofiqdaxmwpyczu.supabase.co/storage/v1/object/public/landing";

export const brandAssets = {
  icon: `${brandAssetBase}/icon.png`,
  logoBlue: `${brandAssetBase}/logonew2025-azul.png`,
  logoWhite: `${brandAssetBase}/logonew2025-blanco.png`,
  logoBlack: `${brandAssetBase}/logonew2025-negro.png`,
} as const;

export const brandMedia = {
  clientLogosVideo: `${brandAssetBase}/animo-stairway-720p.webm`,
} as const;

/** Versioned URL replaces the browser's cached starter icon after deployment. */
export const brandIcons = {
  icon: { url: `${brandAssets.icon}?v=salazar-20261106`, type: "image/png" },
  shortcut: `${brandAssets.icon}?v=salazar-20261106`,
  apple: brandAssets.icon,
};
