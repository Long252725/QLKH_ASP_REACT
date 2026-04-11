const Button = ({ text, handleOnClick }) => {
    return (
        <button
            type='button'
            className="bg-blue-600 px-6 py-2 text-white rounded-md hover:bg-blue-700 transition-all"
            onClick={handleOnClick}
        >
            {text}
        </button>
    )
}

export default Button