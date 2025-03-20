// Add declaration for webpack globals
declare global {
  interface Window {
    __webpack_require__?: {
      (moduleId: any): any;
      [key: string]: any;
    };
    __WEBPACK_PATCH_APPLIED?: boolean;
  }
}

export default function Head() {
  return (
    <>
      {/* Inline script to patch webpack runtime before any other JavaScript runs */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function applyBundlerPatchesRuntime() {" +
            "  // This script runs before any other JavaScript" +
            "  // It patches the webpack runtime to handle the \"Cannot read properties of undefined (reading 'call')\" error" +
            "  " +
            "  window.__WEBPACK_PATCH_APPLIED = false;" +
            "  " +
            "  // Function to apply the patch" +
            "  function applyPatch() {" +
            "    try {" +
            "      if (window.__webpack_require__) {" +
            "        var originalRequire = window.__webpack_require__;" +
            "        " +
            "        window.__webpack_require__ = function patchedRequire(moduleId) {" +
            "          try {" +
            "            if (!moduleId) {" +
            "              return {};" +
            "            }" +
            "            return originalRequire(moduleId);" +
            "          } catch (e) {" +
            "            return {};" +
            "          }" +
            "        };" +
            "        " +
            "        // Copy all properties from the original require" +
            "        for (var key in originalRequire) {" +
            "          if (originalRequire.hasOwnProperty(key)) {" +
            "            window.__webpack_require__[key] = originalRequire[key];" +
            "          }" +
            "        }" +
            "        " +
            "        window.__WEBPACK_PATCH_APPLIED = true;" +
            "      }" +
            "    } catch (error) {" +
            "      // Silent fail" +
            "    }" +
            "  }" +
            "  " +
            "  // Try to apply the patch immediately" +
            "  if (window.__webpack_require__) {" +
            "    applyPatch();" +
            "  } else {" +
            "    // If webpack is not yet defined, wait for it with setTimeout" +
            "    setTimeout(function() {" +
            "      if (window.__webpack_require__ && !window.__WEBPACK_PATCH_APPLIED) {" +
            "        applyPatch();" +
            "      }" +
            "    }, 100);" +
            "  }" +
            "  " +
            "  // Also patch the global error handler to catch webpack errors" +
            '  window.addEventListener("error", function(event) {' +
            "    if (" +
            '      event.message.indexOf("webpack") !== -1 || ' +
            '      event.message.indexOf("Cannot read properties of undefined") !== -1 ||' +
            "      event.message.indexOf(\"reading 'call'\") !== -1" +
            "    ) {" +
            "      // Try to apply the patch again" +
            "      if (window.__webpack_require__ && !window.__WEBPACK_PATCH_APPLIED) {" +
            "        applyPatch();" +
            "      }" +
            "      " +
            "      // Prevent the error from bubbling up if it's a webpack error" +
            "      event.preventDefault();" +
            "    }" +
            "  }, true);" +
            "})();",
        }}
      />
    </>
  );
}
