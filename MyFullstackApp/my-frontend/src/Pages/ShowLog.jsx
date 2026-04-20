import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const ShowLog = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { dataTrue = [], dataFalse = [], dataTrung = [], hint } = location.state || {};

    // --- LOGIC PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const [xemDataTrung, setXemDataTrung] = useState(false);
    const [xemDataDung, setXemDataDung] = useState(true);
    const [xemDataSai, setXemDataSai] = useState(false);
    const itemsPerPage = 10; // Số bản ghi trên mỗi trang
    const [totalPages, setTotalPages] = useState(Math.ceil(dataTrue.length / itemsPerPage));

    // Lấy dữ liệu của trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItemsTrue = dataTrue.slice(indexOfFirstItem, indexOfLastItem);
    const currentItemsFalse = dataFalse.slice(indexOfFirstItem, indexOfLastItem);
    const currentItemsTrung = dataTrung.slice(indexOfFirstItem, indexOfLastItem);

    const hasDataTrung = dataTrung.length > 0;
    const hasDataFalse = dataFalse.length > 0;

    const exportToExcel = (data, fileName) => {
        if (data.length === 0) return;
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSach");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };
    const handleXemDuLieuTrung = () => {
        setXemDataDung(false);
        setXemDataTrung(true);
        setCurrentPage(1);
        setTotalPages(Math.ceil(dataTrung.length / itemsPerPage));
        console.log('Xem dữ liệu trùng:', dataTrung);
    }
    const handleXemDuLieuSai = () => {
        setXemDataDung(false);
        setXemDataSai(true);
        setCurrentPage(1);
        setTotalPages(Math.ceil(dataFalse.length / itemsPerPage));
        console.log('Xem dữ liệu sai:', dataFalse);
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Kết quả xử lý dữ liệu</h1>

                {/* Thống kê (Giữ nguyên) */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                    <p className="text-gray-600 mb-4">
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                            <p className="text-xs text-green-600 font-semibold uppercase">Thành công</p>
                            <p className="text-3xl font-bold text-green-700">{dataTrue.length}</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-center">
                            <p className="text-xs text-amber-600 font-semibold uppercase">Trùng lặp</p>
                            <p className="text-3xl font-bold text-amber-700">{dataTrung.length}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                            <p className="text-xs text-red-600 font-semibold uppercase">Lỗi</p>
                            <p className="text-3xl font-bold text-red-700">{dataFalse.length}</p>
                        </div>
                    </div>
                </div>

                {/* Nút thao tác */}
                <div className="flex flex-wrap gap-4 mb-10">
                    {hasDataTrung && (
                        <div className='flex gap-2'>
                            <button onClick={() => exportToExcel(dataTrung, "du_lieu_trung")} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all active:scale-95 cursor-pointer gap-2">
                            <i class="fa-solid fa-file-arrow-down"></i> Tải dữ liệu trùng
                        </button>
                        <button onClick={handleXemDuLieuTrung} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all active:scale-95 cursor-pointer">
                            Xem dữ liệu trùng
                        </button>
                        </div>
                    )}
                    {hasDataFalse && (
                        <button onClick={() => exportToExcel(dataFalse, "du_lieu_loi")} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all active:scale-95 cursor-pointer gap-2">
                            <i class="fa-solid fa-file-arrow-down"></i>Tải dữ liệu lỗi
                        </button>
                    )}
                    {hasDataFalse && (
                        <button onClick={handleXemDuLieuSai} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all active:scale-95 cursor-pointer">
                            Xem dữ liệu lỗi
                        </button>
                    )}
                    <button onClick={() => navigate('/list')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all active:scale-95 cursor-pointer">
                        Xem danh sách khách hàng
                    </button>
                </div>

                {/* Bảng Preview với Phân trang */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {xemDataDung && <>
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-700">Xem trước dữ liệu thành công</h3>
                        <span className="text-sm text-gray-500">Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, dataTrue.length)} trong {dataTrue.length}</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Họ Tên</th>
                                    <th className="px-6 py-4 font-semibold">SDT</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold text-right">Địa chỉ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentItemsTrue.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.HoTenDayDu}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.Sdt}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.Email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 text-right">
                                            {`${item.Province} - ${item.District} - ${item.Ward}`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </>}
                    {xemDataTrung && <>
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-700">Xem trước dữ liệu trùng</h3>
                        <span className="text-sm text-gray-500">Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, dataFalse.length)} trong {dataFalse.length}</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Họ Tên</th>
                                    <th className="px-6 py-4 font-semibold">SDT</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold text-right">Địa chỉ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentItemsTrung.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.HoTenDayDu}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item['SDT']}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item['Email']}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 text-right">
                                            {`${item['Tỉnh/Thành Phố']} - ${item['Quận/Huyện']} - ${item['Phường/Xã']}`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </>}
                    {xemDataSai && <>
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-700">Xem trước dữ liệu trùng</h3>
                        <span className="text-sm text-gray-500">Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, dataFalse.length)} trong {dataFalse.length}</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Họ Tên</th>
                                    <th className="px-6 py-4 font-semibold">SDT</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold text-right">Địa chỉ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentItemsFalse.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.HoTenDayDu}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item['SDT']}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item['Email']}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 text-right">
                                            {`${item['Tỉnh/Thành Phố']} - ${item['Quận/Huyện']} - ${item['Phường/Xã']}`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </>}

                    {/* ĐIỀU KHIỂN PHÂN TRANG */}
                    {totalPages > 1 && (
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                            >
                                Trước
                            </button>

                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                                    >
                                        {i + 1}
                                    </button>
                                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                            </div>

                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShowLog;