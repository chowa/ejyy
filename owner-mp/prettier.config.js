module.exports = {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    semi: true,
    trailingComma: 'none',
    bracketSpacing: true,
    jsxBracketSameLine: false,
    arrowParens: 'avoid',
    htmlWhitespaceSensitivity: 'ignore',
    overrides: [
        {
            files: '*.wxml',
            options: {
                parser: 'html'
            }
        },
        {
            files: '*.wxss',
            options: {
                parser: 'css'
            }
        },
        {
            files: '*.wxs',
            options: {
                'parser': 'babel'
            }
        }
    ]
};
