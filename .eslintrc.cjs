module.exports = {
    env: {
        browser: true,
        es2021:  true
    },
    parserOptions: {
        ecmaVersion: 2020,
        sourceType:  'module'
    },
    extends:   'standard',
    overrides: [
        {
            env: {
                node: true
            },
            files: [
                '.eslintrc.{js,cjs}'
            ],
            parserOptions: {
                sourceType: 'script'
            }
        }
    ],
    rules: {
        semi:              ['error', 'always'],
        'max-len':         ['error', 120, 4, { ignoreComments: true }],
        'func-names':      ['error', 'never'],
        indent:            ['error', 4, { SwitchCase: 1, ignoredNodes: ['TemplateLiteral'] }],
        'key-spacing':     ['error', { align: 'value' }],
        'no-multi-spaces': ['error', {
            exceptions: { VariableDeclarator: true, ImportDeclaration: true }
        }],
        'no-new':                          'off',
        'no-param-reassign':               'off',
        'linebreak-style':                 'off',
        'no-underscore-dangle':            ['error', { enforceInMethodNames: false, allowAfterThis: true }],
        'padding-line-between-statements': [
            'error',
            {
                blankLine: 'always',
                prev:      '*',
                next:      'return'
            },
            {
                blankLine: 'always',
                prev:      [
                    'const',
                    'let',
                    'var'
                ],
                next: '*'
            },
            {
                blankLine: 'any',
                prev:      [
                    'const',
                    'let',
                    'var'
                ],
                next: [
                    'const',
                    'let',
                    'var'
                ]
            },
            {
                blankLine: 'always',
                prev:      'if',
                next:      '*'
            },
            {
                blankLine: 'always',
                prev:      '*',
                next:      'if'
            },
            {
                blankLine: 'always',
                prev:      'import',
                next:      '*'
            },
            {
                blankLine: 'any',
                prev:      'import',
                next:      'import'
            },
            {
                blankLine: 'always',
                prev:      '*',
                next:      'export'
            }
        ],
        'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }]
    }
};
