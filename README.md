
# TAO PROJET BACKEND
dotnet new webapi -n Ten

# TAO PROJET FRONTEND
npm create vite@latest my-frontend -- --template react

# Cai dat tailwindcss
npm install tailwindcss @tailwindcss/vite
/*vao file vite.config.ts:*/
import tailwindcss from '@tailwindcss/vite'
export default {
  plugins: [
    tailwindcss(),
  ],
}
/* trong file src/index.css them dong nay:*/
/* @import "tailwindcss"; */
<!-- Add MongoDB.Driver package -->
dotnet add package MongoDB.Driver
<!-- i18n react -->
npm i react-i18next i18next --save
