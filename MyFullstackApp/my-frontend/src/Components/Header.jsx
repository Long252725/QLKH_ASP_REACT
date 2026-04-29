import { useTranslation } from "react-i18next";
export default function Header() {
    const {i18n} = useTranslation();
    const handleChangeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    }
    return (
        <header className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Quản Lý Khách Hàng</h1>
            <div>
                <select name="language" 
                value={i18n.language}
                onChange={(e) => handleChangeLanguage(e)}
                id="language" 
                className="border border-slate-200 p-2 rounded-xl bg-slate-50/50 focus:ring-4 focus:ring-blue-100 outline-none transition-all cursor-pointer">
                    <option value="vi" className="text-black">Tiếng Việt</option>
                    <option value="en" className="text-black">English</option>
                </select>
            </div>
        </header>
    );
}