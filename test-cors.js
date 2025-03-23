// Run this in your browser console on commercialcoding.com
fetch("https://your-vercel-url.vercel.app/api/contact-us", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Test User",
    email: "test@example.com",
    message: "Testing CORS configuration",
  }),
})
  .then((response) => response.json())
  .then((data) => console.log("Success:", data))
  .catch((error) => console.error("Error:", error))

