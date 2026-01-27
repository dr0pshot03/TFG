import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components/"),
      "@constants": path.resolve(__dirname, "./src/constants/"),
      "@store": path.resolve(__dirname, "./src/store/"),
      "@utils": path.resolve(__dirname, "./src/utils/"),
      "@CustomTypes": path.resolve(__dirname, "./src/types/"),
      "@assets": path.resolve(__dirname, "./src/types/"),
      "@pages": path.resolve(__dirname, "./src/pages/"),
      "@hooks": path.resolve(__dirname, "./src/hooks/"),
      "@configs": path.resolve(__dirname, "./src/configs/"),
      "@data": path.resolve(__dirname, "./src/data/"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  optimizeDeps: {
    force: true,
  },
})