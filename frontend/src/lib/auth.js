import Cookies from 'js-cookie';

export const getAuthUser = () => {
  const name = Cookies.get('userName');
  const role = Cookies.get('userRole'); // Recuperiamo il ruolo dal cookie
  const token = Cookies.get('token');

  return {
    isLoggedIn: !!token,
    isAdmin: role?.toLowerCase() === 'admin',
    isOperatore: role?.toLowerCase() === 'operatore',
    name: name || 'Utente',
    role: role || 'Ospite' // AGGIUNTO: se il cookie non c'è, scriviamo 'Ospite'
  };
};