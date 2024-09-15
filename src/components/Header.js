import React from 'react';
import { getAuth, signOut } from 'firebase/auth';

function Header() {
    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
        }
    };

    return (
        <div className="header">
            <h1>Credits - Pool Interviewers Generator V0.02</h1>
            <button onClick={handleLogout} className="logout-button">
                Cerrar sesión
            </button>
        </div>
    );
}

export default Header;
