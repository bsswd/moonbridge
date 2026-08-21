import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // 🎯 ОБЯЗАТЕЛЬНО! Делает все пути относительными
    
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        
        // Отключаем минификацию для отладки (можно включить перед релизом)
        minify: false,
        
        // Убираем sourcemap (они не нужны на Яндекс Играх)
        sourcemap: false,
        
        // Опционально: разбиваем код на чанки для быстрой загрузки
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        }
    }
});