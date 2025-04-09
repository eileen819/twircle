import MenuBar from "components/Menu";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="layout">
      <Outlet />
      <MenuBar />
    </div>
  );
}

export default App;
