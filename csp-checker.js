// CSP violation checker
console.log("CSP Violation Checker loaded");

// Listen for CSP violation reports
document.addEventListener("securitypolicyviolation", (e) => {
  console.error("CSP Violation:", {
    blockedURI: e.blockedURI,
    violatedDirective: e.violatedDirective,
    originalPolicy: e.originalPolicy,
    disposition: e.disposition,
    documentURI: e.documentURI,
    effectiveDirective: e.effectiveDirective,
    sample: e.sample,
  });
});

// Check if any resources are currently being blocked
setTimeout(() => {
  let blockedResources = [];
  const allImgs = document.querySelectorAll("img");

  allImgs.forEach((img) => {
    if (!img.complete || img.naturalWidth === 0) {
      blockedResources.push({
        type: "img",
        src: img.src,
        element: img,
      });
    }
  });

  if (blockedResources.length > 0) {
    console.error("Found potentially blocked resources:", blockedResources);
  } else {
    console.log("No blocked images detected");
  }
}, 3000);

// Check for Unsplash images specifically
setTimeout(() => {
  const unsplashImages = Array.from(document.querySelectorAll("img")).filter(
    (img) => img.src.includes("unsplash.com")
  );

  if (unsplashImages.length === 0) {
    console.log("No Unsplash images found on the page");
  } else {
    console.log(
      `Found ${unsplashImages.length} Unsplash images`,
      unsplashImages.map((img) => img.src)
    );

    // Check if they loaded correctly
    const loadedUnsplashImages = unsplashImages.filter(
      (img) => img.complete && img.naturalWidth > 0
    );

    if (loadedUnsplashImages.length === unsplashImages.length) {
      console.log("All Unsplash images loaded successfully!");
    } else {
      console.error(
        `${
          unsplashImages.length - loadedUnsplashImages.length
        } Unsplash images failed to load`
      );
    }
  }
}, 5000);
