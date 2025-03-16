/**
 * TypeScript declarations for webpack runtime
 * This helps TypeScript understand the webpack module system
 */

interface WebpackRequire {
  (moduleId: any): any;
  m: Record<string, any>;
  c: Record<string, any>;
  p: string;
  n: (moduleId: any) => any;
  o: (object: any, property: string) => boolean;
  d: (exports: any, name: string, getter: () => any) => void;
  r: (exports: any) => void;
  t: (value: any, mode: string) => any;
  nmd: (module: any) => any;
  f: {
    j: (chunkId: any) => Promise<void>;
    [key: string]: any;
  };
  e: (chunkId: any) => Promise<void>;
  u: (chunkId: any) => string;
  g: any;
  h: () => string;
  S: Record<string, any>;
  [key: string]: any;
}

interface WebpackModules {
  [moduleId: string]: {
    exports: any;
    id: string;
    loaded: boolean;
    [key: string]: any;
  };
}

declare global {
  interface Window {
    __webpack_require__?: WebpackRequire;
    __webpack_modules__?: WebpackModules;
    webpackChunk_N_E?: any[];
    webpackJsonp?: any[];
    [key: string]: any;
  }
}

export {}; 