/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            spacing: {
                'page': 'calc(100vh - 7rem)'
            }
        },
    },
    plugins: [],
}
