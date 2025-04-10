import AuthContext from "context/AuthContext";
import { useContext } from "react";
import { ToastContainer } from "react-toastify";
import Router from "routes/Router";

function App() {
  const { user } = useContext(AuthContext);
  return (
    <>
      <ToastContainer />
      <Router isAuthenticated={!!user} />
    </>
  );
}

export default App;
