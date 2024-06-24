import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';

export const miContext = createContext();
const AppAuth = "AppAuth";
const AppUserData = "AppUserData";
const AppCounter = "AppCounter"; // Nuevo identificador para el contador

export function AuthProvider({ children }) {
  const [Authenticated, setAuthenticated] = useState(window.localStorage.getItem(AppAuth) === "true");
  const [user, setUser] = useState(null);
  const [counter, setCounter] = useState(Number(window.localStorage.getItem(AppCounter)) || 0); // Nuevo estado para el contador
  const saludo = "hola desde context";

  const Login = useCallback((values) => {
    localStorage.setItem(AppAuth, "true");
    localStorage.setItem(AppUserData, JSON.stringify(values));
    console.log(values)
    setAuthenticated(true);
    console.log("uth desde Auth",Authenticated)
    setUser(values);
  }, []);

  const Logout = useCallback(() => {
    localStorage.removeItem(AppAuth);
    localStorage.removeItem(AppUserData);
    setAuthenticated(false);
    setUser(null);
  }, []);

  // Efecto para resetear el contador diariamente
  useEffect(() => {
    const currentDate = new Date().toLocaleDateString();
    const storedDate = window.localStorage.getItem('AppCounterDate');
    if (!storedDate || currentDate !== storedDate) {
      localStorage.setItem(AppCounter, '0');
      localStorage.setItem('AppCounterDate', currentDate);
      setCounter(0);
    }
  }, []);

  // Función para incrementar el contador
  const incrementCounter = useCallback(() => {
    setCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      localStorage.setItem(AppCounter, newCounter.toString());
      return newCounter;
    });
  }, []);

  const Value = useMemo(() => ({
    Login,
    Logout,
    Authenticated,
    saludo,
    user,
    counter,
    incrementCounter,
  }), [Login, Logout, Authenticated, saludo, user, counter, incrementCounter]);

  return <miContext.Provider value={Value}>{children}</miContext.Provider>;
}

// Custom Hook para consumir el contexto
export function useAuthContext() {
  return useContext(miContext);
}
