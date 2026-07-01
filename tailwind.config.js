/** @type {import('tailwindcss').Config} */
// Nur projekte.html nutzt Tailwind. Die restlichen Seiten laden css/style.css.
module.exports = {
	content: ['./projekte.html'],
	theme: {
		extend: {},
	},
	plugins: [],
};
