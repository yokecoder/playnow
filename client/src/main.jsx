import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

const rootElement = document.getElementById("root");

// React Query for better handling of API Queries
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
            cacheTime: 1000 * 60 * 10, // Keep unused data for 10 minutes
            refetchOnWindowFocus: false, // Prevent refetching when switching tabs
            refetchOnReconnect: false, // Prevent refetching on network reconnect
            refetchOnMount: false, // Prevent refetching when component remounts
            retry: 1 // Reduce retries to avoid unnecessary reloads
        }
    }
});
createRoot(rootElement).render(
    <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
    </BrowserRouter>
);
