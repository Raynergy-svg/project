// Script to dynamically load hCaptcha
(function () {
  console.log("Attempting to load hCaptcha dynamically");

  // Keep track of load attempts
  let loadAttempts = 0;
  const MAX_ATTEMPTS = 3;

  // Function to check if hCaptcha is already loaded
  function isHCaptchaLoaded() {
    return typeof window.hcaptcha !== "undefined";
  }

  // Function to create and return a nonce for CSP
  function generateNonce() {
    return "hc_" + Math.random().toString(36).substring(2, 15);
  }

  // Function to load hCaptcha script directly
  function loadDirectly(useParams = true) {
    if (isHCaptchaLoaded()) {
      console.log("hCaptcha already loaded, skipping direct load");
      document.dispatchEvent(new CustomEvent("hcaptcha-loaded"));
      return;
    }

    try {
      console.log("Loading hCaptcha script directly");
      const script = document.createElement("script");

      // Add query parameters that might help with CSP issues
      const params = new URLSearchParams();
      if (useParams) {
        params.append("hcaptcha-csp-bypass", "1");
        params.append("render", "explicit");
        params.append("onload", "hcaptchaOnLoad");
      }

      // Append a cache-busting parameter
      params.append("_t", Date.now());

      // Construct the URL
      script.src = `https://js.hcaptcha.com/1/api.js${
        params.toString() ? "?" + params.toString() : ""
      }`;
      script.async = true;
      script.defer = true;

      // Handle loading events
      script.onload = function () {
        console.log("hCaptcha script loaded successfully (direct)");
        document.dispatchEvent(new CustomEvent("hcaptcha-loaded"));
      };

      script.onerror = function (error) {
        console.error("Failed to load hCaptcha script (direct):", error);
        loadAttempts++;

        if (loadAttempts < MAX_ATTEMPTS) {
          // Try again with different approach
          console.log(
            `Retry ${loadAttempts}/${MAX_ATTEMPTS}: Trying iframe approach`
          );
          loadViaIframe();
        } else {
          console.error("All hCaptcha loading attempts failed");
          document.dispatchEvent(new CustomEvent("hcaptcha-load-error"));
        }
      };

      // Try to create and use a nonce
      const nonce = generateNonce();
      script.setAttribute("nonce", nonce);

      // Inject a temporary meta tag to allow this script via nonce
      const meta = document.createElement("meta");
      meta.httpEquiv = "Content-Security-Policy";
      meta.content = `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.hcaptcha.com https://*.hcaptcha.com 'nonce-${nonce}';`;
      document.head.appendChild(meta);

      // Remove the meta tag after a short delay
      setTimeout(() => {
        if (meta.parentNode) {
          meta.parentNode.removeChild(meta);
        }
      }, 1000);

      // Add the script to the page
      document.head.appendChild(script);
    } catch (error) {
      console.error("Error during direct hCaptcha script loading:", error);
      document.dispatchEvent(new CustomEvent("hcaptcha-load-error"));
    }
  }

  // Function to load hCaptcha via an iframe
  function loadViaIframe() {
    if (isHCaptchaLoaded()) {
      console.log("hCaptcha already loaded, skipping iframe loading");
      document.dispatchEvent(new CustomEvent("hcaptcha-loaded"));
      return;
    }

    try {
      console.log("Loading hCaptcha via iframe");

      // Create an invisible iframe with sandbox attributes
      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        "display:none; width:0; height:0; border:0; border:none;";
      iframe.sandbox = "allow-scripts allow-same-origin";
      iframe.title = "hCaptcha Loader";
      document.body.appendChild(iframe);

      // Add a listener for messages from the iframe
      const messageHandler = function (event) {
        if (event.data === "hcaptcha-loaded") {
          console.log("hCaptcha loaded successfully via iframe");
          window.removeEventListener("message", messageHandler);
          document.dispatchEvent(new CustomEvent("hcaptcha-loaded"));
        } else if (event.data === "hcaptcha-error") {
          console.error("Failed to load hCaptcha via iframe");
          window.removeEventListener("message", messageHandler);

          // Final fallback: try loading without parameters
          loadAttempts++;
          if (loadAttempts < MAX_ATTEMPTS) {
            console.log(
              `Retry ${loadAttempts}/${MAX_ATTEMPTS}: Trying direct load without parameters`
            );
            loadDirectly(false);
          } else {
            console.error("All hCaptcha loading attempts failed");
            document.dispatchEvent(new CustomEvent("hcaptcha-load-error"));
          }
        }
      };

      window.addEventListener("message", messageHandler);

      // Create the iframe content
      const frameDoc = iframe.contentWindow.document;
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>hCaptcha Loader</title>
            <script>
              try {
                // Create and load the hCaptcha script
                var script = document.createElement("script");
                script.src = "https://js.hcaptcha.com/1/api.js?hcaptcha-csp-bypass=1&render=explicit&onload=hcaptchaOnLoad&_t=${Date.now()}";
                script.async = true;
                script.defer = true;
                
                // Define the onload callback
                window.hcaptchaOnLoad = function() {
                  console.log("hCaptcha loaded in iframe");
                  
                  // Copy the hcaptcha object to the parent window
                  try {
                    if (window.hcaptcha && !window.parent.hcaptcha) {
                      window.parent.hcaptcha = window.hcaptcha;
                    }
                    
                    // Notify the parent
                    window.parent.postMessage("hcaptcha-loaded", "*");
                  } catch (e) {
                    console.error("Error copying hcaptcha to parent:", e);
                    window.parent.postMessage("hcaptcha-error", "*");
                  }
                };
                
                // Handle errors
                script.onerror = function() {
                  console.error("Error loading hCaptcha in iframe");
                  window.parent.postMessage("hcaptcha-error", "*");
                };
                
                // Add the script to the document
                document.head.appendChild(script);
              } catch (e) {
                console.error("Error in hCaptcha iframe loader:", e);
                window.parent.postMessage("hcaptcha-error", "*");
              }
            </script>
          </head>
          <body>
            <div>Loading hCaptcha...</div>
          </body>
        </html>
      `);
      frameDoc.close();
    } catch (error) {
      console.error("Error creating hCaptcha iframe:", error);

      // Try direct loading as last resort
      loadAttempts++;
      if (loadAttempts < MAX_ATTEMPTS) {
        loadDirectly(false);
      } else {
        document.dispatchEvent(new CustomEvent("hcaptcha-load-error"));
      }
    }
  }

  // Define a global function that can be called from iframe
  window.hcaptchaOnLoad = function () {
    console.log("hCaptcha onload callback triggered");
    document.dispatchEvent(new CustomEvent("hcaptcha-loaded"));
  };

  // Try to load hCaptcha using a strategy that starts with the iframe approach
  function loadHCaptcha() {
    if (isHCaptchaLoaded()) {
      console.log("hCaptcha already loaded, skipping");
      document.dispatchEvent(new CustomEvent("hcaptcha-loaded"));
      return;
    }

    // Start with the iframe approach
    loadViaIframe();

    // Set a fallback timeout in case none of the approaches worked
    setTimeout(() => {
      if (!isHCaptchaLoaded()) {
        console.warn(
          "hCaptcha not loaded after timeout, triggering error event"
        );
        document.dispatchEvent(new CustomEvent("hcaptcha-load-error"));
      }
    }, 10000); // 10 seconds timeout
  }

  // Load hCaptcha after a short delay
  setTimeout(loadHCaptcha, 500);

  // Expose function to retry loading if needed
  window.retryHCaptchaLoad = function () {
    console.log("Retrying hCaptcha load");
    loadAttempts = 0;
    loadHCaptcha();
  };
})();
