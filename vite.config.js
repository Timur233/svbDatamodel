import { defineConfig } from 'vite';
import path from 'path';
import prettier from 'rollup-plugin-prettier';

const libraryConfig = defineConfig({
    build: {
        lib: {
            entry:    path.resolve(__dirname, 'src/SvbModel.js'),
            name:     'SvbModel',
            fileName: format => 'SvbModel.js',
            formats:  ['umd']
        },
        rollupOptions: {
            external: [],
            output:   {
                globals: {
                }
            },
            plugins: [
                prettier({
                    // Настройки Prettier
                    plugins:       ['prettier-plugin-organize-imports'],
                    tabWidth:      2,
                    singleQuote:   true,
                    semi:          true,
                    trailingComma: 'es5',
                    printWidth:    120,
                    parser:        'babel'
                })
            ]
        },
        minify:    false,
        sourcemap: false
    }
});

const svbAPIConfig = defineConfig({
    build: {
        lib: {
            entry:    path.resolve(__dirname, 'src/services/SvbAPI.js'),
            name:     'SvbAPI',
            fileName: 'SvbAPI',
            formats:  ['umd']
        },
        rollupOptions: {
            external: [],
            output:   {
                globals: {
                }
            },
            plugins: [
                prettier({
                    // Настройки Prettier
                    plugins:       ['prettier-plugin-organize-imports'],
                    tabWidth:      2,
                    singleQuote:   true,
                    semi:          true,
                    trailingComma: 'es5',
                    printWidth:    120,
                    parser:        'babel'
                })
            ]
        },
        minify:    false,
        sourcemap: false
    }
});

const playgroundConfig = defineConfig({});

export default defineConfig(({ command }) => {
    console.log(command);

    if (command === 'build') {
        // Возвращаем конфигурацию сборки для библиотеки
        return libraryConfig;
    } else if (command === 'build:api') {
        // Возвращаем конфигурацию сборки для библиотеки
        return svbAPIConfig;
    } else {
        // Возвращаем конфигурацию для разработки игровой площадки
        return playgroundConfig;
    }
});
