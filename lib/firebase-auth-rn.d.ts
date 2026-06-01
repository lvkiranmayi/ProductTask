// Makes this file a module so the declare module below is treated as an
// augmentation (adds to firebase/auth) rather than a full replacement.
export {};

// firebase/auth web typings omit getReactNativePersistence because it only
// exists in the react-native bundle. This adds the missing type so VS Code
// stops reporting "has no exported member 'getReactNativePersistence'".
declare module "firebase/auth" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function getReactNativePersistence(storage: any): any;
}
