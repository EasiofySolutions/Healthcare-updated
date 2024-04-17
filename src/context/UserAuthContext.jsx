import { createContext, useContext, useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase-config";

const UserAuthContext = createContext();

export const UserAuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [loading, setLoading] = useState(true); // Introduce loading state

  async function logIn(email, password) {
    setLoading(true); // Ensure loading is true when starting login
    const res = await signInWithEmailAndPassword(auth, email, password);
    setUser(res.user);
    setRole(localStorage.getItem("role") || "")
    // After login, you should set the role based on user details or keep it from localStorage
    setLoading(false); // Set loading to false after login process is complete
    return res;
  }

  function logOut() {
    return signOut(auth).then(() => {
      setUser(null);
      setRole("");
      localStorage.removeItem("role");
      setLoading(false); // Also set loading to false on logout
    });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Set loading to false once we receive the auth state
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserAuthContext.Provider value={{ user, role, setRole, logIn, logOut, loading }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => useContext(UserAuthContext);
