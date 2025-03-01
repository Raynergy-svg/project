// This script checks whether hCaptcha can load correctly
(function () {
  console.log("Captcha check script loaded");

  // Create a test element
  const testDiv = document.createElement("div");
  testDiv.id = "hcaptcha-test-container";
  testDiv.style.position = "fixed";
  testDiv.style.bottom = "10px";
  testDiv.style.right = "10px";
  testDiv.style.padding = "10px";
  testDiv.style.background = "white";
  testDiv.style.border = "1px solid #ccc";
  testDiv.style.borderRadius = "4px";
  testDiv.style.zIndex = "9999";

  const status = document.createElement("div");
  status.textContent = "Checking hCaptcha...";
  testDiv.appendChild(status);

  // Check if hCaptcha script is present
  const scriptCheck = document.createElement("div");
  const hcaptchaScript = document.querySelector('script[src*="hcaptcha.com"]');
  scriptCheck.textContent = hcaptchaScript
    ? "✅ hCaptcha script found"
    : "❌ hCaptcha script missing";
  testDiv.appendChild(scriptCheck);

  // Add close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.marginTop = "10px";
  closeButton.style.padding = "5px";
  closeButton.addEventListener("click", () => testDiv.remove());
  testDiv.appendChild(closeButton);

  // Add to body
  document.body.appendChild(testDiv);

  // Check if hcaptcha object is available
  window.setTimeout(() => {
    const apiCheck = document.createElement("div");
    apiCheck.textContent = window.hcaptcha
      ? "✅ hCaptcha API available"
      : "❌ hCaptcha API not available";
    testDiv.insertBefore(apiCheck, closeButton);

    // Update status
    status.textContent = window.hcaptcha
      ? "hCaptcha appears to be working correctly. Check browser console for more details."
      : "hCaptcha is not loading correctly. Check browser console for errors.";

    // Log debug info
    console.log("hCaptcha Debug:", {
      scriptFound: !!hcaptchaScript,
      apiAvailable: !!window.hcaptcha,
      networkRequests: "Check Network tab for requests to hcaptcha.com domains",
      siteKey:
        document.querySelector('iframe[src*="hcaptcha.com"]')?.src ||
        "No iframe found",
    });
  }, 2000);
})();
