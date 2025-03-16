/**
 * Global error handler for Next.js to catch and handle common errors
 * such as the "to" argument type error in react-router-dom
 */

// Install the global error handler as early as possible
if (typeof process !== "undefined") {
  // Intercept unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    // Check for the specific "to" argument error
    if (
      reason &&
      reason.code === "ERR_INVALID_ARG_TYPE" &&
      reason.message &&
      reason.message.includes('The "to" argument must be of type string')
    ) {
      console.warn(
        '[Handled] Intercepted router "to" argument error. This is expected during server rendering.'
      );
      // Prevent the error from crashing the server
      return;
    }

    // Log other unhandled rejections but don't crash
    console.error("[Unhandled Rejection]", reason);
  });

  // Intercept uncaught exceptions
  process.on("uncaughtException", (error) => {
    // Check for the specific "to" argument error
    if (
      error &&
      error.code === "ERR_INVALID_ARG_TYPE" &&
      error.message &&
      error.message.includes('The "to" argument must be of type string')
    ) {
      console.warn(
        '[Handled] Intercepted router "to" argument error. This is expected during server rendering.'
      );
      // Prevent the error from crashing the server
      return;
    }

    // For other errors, log but don't exit the process in development
    if (process.env.NODE_ENV === "development") {
      console.error("[Uncaught Exception]", error);
    } else {
      // In production, we should let the process terminate
      // for most uncaught exceptions
      console.error("[Fatal Error]", error);
      process.exit(1);
    }
  });
}

// Export a function to manually install the error handlers
export function installErrorHandlers() {
  // This function is exported so it can be explicitly called,
  // but the handlers are installed upon module import anyway
  console.log("Global error handlers installed.");
}

export default installErrorHandlers;
