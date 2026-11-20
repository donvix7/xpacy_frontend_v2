import "@/app/_styles/global.css";
import {Toaster} from "react-hot-toast";
import { UserProvider } from "./_context/UserContext";
import TokenRefreshModal from "./_components/TokenRefreshModal";
export const metadata = {
  title: {
    template: "%s | Xpacy",
    default: "Xpacy | Find Properties with ease",
  },
  description:
    "A modern real estate platform to rent, buy, list, and manage properties online with ease. Discover seamless property solutions tailored for you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("xpacy-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink flex flex-col font-sans transition-colors duration-150">
        <UserProvider>
          {children}
          <TokenRefreshModal />
        </UserProvider>
      <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
            style: {
              fontFamily: "Outfit, sans-serif",
              fontSize: "16px",
              maxWidth: "500px",
              padding: "16px 24px",
              backgroundColor: "#fff",
              color: "#333",
            },
          }}
        />
      </body>
    </html>
  );
}
