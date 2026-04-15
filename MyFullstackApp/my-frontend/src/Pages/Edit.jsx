import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
const Edit = (url) => {
    const [searchParams] = useSearchParams();
    const [errors, setErrors] = useState({}); // Lưu lỗi dưới dạng { ho: true, email: true }
    const [customer, setCustomer] = useState({});
    // const [customerDataBefore, setCustomerDataBefore] = useState({});
    const id = searchParams.get('id');
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [provinceIdCurrent, setProvinceIdCurrent] = useState();

    const [dateCurrent, setDateCurrent] = useState();
    const [districtIdCurrent, setDistrictIdCurrent] = useState();
    const [wardIdCurrent, setWardIdCurrent] = useState();
    const [disabledBtn, setDisabledBtn] = useState(false);
    const [badInput, setBadInput] = useState(false);
    const [customerDataBefore, setCustomerDataBefore] = useState();
    const [isBug, setIsBug] = useState(false);

    useEffect(() => {
        fetch(`${url.url}/api/form/edit/${id}`)
        .then(response => response.json())
        .then(data => {
            console.log('TIM DUOC:', data);
            setCustomer(data);
            setCustomerDataBefore(data);
            setProvinceIdCurrent(data.provinceId);
            setDistrictIdCurrent(data.districtId);
            setWardIdCurrent(data.wardId);
            setDateCurrent(data.dateOfBirth)
        })
        .catch(error => console.error(error));
    }, [url, id]);
        useEffect(() => {
            fetch('https://provinces.open-api.vn/api/v2/p/?depth=2')
                .then(res => res.json())
                .then(datas => {
                    setProvinces(datas);
                });
        }, []);
        useEffect(() => {
            if (customer.provinceId) {
                fetch(`https://provinces.open-api.vn/api/v2/p/${customer.provinceId}?depth=2`)
                    .then(res => res.json())
                    .then(datas => {
                        setDistricts(datas.wards); });
            }
        }, [customer.provinceId]);
        useEffect(() => {
            if (customer.districtId) {
                fetch(`https://provinces.open-api.vn/api/v2/w/${customer.districtId}/to-legacies/`)
                .then(res => res.json())
                .then(datas => { 
                    setWards(datas); });
            }
        }, [customer.districtId]);
        const handleChange =(e) => {
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
            setDateCurrent(value)
            setErrors({
                ...errors,
                [name]: false
            });
            setCustomer({
                ...customer,
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
    const validateForm = useCallback((data) => {
        let newErrors = {};
        const dateObj = new Date(data.dateOfBirth);
        const currentDate = new Date();
        if(badInput && !data.dateOfBirth) {
            newErrors.dateOfBirth = "Ngày sinh không hợp lệ";
        }
        if(dateObj > currentDate) {
            newErrors.dateOfBirth = "Ngày sinh không được lớn hơn ngày hiện tại";
        }
        if (!data.ho.trim()) {newErrors.ho = "Vui lòng nhập họ"} else if (data.ho.trim().includes(' ')) {newErrors.ho = "Họ không được chứa khoảng trắng"};
        if (!data.ten.trim()) {newErrors.ten = "Vui lòng nhập tên"} else if (data.ten.trim().includes('.')) {newErrors.ten = "Tên không được chứa ký tự đặc biệt"}; 
        if (data.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|vn|net)$/.test(data.email)) {
            newErrors.email = "Email không đúng định dạng";
        }
        if (data.sdt && !/^0[0-9]{9}$/.test(data.sdt)) newErrors.sdt = "SDT cần đủ 10 chữ số";
        if (data.sdt && !/^0/.test(data.sdt)) newErrors.sdt = "SDT cần bắt đầu phải bằng 0";
        setErrors(newErrors);
        // Trả về true nếu không có lỗi nào (Object rỗng)
        return Object.keys(newErrors).length === 0;
    }, [badInput]);
        useEffect(() => {
            console.log('customerDataBefore', customerDataBefore);
            console.log('customer', customer);
            if (customerDataBefore && customer) {
                const hasErrors = Object.values(errors).some(error => error && error !== "");
                const isDisabled = JSON.stringify(customerDataBefore) === JSON.stringify(customer) || hasErrors;
                setDisabledBtn(isDisabled);
            }
        }, [customerDataBefore, customer, errors]);
        const handleChangeAddress =(e) => {
            console.log('change')
            const {name, value} = e.target;
            setErrors({
                ...errors,
                [name]: false
            });
            
    
            if (name == "province") {
                setProvinceIdCurrent(e.target.options[e.target.selectedIndex].value);
                setDistricts([]);
                setWards([]);
                setCustomer({
                ...customer,
                province: e.target.options[e.target.selectedIndex].getAttribute('data-key'),
                provinceId: e.target.options[e.target.selectedIndex].value,
                district: '',
                districtId: '',
                ward: '',
                wardId: ''
            });
                if (value) {
               fetch(`https://provinces.open-api.vn/api/v2/p/${value}?depth=2`)
                .then(res => res.json())
                .then(datas => { 
                    setDistricts(datas.wards); });
                }
            } else if (name == "district") {
                setDistrictIdCurrent(e.target.options[e.target.selectedIndex].value);
                setWards([]);
                setCustomer({
                ...customer,
                district: e.target.options[e.target.selectedIndex].getAttribute('data-key'),
                districtId: e.target.options[e.target.selectedIndex].value,
                ward: '',
                wardId: ''
            });
                if (value) {
                fetch(`https://provinces.open-api.vn/api/v2/w/${value}/to-legacies/`)
                .then(res => res.json())
                .then(datas => { 
                    setWards(datas); });
                }
            } else if (name == "ward") {
                setWardIdCurrent(e.target.options[e.target.selectedIndex].value);
                setCustomer({
                ...customer,
                ward: e.target.options[e.target.selectedIndex].getAttribute('data-key'),
                wardId: e.target.options[e.target.selectedIndex].value
            });
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
                hoTenDayDu: `${customer.ho.trim()} ${customer.tenDem.trim()} ${tenArray.join(' ')}`,
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
        
    
    

    return (
        <div className="container max-w-7xl mx-auto flex flex-col gap-4 items-center my-10  ">
            <div className="font-bold text-2xl bg-blue-600 text-white p-2 rounded-lg px-8">Chỉnh sửa khách Hàng</div>
            <div className="p-8 space-y-6">
            <input type="hidden" id="customerId" value="{{khachHang.customerId}}"/>
            <input type="hidden" id="mongoId" value="{{khachHang._id}}"/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className={`${errors.ho ? 'text-red-500' : 'text-slate-700'} text-sm font-semibold text-gray-700 mb-1 ${errors.ho ? 'text-red-500' : ''}`}>Họ:</label>
                    <input type="text" id="ho" name="ho"
                    onBlur={handleBlur}
                    placeholder="Ví dụ: Nguyễn"
                     value={customer.ho} onChange={(e) => handleChange(e)}
                        className={`${errors.ho 
                                                    ? 'border-red-500 bg-red-50 focus:ring-red-100' 
                                                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                                                } border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                    />
                    {errors.ho && <p className="text-red-500 text-xs mt-1 italic">{errors.ho}</p>}
                </div>
                <div className="flex flex-col">
                    <label className={` text-sm font-semibold text-gray-700 mb-1`}>Tên đệm:</label>
                    <input type="text" id="ho" name="tenDem" 
                    value={customer.tenDem} onChange={(e) => handleChange(e)}
                    placeholder="Ví dụ: Thị"
                        className={`'border-slate-200 focus:ring-blue-100 focus:border-blue-500' border border-gray-300 p-2.5 rounded-lg focus:ring-2 outline-none transition-all`}/>
                </div>

                <div className="flex flex-col">
                    <label className={`${errors.ten ? 'text-red-500' : 'text-slate-700'} text-sm font-semibold text-gray-700 mb-1 ${errors.ten ? 'text-red-500' : ''}`}>Tên:</label>
                    <input type="text" id="ten" name="ten"
                    onBlur={handleBlur}
                    placeholder="Ví dụ: Văn A"
                     value={customer.ten} onChange={(e) => handleChange(e)}
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
                    <input type="email" id="email" name="email" value={customer.email} onBlur={handleBlur} onChange={handleChange}
                        placeholder="Nhập email"
                        className={`${errors.email ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 italic">{errors.email}</p>}
                </div>

                <div className="flex flex-col">
                    <label  className="text-sm font-semibold text-gray-700 mb-1">Số điện thoại:</label>
                    <input type="text" id="sdt" name="sdt" value={customer.sdt} onBlur={handleBlur} onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                        className={`${errors.sdt ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                    />
                    {errors.sdt && <p className="text-red-500 text-xs mt-1 italic">{errors.sdt}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label  className="text-sm font-semibold text-gray-700 mb-1">Ngày sinh:</label>
                    <input type="date" id="dateOfBirth" name="dateOfBirth" onBlur={handleBlur} onChange={(e) => handleChange(e)} value={dateCurrent}
                        className={`${errors.dateOfBirth ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} border border-gray-300  p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all `}/>
                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1 italic">{errors.dateOfBirth}</p>}
                </div>
 
                <div className="flex flex-col">
                    <label  className="text-sm font-semibold text-gray-700 mb-1">Giới tính:</label>
                    <select id="gender" name="gender" data-selected={customer.gender} onBlur={handleBlur} onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all">
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="queQuan">
                    <select id="province" name="province" 
                    onChange={handleChangeAddress} 
                    value={provinceIdCurrent}
                    className="border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="" data-key="">Chọn tỉnh/thành phố</option>
                    {provinces.map((province) => (
                                        <option value={province.code} key={province.name} data-key={province.name}>{province.name}</option>
                                    ))}
                    </select>
                    <select id="district" name="district" 
                    onChange={handleChangeAddress} 
                    value={districtIdCurrent}
                    className="border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="" data-key="" selected>Chọn quận/huyện</option>
                    {(
                                    districts.map((district) => (
                                        <option value={district.code} key={district.name} data-key={district.name}>{district.name}</option>
                                        ))
                                )}
                    </select>
                    <select id="ward" name="ward" 
                    value={wardIdCurrent}
                    onChange={handleChangeAddress} className="border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="" data-key="" selected>Chọn phường/xã</option>
                        {(
                                    wards.map((ward) => (
                                        <option value={ward.code} key={ward.name} data-key={ward.name}>{ward.name}</option>
                                    ))
                                )}
                    </select>
                </div>
            </div>

            <div className="pt-4 flex gap-4">
                <a href="/list" className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl text-center transition-all">
                    Hủy bỏ
                </a>
                <button type="button" id="btnUpdate"  
                disabled={disabledBtn}
                onClick={handleUpdate}
                    className={`flex-2 ${disabledBtn ? 'bg-gray-400' : 'bg-amber-500 hover:bg-amber-600'} text-white font-bold py-3 rounded-xl shadow-lg transform transition-all active:scale-95`}>
                    Lưu Thay Đổi
                </button>
            </div>
        </div>
        </div>
    )
}

export default Edit;