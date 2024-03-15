/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            spacing: {
                page: 'calc(100vh - 7rem)',
            },
            animation: {
                'small-ping': 'small-ping 800ms ease-out forwards 3',
            },
            keyframes: {
                'small-ping': {
                    '0%': { transform: 'scale(1)', opacity: 1 },
                    '100%': { transform: 'scale(1.25)', opacity: 0 },
                },
            },
        },
    },
    plugins: [],
}
