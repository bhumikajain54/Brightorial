import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const RoleRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("authUser");
    const isAdminImpersonating = localStorage.getItem("isAdminImpersonating") === "true";
    
    // Check if user is logged in
    if (!token || !userStr) {
        return <Navigate to="/login" replace />;
    }

    let user;
    try {
        user = JSON.parse(userStr);
    } catch (e) {
        // Invalid user data, redirect to login
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        return <Navigate to="/login" replace />;
    }

    // Skip JWT validation for admin impersonation tokens
    if (!isAdminImpersonating || !token.startsWith("admin_impersonate_")) {
        // Check token expiry only for real JWT tokens
        try {
            const payload = jwtDecode(token);
            const now = Math.floor(Date.now() / 1000);
            
            if (payload.exp <= now) {
                // Token expired, clear storage and redirect to login
                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
                return <Navigate to="/login" replace />;
            }
        } catch (e) {
            // If it's not an impersonation token and decode fails, redirect to login
            if (!isAdminImpersonating) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
                return <Navigate to="/login" replace />;
            }
            // If it's an impersonation token, allow it even if decode fails
        }
    }

    // Check if user's role matches allowed roles
    if (!allowedRoles.includes(user.role)) {
        // User trying to access wrong role's dashboard, redirect to their own dashboard
        if (user.role === "recruiter") {
            return <Navigate to="/recruiter/dashboard" replace />;
        } else if (user.role === "institute") {
            return <Navigate to="/institute/dashboard" replace />;
        } else if (user.role === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        } else {
            // Unknown role, redirect to login
            return <Navigate to="/login" replace />;
        }
    }

    // User is authenticated and has correct role
    return children;
};

export default RoleRoute;
