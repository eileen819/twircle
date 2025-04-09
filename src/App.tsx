import MenuBar from "components/Menu";
import AuthContext from "context/AuthContext";
import { useContext } from "react";
import { Outlet } from "react-router-dom";

function App() {
  const { user, isLoading } = useContext(AuthContext);
  return (
    <div className="layout">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Outlet />
          {user && <MenuBar />}
        </>
      )}
    </div>
  );
}

export default App;
