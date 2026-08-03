
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./SignupPage/AuthContext";

export const Logout: React.FC = () => {
    const { logout, userStatus } = useAuth();
    const navigate = useNavigate();
    const executedRef = useRef(false);

    useEffect(() => {
        if (executedRef.current) return;
        executedRef.current = true;

        const performLogout = async () => {
            if (userStatus) {
                await logout();
                console.log("✅ Déconnexion réussie");
            }
            navigate("/", { replace: true });
        };
        performLogout();
    }, [logout, navigate, userStatus]);

    return null;
}
