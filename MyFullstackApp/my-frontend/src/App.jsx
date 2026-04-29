// App.jsx
import { Outlet, Link } from "react-router-dom";
import Header from "./Components/header";
function App() {
  return (
    <div className="main">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
export default App;