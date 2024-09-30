import { defineConfig } from 'vite';
import path from 'path';
import prettier from 'rollup-plugin-prettier';

const libraryConfig = defineConfig({
    build: {
        lib: {
            entry: [path.resolve(__dirname, 'src/SvbModel.js'), path.resolve(__dirname, 'src/services/SvbAPI.js')],
            name: 'SvbModel',
            fileName: format => `SvbModel.${format}.js`,
            formats: ['es'],
        },
        rollupOptions: {
            external: [],
            input: {
              SvbModel: path.resolve(__dirname, 'src/SvbModel.js'),
              SvbAPI: path.resolve(__dirname, 'src/services/SvbAPI.js'),
            },
            output:   {
                entryFileNames: '[name].js',
                format: 'es',
                dir: 'svb',
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
                }),
                //кастомный плагин, чтобы убрать export из собираемого файла
                {
                    name: 'replace-exports',
                    generateBundle(options, bundle) {
                        for (const fileName in bundle) {
                            const chunk = bundle[fileName];
                            if (chunk.type === 'chunk') {
                                chunk.code = chunk.code.replace(/export\s*\{[^}]*\};/g, '');
                            }
                        }
                    }
                }
            ],
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
