import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const ShowLog = () => {
    const {t} = useTranslation('import');
    const location = useLocation();
    const navigate = useNavigate();
    const { dataTrue = [], dataFalse = [], dataTrung = [] } = location.state || {};

    // 1. Quản lý chế độ xem bằng 1 state: 'true' | 'false' | 'trung'
    const [viewMode, setViewMode] = useState('true');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 2. Tự động xác định dữ liệu nguồn dựa trên viewMode (Dùng useMemo để tối ưu)
    const activeData = useMemo(() => {
        if (viewMode === 'trung') return dataTrung;
        if (viewMode === 'false') return dataFalse;
        return dataTrue;
    }, [viewMode, dataTrue, dataFalse, dataTrung]);

    const totalPages = Math.ceil(activeData.length / itemsPerPage);

    // 3. Lấy dữ liệu của trang hiện tại
    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return activeData.slice(start, start + itemsPerPage);
    }, [activeData, currentPage]);

    const handleSwitchView = (mode) => {
        setViewMode(mode);
        setCurrentPage(1); // Reset trang về 1 khi đổi bảng
    };
    const handleExportErrors = async (dataFalse) => {
        // 1. Khởi tạo Workbook và Worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh sách lỗi');

        // 2. Định nghĩa các cột (Key phải khớp với thuộc tính trong object dataFalse)
        worksheet.columns = [
            { header: 'Họ', key: 'ho', width: 15 },
            { header: 'Tên Đệm', key: 'tenDem', width: 15 },
            { header: 'Tên', key: 'ten', width: 15 },
            { header: 'Giới tính', key: 'gender', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'SDT', key: 'sdt', width: 20 },
            { header: 'Ngày Sinh', key: 'dateOfBirth', width: 20 },
            { header: 'Tỉnh/TP', key: 'province', width: 20 },
            { header: 'Quận/Huyện', key: 'district', width: 20 },
            { header: 'Phường/Xã', key: 'ward', width: 20 }
        ];

        // 3. Style cho Header (Cho đẹp và chuyên nghiệp)
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4F81BD' }
        };

        // 4. Duyệt qua dữ liệu lỗi và tô màu
        dataFalse.forEach((item) => {
            // Thêm một dòng mới dựa trên object item
            const row = worksheet.addRow(item);
            console.log("Dòng dữ liệu lỗi:", item);
            console.log(item.errorFields);

            // Kiểm tra danh sách ErrorFields từ Server gửi về
            if (item.errorFields && item.errorFields.length > 0) {
            item.errorFields.forEach((field) => {
                // field từ server là "Email", "Sdt" -> chuyển thành "email", "sdt" để khớp key
                const cell = row.getCell(field.toLowerCase());

                // Tô màu đỏ nhạt cho ô bị lỗi
                cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFC7CE' }, // Màu đỏ nhạt (Excel chuẩn)
                };

                // Chữ đỏ đậm để dễ nhìn
                cell.font = {
                color: { argb: 'FF9C0006' },
                bold: true
                };

                // Thêm viền cho ô lỗi (Tùy chọn)
                cell.border = {
                top: { style: 'thin', color: { argb: 'FF9C0006' } },
                left: { style: 'thin', color: { argb: 'FF9C0006' } },
                bottom: { style: 'thin', color: { argb: 'FF9C0006' } },
                right: { style: 'thin', color: { argb: 'FF9C0006' } }
                };
            });
            }
        });

        // 5. Xuất file và tải về
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Danh_Sach_Loi_Import_${new Date().getTime()}.xlsx`);
        };
    const exportToExcel = (data, fileName) => {
        if (data.length === 0) return;
    // Map dữ liệu sang định dạng mới với Key là tên cột tiếng Việt
        const formattedData = data.map((item, index) => ({
            "STT": index + 1,
            "Họ": item.ho,
            "Tên Đệm": item.tenDem,
            "Tên": item.ten,
            "Giới tính": item.gender,
            "Email": item.email,
            "SDT": item.sdt,
            "Ngày sinh": item.dateOfBirth ? dayjs(item.dateOfBirth).format('DD/MM/YYYY') : '---',
            "Tỉnh/TP": item.province,
            "Quận/Huyện": item.district,
            "Phường/Xã": item.ward
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSach");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">{t('title')}</h1>

                {/* --- THỐNG KÊ --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: t('label_success'), count: dataTrue.length, color: 'green', mode: 'true' },
                        { label: t('label_duplicate'), count: dataTrung.length, color: 'amber', mode: 'trung' },
                        { label: t('label_fail'), count: dataFalse.length, color: 'red', mode: 'false' }
                    ].map((stat) => (
                        <div 
                            key={stat.mode}
                            onClick={() => handleSwitchView(stat.mode)}
                            className={`p-5 rounded-xl cursor-pointer transition-all shadow-sm
                                ${viewMode === stat.mode ? `border-${stat.color}-200 bg-${stat.color}-100 scale-105` : `border-${stat.color}-100 bg-${stat.color}-50 hover:bg-${stat.color}-100`}`}
                        >
                            <p className={`text-xs text-${stat.color}-600 font-bold uppercase`}>{stat.label}</p>
                            <p className={`text-3xl font-black text-${stat.color}-700`}>{stat.count}</p>
                        </div>
                    ))}
                </div>

                {/* --- NÚT THAO TÁC --- */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <button onClick={() => exportToExcel(dataTrung, "du_lieu_trung")} className={` ${dataTrung.length > 0 ? 'bg-amber-500' : 'bg-gray-300'} cursor-pointer hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium shadow transition-all active:scale-95 flex items-center gap-2`}>
                        <i className="fa-solid fa-file-arrow-down"></i> {t('download_data_duplicate')}
                    </button>
                    <button onClick={async () => {await handleExportErrors(dataFalse)}} className={`${dataFalse.length > 0 ? 'bg-red-500' : 'bg-gray-300'} cursor-pointer hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium shadow transition-all active:scale-95 flex items-center gap-2`}>
                        <i className="fa-solid fa-file-arrow-down"></i> {t('download_data_fail')}
                    </button>
                    <button onClick={() => exportToExcel(dataTrue, "du_lieu_thanh_cong")} className={`${dataTrue.length > 0 ? 'bg-green-500' : 'bg-gray-300'} cursor-pointer hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium shadow transition-all active:scale-95 flex items-center gap-2`}>
                        <i className="fa-solid fa-file-arrow-down"></i> {t('download_data_success')}
                    </button>
                    <button onClick={() => navigate('/list')} className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow transition-all  ml-auto">
                        {t('back_to_list')}
                    </button>
                    <button onClick={() => navigate('/form')} className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium shadow transition-all ">
                        {t('add')}
                    </button>
                </div>

                {/* --- BẢNG DỮ LIỆU --- */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 capitalize">
                            {t('lits')} {viewMode === 'trung' ? t('label_duplicate') : viewMode === 'false' ? t('label_fail') : t('label_success')}
                        </h3>
                        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {t('page')} {currentPage} / {totalPages || 1}
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                                    <th className="px-6 py-4">{t('ho_ten')}</th>
                                    <th className="px-6 py-4">{t('date_of_birth')}</th>
                                    <th className="px-6 py-4">{t('sdt')} / {t('email')}</th>
                                    <th className="px-6 py-4 text-right">{t('address')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentItems.length > 0 ? currentItems.map((item, index) => (
                                    <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900">{item.hoTenDayDu}</div>
                                            <div className="text-[10px] text-gray-400">{item.gender}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.dateOfBirth ? dayjs(item.dateOfBirth).format('DD/MM/YYYY') : '---'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{item.sdt}</div>
                                            <div className="text-xs text-blue-500 italic">{item.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 text-right">
                                            {item.province}, {item.district}, {item.ward}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10 text-gray-400">{t('logs.noData')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- PHÂN TRANG --- */}
                    {totalPages > 1 && (
                        <div className="cursor-pointer  p-4 bg-gray-50 border-t border-gray-100 flex justify-center items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentPage == 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                            >{t('page_back')}</button>
                            
                            {[...Array(totalPages)].map((_, i) => (
                                (i + 1 === 1 || i + 1 === totalPages || Math.abs(i + 1 - currentPage) <= 1) && (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`cursor-pointer w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                                            >
                                        {i + 1}
                                    </button>
                                )
                            ))}

                            <button 
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                            >{t('page_next')}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShowLog;