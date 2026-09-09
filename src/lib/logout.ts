import { apiRequest } from "@/lib/apiClient";
import { disconnectSocket } from "@/lib/socket-client";

export async function logout() {
    try {
        await apiRequest("/api/auth/logout", { method: "POST" });
    } finally {
        disconnectSocket();
    }
}
