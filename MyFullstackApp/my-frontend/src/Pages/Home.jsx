import { Outlet, Link } from "react-router-dom";
import Button from "../Components/Button";
import { useEffect } from "react";
function Home({ url }) {
    const handleAddQuiz = () => {
        alert("Đã bấm nút thêm Quiz!");
    };
    useEffect(() => {
        console.log(url);
        console.log("Home");
        fetch(`${url}/api/data`)
            .then(response => {
                console.log(response);
                return response.json()})
            .then(data => console.log(data))
            .catch(error => console.error(error));
    }, [url]);
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