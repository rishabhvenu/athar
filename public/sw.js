self.addEventListener("install", (event) => {
  console.log("Service Worker installed.");
});

self.addEventListener("fetch", (event) => {
  // Basic offline fallback strategy would go here
});
