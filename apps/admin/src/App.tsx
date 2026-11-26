import { RouterProvider } from "react-router";
import { ThemeProvider } from "./providers/theme.provider";
import { SidebarConfigProvider } from "./providers/sidebar.provider";
import { DialogProvider } from "./providers/dialog.provider";
import { AuthProvider } from "./providers/auth.provider";
import { LoadingProvider } from "./providers/loading.provider";
import { router } from "./router";

function App() {
  return (
    <LoadingProvider>
      <ThemeProvider defaultTheme="dark" storageKey="livingkostpro-admin-theme">
        <SidebarConfigProvider>
          <DialogProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </DialogProvider>
        </SidebarConfigProvider>
      </ThemeProvider>
    </LoadingProvider>
  );
}

export default App;
