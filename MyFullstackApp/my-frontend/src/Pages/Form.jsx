import { useState, useEffect } from 'react'
import {motion, AnimatePresence} from 'framer-motion'


const Form = (url) => {
    const [formData, setFormData] = useState({
        ho: '',
        ten: '',
        tenDem: '',
        email: '',
        sdt: '',
        dateOfBirth: '',
        gender: 'Nam',
        province: '',
        district: '',
        ward: '',
        hoTenDayDu: '',
        provinceId: '',
        districtId: '',
        wardId: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showSucess, setShowSucess] = useState(false);
    const [showFail, setShowFail] = useState(false);
    const [badInput, setBadInput] = useState(false);

    const [errors, setErrors] = useState({}); // Lưu lỗi dưới dạng { ho: true, email: true }
    // 2. State riêng cho danh sách Tỉnh/Huyện/Xã từ API
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/v2/p/?depth=2')
            .then(res => res.json())
            .then(data => setProvinces(data));

    }, []);

    const handleChange =(e) => {
        setErrors({
                ...errors,
                [e.target.name]: false
            });
            
        let name = e.target.name;
        if (name == 'ho' || name == 'ten' || name == 'tenDem') {
            e.target.value = e.target.value.replace(/[^A-Za-zÀ-ỹ\s]/g, "");
            e.target.maxLength = 20;
            e.target.value = e.target.value.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
        if (name == 'sdt') {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
            e.target.maxLength = 10;
        }
        let value = e.target.value;
        console.log(value)

        setFormData({
            ...formData,
            [name]: value
        });
    }
    const handleBlur = (e) => {
        if (e.target.name == 'dateOfBirth') {
            if (e.target.validity.badInput) {
            setBadInput(true);
            setErrors({
                ...errors,
                dateOfBirth: "Ngày sinh không hợp lệ"
            });
            } else if (new Date(e.target.value) >= new Date()) {
                setBadInput(false);
                setErrors({
                    ...errors,
                    dateOfBirth: "Ngày sinh không được lớn hơn ngày hiện tại"
                });
            } else {
                setBadInput(false);
                setErrors({
                    ...errors,
                    dateOfBirth: ""
                });
            }
        } else if (e.target.name == 'sdt') {

            if (!/^0/.test(e.target.value) && e.target.value.length > 0) {
                setErrors({
                    ...errors,
                    sdt: "SDT cần bắt đầu bằng 0"
                });
            } else if (!/^0[0-9]{9}$/.test(e.target.value) && e.target.value.length > 0) {
                setErrors({
                    ...errors,
                    sdt: "SDT cần đủ 10 chữ số"
                });
            } else {
                setErrors({
                    ...errors,
                    sdt: ""
                });
            }
        } else if (e.target.name == 'email') {
            if (e.target.value.length > 0 && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|vn|net)$/.test(e.target.value)) {
                setErrors({
                    ...errors,
                    email: "Email không đúng định dạng"
                });
            } else {
                setErrors({
                    ...errors,
                    email: ""
                });
            }
        } else if (e.target.name == 'ho' || e.target.name == 'ten') {
            if (!e.target.value) {
                setErrors({
                    ...errors,
                    [e.target.name]: "Họ và tên không được để trống"
                });
            } else {
                setErrors({
                    ...errors,
                    [e.target.name]: ""
                });
            }
        }
        
    }

    const handleFocus = (e) => {
        console.log(e.target.name);
    }
    const handleChangeAddress =(e) => {
            setErrors({
                ...errors,
                [e.target.name]: false
            });
        const {name, value} = e.target;
        

        if (name == "province") {
            setDistricts([]);
            setWards([]);
            setFormData({
                ...formData,
                provinceId: e.target.options[e.target.selectedIndex].value,
                province: e.target.options[e.target.selectedIndex].text
            });

           if (value) {
            fetch(`https://provinces.open-api.vn/api/v2/p/${value}?depth=2`)
            .then(res => res.json())
            .then(data => { 
                setDistricts(data.wards);
                
            });
           }
        } else if (name == "district") {
            setWards([]);
            setFormData({
                ...formData,
                districtId: e.target.options[e.target.selectedIndex].value,
                district: e.target.options[e.target.selectedIndex].text
            });
            if (value) {
            fetch(`https://provinces.open-api.vn/api/v2/w/${value}/to-legacies/`)
            .then(res => res.json())
            .then(data => { setWards(data); });
            }
        } else if (name == "ward") {
         setFormData({
                ...formData,
                wardId: e.target.options[e.target.selectedIndex].value,
                ward: e.target.options[e.target.selectedIndex].text
            });
        }

    }

    const validateForm = () => {
    let newErrors = {};
    console.log(formData.dateOfBirth);
    const dateObj = new Date(formData.dateOfBirth);
    const currentDate = new Date();
    // if (!formData.dateOfBirth) {
    //     newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
    // }
    if(badInput && !formData.dateOfBirth) {
        newErrors.dateOfBirth = "Ngày sinh không hợp lệ";
    }
    if(dateObj > currentDate) {
        newErrors.dateOfBirth = "Ngày sinh không được lớn hơn ngày hiện tại";
    }
    if (!formData.ho.trim()) {newErrors.ho = "Vui lòng nhập họ"} else if (formData.ho.trim().includes(' ')) {newErrors.ho = "Họ không được chứa khoảng trắng"};
    if (!formData.ten.trim()) {newErrors.ten = "Vui lòng nhập tên"} else if (formData.ten.trim().includes('.')) {newErrors.ten = "Tên không được chứa ký tự đặc biệt"}; 
    if (formData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|vn|net)$/.test(formData.email)) {
        newErrors.email = "Email không đúng định dạng";
    }
    if (formData.sdt && !/^0[0-9]{9}$/.test(formData.sdt)) newErrors.sdt = "SDT cần đủ 10 chữ số";
    if (formData.sdt && !/^0/.test(formData.sdt)) newErrors.sdt = "SDT cần bắt đầu phải bằng 0";

    setErrors(newErrors);
    
    // Trả về true nếu không có lỗi nào (Object rỗng)
    return Object.keys(newErrors).length === 0;
};
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm() || isLoading) return; // Nếu đang load thì không cho chạy tiếp

        setIsLoading(true); // Bắt đầu load
        let dataBefore = {
            ...formData
        }
        let tenArray = dataBefore.ten.trim().split(/\s+/);
        let ho2 = dataBefore.ho.trim();
        let tenDem2 = dataBefore.tenDem.trim();
        let ten2 = tenArray.join(' ');
        let hoTenDayDu2 = tenDem2 ? `${ho2} ${tenDem2} ${tenArray.join(' ')}` : `${ho2} ${tenArray.join(' ')}`;
        console.log('tenArray', tenArray);
        const finalData = {
            ...formData,
            ho: ho2,
            ten: ten2,
            tenDem: tenDem2,
            hoTenDayDu: hoTenDayDu2
        };
        console.log("Form submitted:", finalData);
        console.log("URL:", url);
        fetch(`${url.url}/api/form/add`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(finalData)
        })
        .then(res => res.json())
        .then(() => {
            setShowSucess(true)
            setTimeout(()=> {
                setShowSucess(false)
            }, 1000)
        })
        .catch(error => {
            console.error('Error:', error);
            setShowFail(true)
            setTimeout(()=> {
                setShowFail(false)
            }, 1000)
        })
        .finally(() => {
            setIsLoading(false); // Xong dù thành công hay thất bại thì mở lại nút
    });
        
    }




    return (
        <>
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <AnimatePresence>
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
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-2xl shadow-blue-100 rounded-3xl overflow-hidden border border-slate-100">
                    
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-md">
                            <i className="fa-solid fa-user-plus text-white text-2xl"></i>
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Đăng Ký Khách Hàng</h2>
                        <p className="text-blue-100 mt-2 text-sm">Vui lòng điền đầy đủ thông tin bên dưới để khởi tạo tài khoản mới</p>
                    </div>

                    <div className="p-8 sm:p-10 space-y-8">
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                <i className="fa-solid fa-id-card text-blue-600"></i>
                                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Thông tin định danh</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                <label htmlFor="ho" className={`${errors.ho ? 'text-red-500' : 'text-slate-700'} block text-sm font-bold mb-2 group-focus-within:text-blue-600 transition-colors`}>Họ<span className="text-red-500">*</span></label>
                                    <input 
                                    type="text" 
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    id="ho" name="ho" onChange={handleChange} value={formData.ho} 
                                        className={`${errors.ho 
                                                    ? 'border-red-500 bg-red-50' 
                                                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                                                } w-full border p-3 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50/50 focus:bg-white placeholder:text-slate-400`}
                                        placeholder="Ví dụ: Nguyễn"/>
                                        {errors.ho && <p className="text-red-500 text-xs mt-1 italic">{errors.ho}</p>}

                                </div>
                                <div className="group">
                                    <label htmlFor="ten" className={`text-slate-700 block text-sm font-bold mb-2 group-focus-within:text-blue-600 transition-colors`}>Tên đệm</label>
                                    <input type="text"
                                    onFocus={handleFocus}
                                    
                                     id="tenDem" name="tenDem" onChange={handleChange} value={formData.tenDem} 
                                        className={` w-full border p-3 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50/50 focus:bg-white placeholder:text-slate-400`} 
                                        placeholder="Ví dụ: Thị"/>
                                </div>
                                <div className="group">
                                    <label htmlFor="ten" className={`${errors.ten ? 'text-red-500' : 'text-slate-700'} block text-sm font-bold mb-2 group-focus-within:text-blue-600 transition-colors`}>Tên<span className="text-red-500">*</span></label>
                                    <input type="text" 
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                     id="ten" name="ten" onChange={handleChange} value={formData.ten} 
                                        className={`${errors.ten 
                                                    ? 'border-red-500 bg-red-50' 
                                                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                                                } w-full border p-3 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-slate-50/50 focus:bg-white placeholder:text-slate-400`} 
                                        placeholder="Ví dụ: Văn A"/>
                                        {errors.ten && <p className="text-red-500 text-xs mt-1 italic">{errors.ten}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                <i className="fa-solid fa-envelope-open-text text-blue-600"></i>
                                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Thông tin liên lạc</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-blue-600 transition-colors" >Email</label>
                                    <div className="relative">
                                        <div className='flex items-center '>
                                            <span className={`absolute ${errors.email? 'mb-4.5' : ''} flex left-0 justify-center items-center inset-y-0 pl-3 text-slate-400`}>
                                            <i className="fa-solid fa-at"></i>
                                        </span>
                                        <input type="email" 
                                        maxLength={30}
                                        onBlur={handleBlur}
                                        placeholder="example@gmail.com"
                                        onFocus={handleFocus} id="email" name="email" onChange={handleChange}  values={formData.email}
                                            className={` ${errors.email ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'}  w-full border pl-10 p-3 rounded-xl focus:ring-4 focus:ring-blue-100  outline-none transition-all bg-slate-50/50 focus:bg-white`} 
                                        />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs mt-1 italic">{errors.email}</p>}

                                    </div>
                                </div>
                                <div className="group">
                                    <label htmlFor="sdt" className={`${errors.sdt ? 'text-red-500' : 'text-slate-700'} block text-sm font-bold  mb-2  transition-colors`}>Số điện thoại</label>
                                    <div className="relative">
                                        <div className='flex items-center '>
                                            <span className={`absolute ${errors.sdt ? 'mb-4.5' : ''} flex left-0 justify-center items-center inset-y-0 pl-3 text-slate-400`}>
                                                <i className="fa-solid fa-phone"></i>
                                            </span>
                                            <input type="text" 
                                            onBlur={handleBlur}
                                            placeholder="Nhập số điện thoại"
                                            onFocus={handleFocus} id="sdt" name="sdt"  onChange={handleChange} values={formData.sdt}
                                                className={`w-full border ${errors.sdt ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} pl-10 p-3 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-slate-50/50 focus:bg-white`} 
                                            />
                                        </div>
                                        {errors.sdt && <p className="text-red-500 text-xs mt-1 italic">{errors.sdt}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label htmlFor="dateOfBirth" className="block text-sm font-bold text-slate-700 mb-2">Ngày sinh</label>
                                <input type="date" id="dateOfBirth" name="dateOfBirth" 
                                onBlur={handleBlur}
                                onChange={handleChange} values={formData.dateOfBirth}
                                    className={"w-full border " + (errors.dateOfBirth ? 'border-red-500 bg-red-50 focus:ring-red-100'  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500') + " p-3 rounded-xl focus:ring-4 outline-none transition-all bg-slate-50/50 focus:bg-white"}
                                />
                                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1 italic">{errors.dateOfBirth}</p>}
                            </div>
                            <div className="group">
                                <label htmlFor="gender" className="block text-sm font-bold text-slate-700 mb-2">Giới tính</label>
                                <select id="gender" name="gender" 
                                 
                                 onChange={handleChange} values={formData.gender}
                                    className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700">Quê quán (Địa chỉ thường trú)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="queQuan">
                                <select name="province"
                                   id="province" 
                                   onChange={handleChangeAddress} className="border border-slate-200 p-3 rounded-xl bg-slate-50/50 focus:ring-4 focus:ring-blue-100 outline-none pr-1 transition-all cursor-pointer">
                                    <option value="">Chọn tỉnh/Thành phố</option>
                                    {provinces.map((province) => (
                                        <option value={province.code} key={province.code}>{province.name}</option>
                                    ))}
                                </select>
                                <select name="district" id="district" 
                                onChange={handleChangeAddress} className="border border-slate-200 p-3 rounded-xl bg-slate-50/50 focus:ring-4 focus:ring-blue-100 outline-none transition-all cursor-pointer">
                                <option value="">Chọn quận/huyện</option>
                                {(
                                    districts.map((district) => (
                                        <option value={district.code} key={district.code}>{district.name}</option>
                                    ))
                                )}
                                </select>
                                <select id="ward" name="ward" 
                                onChange={handleChangeAddress} className="border border-slate-200 p-3 rounded-xl bg-slate-50/50 focus:ring-4 focus:ring-blue-100 outline-none transition-all cursor-pointer">
                                <option value="">Chọn phường/xã</option>
                                {wards.map((ward) => (
                                    <option value={ward.code} key={ward.code}>{ward.name}</option>
                                ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button type="submit" id="btnSubmit" onClick={handleSubmit}
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95">
                                <i className="fa-solid fa-circle-check"></i>
                                Xác Nhận Đăng Ký
                            </button>
                            <a href="/list" className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-600 font-bold py-4 rounded-2xl transition-all hover:-translate-y-1 active:scale-95">
                                <i className="fa-solid fa-list-ul"></i>
                                Danh Sách KH
                            </a>
                        </div>

                        <div id="box-show" className="mt-4 flex justify-center"></div>
                    </div>
                </div>
                
            </div>
        </div>
        </>
    )
}

export default Form