import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
const Edit = (url) => {
    const [searchParams] = useSearchParams();
    const [errors, setErrors] = useState({}); // Lưu lỗi dưới dạng { ho: true, email: true }
    const [customer, setCustomer] = useState({});
    const [customerDataBefore, setCustomerDataBefore] = useState({});
    const id = searchParams.get('id');
    const [provinces, setProvinces] = useState([]);
        const [districts, setDistricts] = useState([]);
        const [wards, setWards] = useState([]);
        useEffect(() => {
        fetch(`${url.url}/api/form/edit/${id}`)
        .then(response => response.json())
        .then(data => {
            console.log('TIM DUOC:', data);
            setCustomer(data);
            setCustomerDataBefore(data);
        })
        .catch(error => console.error(error));
    }, [url, id]);
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
            const {name, value} = e.target;
            setCustomer({
                ...customer,
                [name]: value
            });
        }
        const handleChangeAddress =(e) => {
            setErrors({
                ...errors,
                [e.target.name]: false
            });
            const {name, value} = e.target;
            setCustomer({
                ...customer,
                [name]: e.target.options[e.target.selectedIndex].text
            });
    
            if (name == "province") {
               fetch(`https://provinces.open-api.vn/api/v2/p/${value}?depth=2`)
                .then(res => res.json())
                .then(data => { setDistricts(data.wards); });
            } else if (name == "district") {
                fetch(`https://provinces.open-api.vn/api/v2/w/${value}/to-legacies/`)
                .then(res => res.json())
                .then(data => { setWards(data); });
            }
    
        }
        const handleUpdate = () => {
            if (!validateForm(customer)) {
                return
            }
            let dataBefore = {
            ...customer
            }
            let tenArray = dataBefore.ten.trim().split(' ');
            const finalData = {
                ...customer,
                ho: customer.ho.trim(),
                ten: tenArray.join(' '),
                tenDem: customer.tenDem.trim(),
                hoTenDayDu: `${customer.ho.trim()} ${customer.tenDem.trim()} ${tenArray.join(' ')}`
            };

            console.log('Submitted data:', finalData);
            fetch(`${url.url}/api/form/updated`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(finalData)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                window.location.href = '/list';
            })
            .catch(error => console.error(error));

        }
        const validateForm = (data) => {
        let newErrors = {};
        const dateObj = new Date(data.dateOfBirth);
        const currentDate = new Date();
        if(dateObj > currentDate) {
            newErrors.dateOfBirth = "Ngày sinh không được lớn hơn ngày hiện tại";
        }
        if (!data.ho.trim()) {newErrors.ho = "Vui lòng nhập họ"} else if (data.ho.trim().includes(' ')) {newErrors.ho = "Họ không được chứa khoảng trắng"};
        if (!data.ten.trim()) {newErrors.ten = "Vui lòng nhập tên"} else if (data.ten.trim().includes('.')) {newErrors.ten = "Tên không được chứa ký tự đặc biệt"}; 
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = "Email không đúng định dạng";
        }
        if (data.sdt && !/^0[0-9]{9}$/.test(data.sdt)) {newErrors.sdt = "Sai định dạng"};

        setErrors(newErrors);
        
        // Trả về true nếu không có lỗi nào (Object rỗng)
        return Object.keys(newErrors).length === 0;
    };
    
    

    return (
        <div className="container max-w-7xl mx-auto flex flex-col gap-4 items-center my-10  ">
            <div className="font-bold text-2xl bg-blue-600 text-white p-2 rounded-lg px-8">Chỉnh sửa khách Hàng</div>
            <p className="text-amber-100 text-center text-sm mt-1">Mã khách hàng: {id}</p>
            
            <div className="p-8 space-y-6">
            <input type="hidden" id="customerId" value="{{khachHang.customerId}}"/>
            <input type="hidden" id="mongoId" value="{{khachHang._id}}"/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className={`${errors.ho ? 'text-red-500' : 'text-slate-700'} text-sm font-semibold text-gray-700 mb-1 ${errors.ho ? 'text-red-500' : ''}`}>Họ:</label>
                    <input type="text" id="ho" name="ho" value={customer.ho} onChange={(e) => handleChange(e)}
                        className={`${errors.ho 
                                                    ? 'border-red-500 bg-red-50 focus:ring-red-100' 
                                                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                                                } border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                    />
                    {errors.ho && <p className="text-red-500 text-xs mt-1 italic">{errors.ho}</p>}
                </div>
                <div className="flex flex-col">
                    <label className={` text-sm font-semibold text-gray-700 mb-1`}>Tên đệm:</label>
                    <input type="text" id="ho" name="tenDem" value={customer.tenDem} onChange={(e) => handleChange(e)}
                        className={`'border-slate-200 focus:ring-blue-100 focus:border-blue-500' border border-gray-300 p-2.5 rounded-lg focus:ring-2 outline-none transition-all`}/>
                </div>

                <div className="flex flex-col">
                    <label className={`${errors.ten ? 'text-red-500' : 'text-slate-700'} text-sm font-semibold text-gray-700 mb-1 ${errors.ten ? 'text-red-500' : ''}`}>Tên:</label>
                    <input type="text" id="ten" name="ten" value={customer.ten} onChange={(e) => handleChange(e)}
                        className={`${errors.ten 
                                                    ? 'border-red-500 bg-red-50 focus:ring-red-100' 
                                                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                                                } border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                    />
                    {errors.ten && <p className="text-red-500 text-xs mt-1 italic">{errors.ten}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className={`text-sm font-semibold text-gray-700 mb-1 ${errors.email ? 'text-red-500' : ''}`}>Email:</label>
                    <input type="email" id="email" name="email" value=  {customer.email} onChange={(e) => handleChange(e)}
                        className={`${errors.email ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 italic">{errors.email}</p>}
                </div>

                <div className="flex flex-col">
                    <label  className="text-sm font-semibold text-gray-700 mb-1">Số điện thoại:</label>
                    <input type="text" id="sdt" name="sdt" value={customer.sdt} onChange={(e) => handleChange(e)}
                        className={`${errors.sdt ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                    />
                    {errors.sdt && <p className="text-red-500 text-xs mt-1 italic">{errors.sdt}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700">Ngày sinh hiện tại: <span className="text-amber-600 font-normal">{customerDataBefore.dateOfBirth}</span></label>
                    <label  className="text-sm font-semibold text-gray-700 mb-1">Ngày sinh:</label>
                    <input type="date" id="dateOfBirth" name="dateOfBirth" onChange={(e) => handleChange(e)} value={customer.dateOfBirth}
                        className={`${errors.dateOfBirth ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} border border-gray-300  p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all `}/>
                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1 italic">{errors.dateOfBirth}</p>}
                </div>
 
                <div className="flex flex-col">
                    <label  className="text-sm font-semibold text-gray-700 mb-1">Giới tính:</label>
                    <select id="gender" name="gender" data-selected={customer.gender} onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all">
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">Quê quán hiện tại: <span className="text-amber-600 font-normal">{customerDataBefore.province} - {customerDataBefore.district} - {customerDataBefore.ward}</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="queQuan">
                    <select id="province" name="province" onChange={(e) => handleChangeAddress(e)} className="border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((province) => (
                                        <option value={province.code} key={province.code}>{province.name}</option>
                                    ))}
                    </select>
                    <select id="district" name="district" onChange={(e) => handleChangeAddress(e)} className="border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    {districts.length > 0 ? (
                                    districts.map((district) => (
                                        <option value={district.code} key={district.code}>{district.name}</option>
                                    ))
                                ) : (
                                    <option value="">Chọn quận/huyện</option>
                                )}
                    </select>
                    <select id="ward" name="ward" onChange={(e) => handleChangeAddress(e)} className="border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    {wards.length > 0 ? (
                                    wards.map((ward) => (
                                        <option value={ward.code} key={ward.code}>{ward.name}</option>
                                    ))
                                ) : (
                                    <option value="">Chọn phường/xã</option>
                                )}
                    </select>
                </div>
            </div>

            <div className="pt-4 flex gap-4">
                <a href="/list" className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl text-center transition-all">
                    Hủy bỏ
                </a>
                <button type="button" id="btnUpdate"  onClick={handleUpdate}
                    className="flex-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-lg transform transition-all active:scale-95">
                    Lưu Thay Đổi
                </button>
            </div>
        </div>
        </div>
    )
}

export default Edit;