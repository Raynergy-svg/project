// Invoke the setup-database function
const projectRef = "gnwdahoiauduyncppbdb"; // Your Supabase project reference
const supabaseUrl = `https://${projectRef}.supabase.co`;
const anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// You can get the anon key from .env.local
// Alternatively, paste your anon key here
// const anon_key = "YOUR_ANON_KEY_HERE";

const functionUrl = `${supabaseUrl}/functions/v1/setup-database`;

console.log("Invoking setup-database function...");
console.log("URL:", functionUrl);

fetch(functionUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${anon_key}`,
  },
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Success:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
