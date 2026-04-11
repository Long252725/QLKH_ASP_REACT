// pages/Quiz.jsx
import { useParams } from "react-router-dom";

function Quiz() {
  let { id } = useParams(); // Lấy số "101" từ URL /quiz/101
  
  return <h1>Bạn đang làm bài Quiz số: {id}</h1>;
}

export default Quiz;