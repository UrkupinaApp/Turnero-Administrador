import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';

export const miContext = createContext();
const AppAuth = "AppAuth";
const AppUserData = "AppUserData";
const AppCounter = "AppCounter"; // Nuevo identificador para el contador
const userToken ="userToken"

export function AuthProvider({ children }) {
  const [Authenticated, setAuthenticated] = useState(window.localStorage.getItem(AppAuth) === "true");
  const [user, setUser] = useState(null);
  const [counter, setCounter] = useState(Number(window.localStorage.getItem(AppCounter)) || 0); // Nuevo estado para el contador
  const saludo = "hola desde context";

  /* const Login = useCallback((values) => {
    localStorage.setItem(AppAuth, "true");
    localStorage.setItem(AppUserData, JSON.stringify(values));
    console.log(values)
    setAuthenticated(true);
    console.log("uth desde Auth",Authenticated,values)
    setUser(values);
  }, []); */



  const Login = useCallback(async (values) => {
    try {
      // Hacemos el POST al endpoint de login
      const response = await fetch('https://xn--urkupia-9za.online/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });
  
      // Si la respuesta es OK (status 200), autenticamos
      if (response.ok) {
        const datos = await response.json()
        console.log("respuesta: ",datos)
        localStorage.setItem(userToken,datos.token)
        localStorage.setItem(AppAuth, "true");
        localStorage.setItem(AppUserData, JSON.stringify(values));
        setAuthenticated(true);
        setUser(values);
        console.log("Autenticación exitosa:", values);
      } else {
        // Si no es 200, leemos el mensaje de error (si viene) y lo mostramos
        const errorData = await response.json();
        console.error("Error en login:", errorData.message || response.statusText);
        alert(errorData.message || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      // Error de conexión u otro problema
      console.error("Fallo al conectar con el servidor:", err);
      alert('No se pudo conectar con el servidor. Inténtalo más tarde.');
    }
  }, [setAuthenticated, setUser]);

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
