/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#121212',
                    800: '#1e1e1e',
                    700: '#2c2c2c',
                },
                primary: {
                    500: '#3b82f6', // Example blue
                }
            }
        },
    },
    plugins: [],
}
