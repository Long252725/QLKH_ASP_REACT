// App.jsx
import { Outlet, Link } from "react-router-dom";

function App() {
  return (
    <div className="main">
      {/* <nav>
        <Link to="/">Trang chủ</Link> | 
        <Link to="/quiz/101">Làm Quiz</Link>
      </nav> */}
      

      {/* Outlet là nơi nội dung của Home hoặc Quiz sẽ hiển thị vào đây */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
export default App;