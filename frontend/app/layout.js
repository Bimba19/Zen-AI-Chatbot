import './globals.css';

export const metadata = {
  title: 'ZenBot',
  description: 'AI Chatbot powered by Hugging Face',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="transition-colors duration-300">
      <body className="bg-gray-100 text-black dark:bg-gray-900 dark:text-white">
        {children}
      </body>
    </html>
  );
}
