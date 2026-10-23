import AuthProvider from "./auth/AuthProvider";
import ProfileProvider from "./profile/ProfileProvider";
import ThemeProvider from "./theme/ThemeProvider";
import { PrimeReactProvider } from "primereact/api";
import { ToastProvider } from "./toast/ToastProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../queryClient";

const UseProviders = ({ children }) => {
  return (
    <PrimeReactProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
              <ProfileProvider>
                <AuthProvider>{children}</AuthProvider>
              </ProfileProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </PrimeReactProvider>
  );
};

export default UseProviders;
