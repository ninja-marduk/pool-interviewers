import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Nuevo estado para alternar entre login y registro

  const auth = getAuth();

  // Manejar el inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        // Crear una nueva cuenta si el usuario está registrándose
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Iniciar sesión si el usuario ya tiene una cuenta
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError('Error al iniciar sesión: ' + err.message);
    }
  };

  return (
    <div>
      <h2>{isRegistering ? 'Registro' : 'Login'}</h2> {/* Cambia el título según el modo */}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isRegistering ? 'Registrar' : 'Iniciar Sesión'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* Opción para cambiar entre login y registro */}
      <p>
        {isRegistering ? (
          <>
            ¿Ya tienes una cuenta?{' '}
            <button onClick={() => setIsRegistering(false)}>
              Inicia sesión
            </button>
          </>
        ) : (
          <>
            ¿No tienes cuenta?{' '}
            <button onClick={() => setIsRegistering(true)}>
              Regístrate
            </button>
          </>
        )}
      </p>
    </div>
  );
}

export default Login;
