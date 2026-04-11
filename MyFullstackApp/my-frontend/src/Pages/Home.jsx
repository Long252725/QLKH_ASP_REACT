import { Outlet, Link } from "react-router-dom";
import Button from "../Components/Button";
function Home() {
    const handleAddQuiz = () => {
        alert("Đã bấm nút thêm Quiz!");
    };
    return (
        <>
            <h1>Home</h1>
            <p>Chào mừng bạn đến với trang chủ</p>
            <Button text="Làm Quiz" handleOnClick={handleAddQuiz} />
            <Link to="/quiz/101">Làm Quiz</Link>

        </>
    )
}

export default Home