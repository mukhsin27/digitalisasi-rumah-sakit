/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: { extend: { colors: { brand: { 50:"#effaf8",100:"#d8f2ed",500:"#159b87",600:"#0e8272",700:"#12695f",900:"#123e3b" } }, boxShadow: { soft:"0 18px 50px rgba(20,55,65,.08)" } } },
  plugins: []
};