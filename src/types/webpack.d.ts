/**
 * Type declarations for webpack global variables
 */
interface WebpackRequire {
  (moduleId: any): any;
  m?: Record<string, any>; // module cache
  c?: Record<string, any>; // exports cache
  p?: string; // public path
  n?: (module: any) => any; // compatibility function
  d?: (exports: any, name: string, getter: () => any) => void; // define getter
  o?: (object: any, property: string) => boolean; // has own property
  r?: (exports: any) => void; // mark as ES module
  t?: (value: any, mode: any) => any; // create a fake namespace object
  nmd?: (module: any) => void; // no module.id needed
  [key: string]: any; // catch-all for other properties
}

declare global {
  interface Window {
    __webpack_require__?: WebpackRequire;
    __WEBPACK_PATCH_APPLIED?: boolean;
    webpackChunk_N_E?: any[];
    webpackJsonp?: any[];
  }
  
  var __webpack_require__: WebpackRequire | undefined;
  var __webpack_public_path__: string | undefined;
  var __webpack_modules__: Record<string, any> | undefined;
  var __webpack_chunk_load__: Function | undefined;
}

export {}; 