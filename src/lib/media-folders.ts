export const MediaFolder = {
  PROFILE:      "/profile",
  BANNER:       "/banner",
  GALLERY:      "/gallery",
  NEWS:         "/news",
  PUBLICATION:  "/publication",
  DOCUMENT:     "/document",
  ORGANIZATION: "/organization",
  SERVICE:      "/service",
  REGULATION:   "/regulation",
} as const;

export type MediaFolderKey = keyof typeof MediaFolder;
export type MediaFolderPath = (typeof MediaFolder)[MediaFolderKey];
