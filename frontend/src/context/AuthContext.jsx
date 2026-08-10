import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null); // { uid, email, role, name }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setLoading(true);        // ← ADD THIS: block rendering until profile check finishes
    setError("");
    setFirebaseUser(user);
    if (user) {
      try {
        const res = await client.get("/auth/me");
        setProfile(res.data);
      } catch (err) {
        setProfile(null);
        setError(err.message || "Your account has no role assigned yet. Ask an administrator to set one up.");
      }
    } else {
      setProfile(null);
    }
    setLoading(false);       // only now is it safe for ProtectedRoute to check firebaseUser/profile
  });
  return unsubscribe;
}, []);

  const logout = () => signOut(auth);

  const value = {
    firebaseUser,
    profile,
    role: profile?.role || null,
    loading,
    error,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
