// // import { defineConfig } from 'vite'
// // import react from '@vitejs/plugin-react'
// // import tailwindcss from '@tailwindcss/vite'

// // export default defineConfig({
// //   plugins: [react(), tailwindcss()],
// // })

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173, // Port ko fix kar diya taake bar bar change na ho
//     strictPort: true
//   }
// })

import { defineConfig } from 'vite'
// import react from '@vitejs/plug in-react'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177, // Port change kar di taake conflict na ho
    strictPort: true
  }
})