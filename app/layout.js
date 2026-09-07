import "@/app/_styles/global.css";
import {Toaster} from "react-hot-toast";
import { UserProvider } from "./_context/UserContext";
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
    <html lang="en">
      <body className="text-primary flex flex-col">
        <UserProvider>{children}</UserProvider>
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
              fontFamily: "Unitext Regular",
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
