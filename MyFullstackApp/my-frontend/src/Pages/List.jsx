import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const List = (url) => {
    console.log("list", url)
    const [customers, setCustomers] = useState([]);
    const [checkAll, setCheckAll] = useState(false);
    const [showSucess, setShowSucess] = useState(false);
    const [showFail, setShowFail] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;
    const fetchCustomer = useCallback((page) => {
    fetch(`${url.url}/api/form/list?page=${page}&pageSize=${pageSize}`)
        .then(res => res.json())
        .then(res => {
            const updatedData = res.data.map(item => ({ ...item, isChecked: false }));
            setCustomers(updatedData);
            setTotalPages(res.totalPages);
            console.log('Total pages:', res.totalPages);
        });
}, [url]); // Chỉ tạo lại hàm nếu currentPage thay đổi
        useEffect(() => {
            // Gọi API kèm theo tham số page
            fetchCustomer(currentPage);
        }, [currentPage, fetchCustomer]); // Hễ currentPage thay đổi là tự động fetch lại
    // Chọn tất cả hoặc bỏ chọn tất cả
        const handleCheckAll = (e) => {
            const isChecked = e.target.checked;
            setCheckAll(isChecked);
            setCustomers(customers.map(c => ({ ...c, isChecked })));
        };
        // Chọn từng dòng một
        const handleCheckItem = (id) => {
            setCustomers(customers.map(c => 
                c.id === id ? { ...c, isChecked: !c.isChecked } : c
            ));
        };
    const handleConfirmDelete = () => {
        const selectedIds = customers.filter(c => c.isChecked).map(c => c.id);
        setConfirmDelete(true);
        if(selectedIds.length === 0) {
            setShowAlert(true);
            setConfirmDelete(false);
            setTimeout(() => {
                setShowAlert(false);
            }, 1000);
            return;
        }
        
    }
    const handleOnChangeSearch = (e) => {
    if(e.target.value === "") {
        fetchCustomer(currentPage);
        return;
    }
        fetch(`${url.url}/api/form/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: e.target.value }) // Gửi thẳng giá trị từ State
    })
    .then(res => res.json())
    .then(res => {
        if (res.data.length === 0) {
            setCustomers(res.data);
        } else {
            setCustomers(res.data);
        }
    })
    .catch(err => console.error(err));

    }

    const handleDeleteSelected = () => {
        setConfirmDelete(false);
        const selectedIds = customers.filter(c => c.isChecked).map(c => c.id);
        setIsLoading(true);
        console.log('Xóa các khách hàng có ID:', selectedIds);
        // Gọi API xóa ở đây
        fetch(`${url.url}/api/form/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(selectedIds),
        })
        .then(response => response.json())
        .then(() => {
            setCheckAll(false)
            // Cập nhật lại danh sách khách hàng
            fetchCustomer(currentPage);
            console.log(totalPages)
            // Hiển thị thông báo thành công
            
            setTimeout(() => {
                setShowSucess(false);
            }, 1000);
        })
        .catch(error => {
            console.error(error);
            setShowFail(true);
            setTimeout(() => {
                setShowFail(false);
            }, 1000);
        })
        .finally(()=> {
            setIsLoading(false);
        })
    };
    const handleEdit = (id) => {
        console.log('Sửa khách hàng có ID:', id);
        // Chuyển hướng đến trang sửa
        window.location.href = `/edit?id=${id}`;
    };
    return (
        <>
            <div className="container max-w-7xl mx-auto  flex flex-col gap-4 items-center my-5">
            <div>
                <AnimatePresence>
                    {showAlert && (
                                                    <motion.div 
                                                        key="alert" // Thêm key để React định danh
                                                        initial={{ opacity: 0, x: 100 }} // Đổi thành x nếu bạn muốn "vuốt từ phải qua"
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 100 }}
                                                        transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                                                        className="fixed top-5 right-5 z-50 flex items-center gap-2 justify-center bg-yellow-500 text-white px-5 py-2 rounded shadow-lg"
                                                    >
                                                        <i className="fa-solid fa-circle-check"></i>
                                                        <p>Bạn chưa chọn khách hàng nào !</p>
                                                    </motion.div>
                                                )} 

                    
                    {isLoading && (
                                                <motion.div 
                                                    key="loading-alert" // Thêm key để React định danh
                                                    initial={{ opacity: 0, x: 100 }} // Đổi thành x nếu bạn muốn "vuốt từ phải qua"
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 100 }}
                                                    transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                                                    className="fixed top-5 right-5 z-50 flex items-center gap-2 justify-center bg-yellow-500 text-white px-5 py-2 rounded shadow-lg"
                                                >
                                                    <i className="fa-solid fa-circle-check"></i>
                                                    <p>Đang xử lý...</p>
                                                </motion.div>
                                            )}
                    {showSucess && (
                        <motion.div 
                            key="success-alert" // Thêm key để React định danh
                            initial={{ opacity: 0, x: 100 }} // Đổi thành x nếu bạn muốn "vuốt từ phải qua"
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                            className="fixed top-5 right-5 z-50 flex items-center gap-2 justify-center bg-green-500 text-white px-5 py-2 rounded shadow-lg"
                        >
                            <i className="fa-solid fa-circle-check"></i>
                            <p>Thao tác thành công!</p>
                        </motion.div>
                    )}

                    {showFail && (
                        <motion.div 
                            key="fail-alert"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                            className="fixed top-5 right-5 z-50 flex items-center gap-2 justify-center bg-red-500 text-white px-5 py-2 rounded shadow-lg"
                        >
                            <i className="fa-solid fa-circle-xmark"></i>
                            <p>Thao tác thất bại!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
                </div>
                    <div className="flex gap-2 w-full">
                        <div className="relative flex items-center w-full max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <i className="fa-solid fa-magnifying-glass text-slate-400 text-sm"></i>
                            </div>
                            
                            <input 
                                type="text" 
                                id="searchInput"
                                // value={searchTerm} // Gắn giá trị vào State\
                                onChange={handleOnChangeSearch}
                                // onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder-slate-400
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                        transition-all duration-200 shadow-sm" 
                                placeholder="Tìm kiếm khách hàng..." 
                            />
                        </div>

                        <button id="btnDeleteSelected" onClick={handleConfirmDelete} className= "w-24 font-bold bg-red-500 p-2 rounded hover:cursor-pointer">Xoá</button>
                        <a href="/form">
                            <button id="themBtn" className="w-24 bg-green-500 font-bold p-2 rounded hover:cursor-pointer">Thêm</button>
                        </a>
                    </div>
                    <div className="w-full bg-yellow-500 flex flex-col items-center">
                        <div className="w-full bg-[#2563eb] text-white font-bold text-[12px] uppercase tracking-[0.05em]  grid grid-cols-[50px_1.5fr_1fr_2fr_1fr_0.8fr_1.5fr_100px] gap-[15px] items-center px-[20px] py-[12px]">
                            <input type="checkbox" checked={checkAll} onChange={handleCheckAll}/>
                            <div className="name">Họ Tên</div>
                            <div className="sdt">SDT</div>
                            <div className="email">Email</div>
                            <div className="dateOfBirth">Ngày Sinh</div>
                            <div className="gender">Giới tính</div>
                            <div className="address">Quê quán</div>
                            <div className="thaoTac">Thao tác</div>
                        </div>
                        <div>
                            {confirmDelete && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="absolute w-100 h-50 my-[-100px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black z-100 border border-blue-500 rounded flex flex-col items-center justify-around">
                                    <div className='text-white font-bold text-lg'>Xác nhận xoá khách hàng?</div>
                                    <div className="flex gap-2 justify-around w-full">
                                        <button className="mt-2 w-30 rounded bg-amber-500 px-5 py-1 hover:cursor-pointer hover:bg-amber-600" onClick={() => setConfirmDelete(false)}>Huỷ</button>
                                        <button className="mt-2 w-30 rounded bg-blue-500 px-5 py-1 hover:cursor-pointer hover:bg-blue-600" onClick={handleDeleteSelected}>Xác nhận</button>
                                    </div>
                                </div>
                                </div>
                            )}
                        </div>
                        <div className="w-full">
                        {customers.map(customer => {
                            return (
                                <div className="bg-white text-black font-bold text-[12px] tracking-[0.05em]  grid grid-cols-[50px_1.5fr_1fr_2fr_1fr_0.8fr_1.5fr_100px] gap-[15px] items-center px-[20px] py-[12px]">
                                <input type="checkbox"
                                        checked={customer.isChecked || false} 
                                        onChange={() => handleCheckItem(customer.id)}
                                />
                                <div className="name">{customer.hoTenDayDu}</div>
                                <div className="sdt">{customer.sdt}</div>
                                <div className="email">{customer.email}</div>
                                <div className="dateOfBirth">{customer.dateOfBirth}</div>
                                <div className="gender">{customer.gender}</div>
                                <div className="address">{customer.province} - {customer.district} - {customer.ward}</div>
                                <button className="bg-yellow-500 text-white px-2 py-1 rounded hover:cursor-pointer hover:bg-yellow-600" onClick={() => handleEdit(customer.id)}>Sửa</button>
                            </div>
                            )
                        })}
                            
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                    <button 
                        disabled={currentPage == 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="px-4 py-2 bg-slate-200 rounded disabled:opacity-50 hover:cursor-pointer"
                    >
                        Trước
                    </button>

                    <span className="py-2">{totalPages > 0 ? `Trang ${currentPage} / ${totalPages}` : "Không có dữ liệu"}</span>

                    <button 
                        disabled={currentPage == totalPages || totalPages < 1}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="px-4 py-2 bg-slate-200 rounded disabled:opacity-50 hover:cursor-pointer"
                    >
                        Sau
                    </button>
                </div>

            </div>
        </>
    )
}

export default List