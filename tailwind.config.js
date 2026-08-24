/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 根据设计要求的颜色
        pink: {
          vibrant: '#FF69B4', // 高饱和粉色
          light: '#FFB6D9',
        },
        teal: '#20B2AA', // 青绿
        skyblue: '#87CEEB', // 天蓝
        yellow: '#FFD700', // 黄色
        coral: '#FF7F50', // 珊瑚橙
        purple: '#DDA0DD', // 薰衣草紫
        cream: '#FFFDD0', // 奶油白
      },
    },
  },
  plugins: [],
}
