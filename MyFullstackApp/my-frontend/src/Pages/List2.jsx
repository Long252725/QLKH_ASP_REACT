import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Test = ({url}) => {
    const [customers, setCustomers] = useState([]);
    const [checkAll, setCheckAll] = useState(false);
    const [showSucess, setShowSucess] = useState(false);
    const [showFail, setShowFail] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSearch, setCurrentPageSearch] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const [totalPagesSearch, setTotalPagesSearch] = useState(0);
    const [showFilter, setShowFilter] = useState(false);   
    const [provinces, setProvinces] = useState([]);
    const [objectFilter, setObjectFilter] = useState({
        provinceId: '',
        gender: '',
        dob: ''
    });
    const [isUpName, setIsUpName] = useState(true);
    // --- CSS Styles cơ bản ---
    const pageSize = 10;
    const fetchCustomer = useCallback((page) => {
    if(!isSearching) {
        fetch(`${url.urlASP}/api/form/list?page=${page}&pageSize=${pageSize}&isUpName=${isUpName}`)
        .then(res => res.json())
        .then(res => {
            const updatedData = res.data.map(item => ({ ...item, isChecked: false }));
            setCustomers(updatedData);
            setTotalPages(res.totalPages);
        });
    }
}, [url.urlASP, isUpName, isSearching]);
    
    useEffect(() => {
            fetch('https://provinces.open-api.vn/api/v2/p/?depth=2')
                .then(res => res.json())
                .then(datas => {
                    setProvinces(datas);
                });
        }, []);

    const formatDate = (dateString) => {
        return dateString.split('-').reverse().join('-');
    };
    const handleLoc = () => {
        setShowFilter(!showFilter);
    };
    const handleInputChange = (e) => {
        if(e.target.name == 'province') {
            setObjectFilter({...objectFilter, provinceId: e.target.value});
        } else if (e.target.name == 'gender') {
            setObjectFilter({...objectFilter, gender: e.target.value});
        } else if (e.target.name == 'dob') {
            setObjectFilter({...objectFilter, dob: e.target.value});
        }
    };
    const applyFilter = () => {
        // Gọi API search với objectFilter
        setCurrentPageSearch(1); 
        setIsSearching(true);
        fetchSearchData();
    };
    const resetFilter = () => {
        const emptyFilter = {
            provinceId: '',
            gender: '',
            dob: ''
        };
        setObjectFilter(emptyFilter);
        fetchSearchDataWithFilter(emptyFilter);
        setIsSearching(false);

    };

const fetchSearchData = () => {
    fetchSearchDataWithFilter(objectFilter);
};
useEffect(() => {
        fetchSearchData();
    }, [isUpName]);
const fetchSearchDataWithFilter = (filter) => {
    setIsLoading(true)
    fetch(`${url.urlASP}/api/form/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name: searchTerm,
            page: currentPageSearch, // Luôn lấy giá trị mới nhất từ state
            pageSize: pageSize,
            ...filter,
            isUpName: isUpName
        }),
    })
    .then(res => res.json())
    .then(res => {
        const updatedData = res.data.map(item => ({ ...item, isChecked: false }));
        setCustomers(updatedData);
        setTotalPagesSearch(res.totalPages);
        setIsLoading(false)
        setShowSucess(true);
        setTimeout(()=> {
            setShowSucess(false)   
        }, 3000)
    })
    .catch(error => console.error('Search error:', error));
};
useEffect(() => {
    if (isSearching && searchTerm !== "") {
        fetchSearchData();
    }
}, [currentPageSearch, isSearching]); 


// Chỉ tạo lại hàm nếu currentPage thay đổi
        useEffect(() => {
            // Gọi API kèm theo tham số page
            fetchCustomer(currentPage);
        }, [currentPage, fetchCustomer, isUpName]); // Hễ currentPage thay đổi là tự động fetch lại
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
            }, 3000);
            return;
        }
        
    }
    const handleOnChangeSearch = (e) => {
        setSearchTerm(e.target.value);
    }

    const handleSearch = () => {
    if (searchTerm === "") {
        setIsSearching(false);
        setCurrentPage(1); // Reset về trang 1 của danh sách thường
        fetchCustomer(1);
    } else {
        setIsSearching(true);
        setCurrentPageSearch(1); // QUAN TRỌNG: Reset về trang 1 khi tìm mới
        // Nếu trang đang là 1 sẵn rồi, useEffect sẽ không tự trigger, 
        // nên ta cần gọi trực tiếp hoặc đảm bảo logic trigger đúng.
        fetchSearchData(); 
    }
};

    const handleDeleteSelected = () => {
        setConfirmDelete(false);
        const selectedIds = customers.filter(c => c.isChecked).map(c => c.id);
        setIsLoading(true);
        
        console.log('Xóa các khách hàng có ID:', selectedIds);
        // Gọi API xóa ở đây
        fetch(`${url.urlASP}/api/form/delete`, {
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
            // Hiển thị thông báo thành công
                setShowSucess(true);
                setIsLoading(false);
            setTimeout(() => {
                setShowSucess(false);
            }, 3000);
        })
        .catch(error => {
            console.error(error);
            setShowFail(true);
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
            setTimeout(() => {
                setShowFail(false);
            }, 3000);
        })
        .finally(()=> {
            
        })
    };
    const handleEdit = (id) => {
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
                                value={searchTerm} // Gắn giá trị vào State\
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                onChange={handleOnChangeSearch}
                                // onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder-slate-400
                                        focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent
                                        transition-all duration-200 shadow-sm" 
                                placeholder="Tìm kiếm theo tên khách hàng..." 
                            />
                        </div>

                        <button id="btnSearch" onClick={handleSearch} className= "w-24 text-white font-bold bg-[#2563eb] p-2 rounded hover:cursor-pointer hover:bg-blue-800 flex items-center justify-center gap-2"><i className="fa-solid fa-magnifying-glass"></i>Tìm</button>
                        <button id="btnLoc" onClick={handleLoc} className= "w-24 text-white font-bold bg-[#2563eb] p-2 rounded hover:cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-800"><i className="fa-solid fa-filter"></i>Lọc</button>
                        
                        <button id="btnReload" onClick={()=> {window.location.reload()}} className= "px-3 text-white font-bold bg-[#2563eb] p-2 rounded hover:cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-800"><i className="fa-solid fa-arrows-rotate"></i> Refresh</button>
                        <button id="btnDeleteSelected" onClick={handleConfirmDelete} className= "w-24 text-white font-bold bg-red-500 p-2 rounded hover:cursor-pointer flex items-center justify-center gap-2 hover:bg-red-800"><i className="fa-solid fa-trash"></i>Xoá</button>
                        <a href="/form">
                            <button id="themBtn" className="w-24 bg-green-500 text-white font-bold p-2 rounded hover:cursor-pointer flex items-center justify-center gap-2 hover:bg-green-800"><i className="fa-solid fa-plus"></i>Thêm</button>
                        </a>
                        
                    </div>
                    {/* Filter Box */}
                    <div className="flex w-full">
                        { showFilter && (
                        <div className="border sticky top-1 text-black font-bold text-[12px] uppercase tracking-[0.05em] border-slate-300 rounded-lg bg-slate-50 w-80 mr-1 h-fit">
                        <div className="font-bold text-[12px] font-bold mb-4 bg-[#2563eb] text-white w-full rounded-t p-3">Bộ lọc</div>
                        <div className="px-4 pb-4 h-fit flex flex-col justify-between">
                        <div className="mb-4 flex justify-between">
                            <label>Ngày sinh:</label>
                            <input type="date" name="dob" 
                            value={objectFilter.dob}
                             onChange={handleInputChange}
                              />
                        </div>

                        <div className="mb-4 flex justify-between">
                            <label>Giới tính:</label>
                            <select name="gender" 
                            value={objectFilter.gender} 
                            onChange={handleInputChange}
                            >
                            <option value="">Tất cả</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                            </select>
                        </div>

                        <div className="mb-4 flex justify-between">
                            <label>Địa chỉ:</label>
                            <select name="province" 
                            value={objectFilter.provinceId}
                             onChange={handleInputChange}
                             className="w-[70%] text-end"
                             >
                             <option value="" >Tất cả</option>
                            {provinces.map(province => (
                                <option key={province.code} value={province.code}>{province.name}</option>
                            ))}
                            </select>
                        </div>

                        <div className="mt-4 flex w-full justify-between">
                            <button 
                            onClick={applyFilter} 
                            
                            className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:cursor-pointer">Áp dụng</button>
                            <button 
                            onClick={resetFilter} 
                            
                            className="bg-red-500 text-white px-4 py-2 rounded hover:cursor-pointer">Xóa lọc</button>
                        </div>
                        </div>
                        </div>
                    )}
                        <div className="w-full bg-white flex flex-col items-center min-h-140 rounded ">
                        <div className="w-full rounded-t bg-[#2563eb] text-white font-bold text-[12px] uppercase tracking-[0.05em]  grid grid-cols-[50px_1.5fr_1fr_1fr_1fr_0.8fr_1.5fr_100px] gap-3.75 items-center px-5 py-3">
                            <input type="checkbox" 
                            checked={checkAll} onChange={handleCheckAll}
                            />
                            <div className="name flex items-center gap-3">Họ Tên {
                                isUpName ? <i className="fa-solid fa-arrow-up-short-wide cursor-pointer" onClick={() => setIsUpName(!isUpName)}></i> : <i className="fa-solid fa-arrow-down-wide-short cursor-pointer" onClick={() => setIsUpName(!isUpName)}></i>
                            }</div>
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
                                    <div className="absolute w-100 h-50 my-[-100px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black z-100 border border-[#2563eb] rounded flex flex-col items-center justify-around">
                                    <div className='text-white font-bold text-lg'>Xác nhận xoá {customers.filter(c => c.isChecked).length} khách hàng?</div>
                                    <div className="flex gap-2 justify-around w-full">
                                        <button className="mt-2 w-30 rounded bg-amber-500 px-5 py-1 hover:cursor-pointer hover:bg-amber-600" onClick={() => setConfirmDelete(false)}>Huỷ</button>
                                        <button className="mt-2 w-30 rounded bg-[#2563eb] px-5 py-1 hover:cursor-pointer hover:bg-blue-600" onClick={handleDeleteSelected}>Xác nhận</button>
                                    </div>
                                </div>
                                </div>
                            )}
                        </div>
                        <div className="w-full border border-slate-300">
                        {customers.length>0 ?customers.map(customer => {
                            return (
                                <div className="bg-white text-black font-bold text-[12px] tracking-[0.05em]  grid grid-cols-[50px_1.5fr_1fr_1fr_1fr_0.8fr_1.5fr_100px] gap-[15px] items-center px-[20px] py-[12px]">
                                <input type="checkbox"
                                        checked={customer.isChecked || false} 
                                        onChange={() => handleCheckItem(customer.id)}
                                />
                                <div className="name">{customer.hoTenDayDu}</div>
                                <div className="sdt">{customer.sdt}</div>
                                <div className="email">{customer.email}</div>
                                <div className="dateOfBirth">{formatDate(customer.dateOfBirth)}</div>
                                <div className="gender">{customer.gender}</div>
                                <div className="address">{customer.province} - {customer.district} - {customer.ward}</div>
                                <button className="bg-yellow-500 text-white px-2 py-1 rounded hover:cursor-pointer hover:bg-yellow-600" onClick={() => handleEdit(customer.id)}>Sửa</button>
                            </div>
                            )
                        }): <div className="text-center p-10">Không có dữ liệu</div>}
                            
                        </div>
                    </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                    {isSearching ? (
                      <>
                        <button 
                        disabled={currentPageSearch == 1}
                        onClick={() => setCurrentPageSearch(prev => prev - 1)}
                        className="px-4 py-2 bg-slate-200 rounded disabled:opacity-50 hover:cursor-pointer"
                    >
                        Trước
                    </button>

                    <span className="py-2">{totalPagesSearch > 0 ? `Trang ${currentPageSearch} / ${totalPagesSearch}` : "Không có dữ liệu"}</span>

                    <button 
                        disabled={currentPageSearch == totalPagesSearch || totalPagesSearch < 1}
                        onClick={() => setCurrentPageSearch(prev => prev + 1)}
                        className="px-4 py-2 bg-slate-200 rounded disabled:opacity-50 hover:cursor-pointer"
                    >
                        Sau
                    </button>
                      </>   
                    ) : (
                        <>
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
                        </>
                    )}
                </div>

            </div>
        </>
    )
}

export default Test