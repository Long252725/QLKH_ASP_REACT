import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import dayjs from 'dayjs';
const Edit = ({url}) => {
    const {t} = useTranslation(['edit', 'common']);
    const [searchParams] = useSearchParams();
    const [errors, setErrors] = useState({}); // Lưu lỗi dưới dạng { ho: true, email: true }
    const [customer, setCustomer] = useState({});
    // const [customerDataBefore, setCustomerDataBefore] = useState({});
    const id = searchParams.get('id');
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [provinceCurrent, setProvinceCurrent] = useState();
    const [provinceId, setProvinceId] = useState();
    

    const [dateCurrent, setDateCurrent] = useState();
    const [districtCurrent, setDistrictCurrent] = useState();
    const [wardCurrent, setWardCurrent] = useState();
    // const [disabledBtn, setDisabledBtn] = useState(false);
    const [badInput, setBadInput] = useState(false);
    const [customerDataBefore, setCustomerDataBefore] = useState();
    // const [isBug, setIsBug] = useState(false);

    useEffect(() => {
        fetch(`${url.urlASP}/api/customer/edit/${id}`)
        .then(response => response.json())
        .then(data => {
            setCustomer(data);
            setCustomerDataBefore(data);
            setProvinceCurrent(data.province);
            setDistrictCurrent(data.district);
            setWardCurrent(data.ward);
            setDateCurrent(data.dateOfBirth)
        })
        .catch(error => console.error(error));
    }, [url.urlASP, id]);
        useEffect(() => {
            fetch('https://provinces.open-api.vn/api/v2/p/?depth=2')
                .then(res => res.json())
                .then(datas => {
                    setProvinces(datas);
                });
        }, []);
        useEffect(() => {
            if (customer.province) {
                fetch('https://provinces.open-api.vn/api/v2/p/?depth=2')
                    .then(res => res.json())
                    .then(provinces => {
                        const province = provinces.find(p => p.name === customer.province);
                        if (province) {
                            setProvinceId(province.code);
                            fetch(`https://provinces.open-api.vn/api/v2/p/${province.code}?depth=2`)
                                .then(res => res.json())
                                .then(datas => {
                                    setDistricts(datas.wards); });

                        }
                    });
            }
        }, [customer.province]);
        useEffect(() => {
            if (customer.district) {
                fetch(`https://provinces.open-api.vn/api/v2/p/${provinceId}?depth=2`)
                .then(res => res.json())
                .then(districts => {
                    const district = districts.wards.find(d => d.name === customer.district);
                    if (district) {
                        fetch(`https://provinces.open-api.vn/api/v2/w/${district.code}/to-legacies/`)
                        .then(res => res.json())
                        .then(datas => { 
                            setWards(datas); });
                    }
                })
            }
        }, [customer.district, provinceId]);
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
                dateOfBirth: t('logs.dateOfBirth_1')
            });
            } else if (new Date(e.target.value) >= new Date()) {
                setBadInput(false);
                setErrors({
                    ...errors,
                    dateOfBirth: t('logs.dateOfBirth_2')
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
                    sdt: t('logs.sdt_2')
                });

            } else if (!/^0[0-9]{9}$/.test(e.target.value) && e.target.value.length > 0) {
                setErrors({
                    ...errors,
                    sdt: t('logs.sdt_1')
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
                    email: t('logs.email_1')
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
                    [e.target.name]: t('logs.ho_ten_1')
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
            newErrors.dateOfBirth = t('logs.dateOfBirth_1');
        }
        if(dateObj > currentDate) {
            newErrors.dateOfBirth = t('logs.dateOfBirth_2');
        }
        if (!data.ho.trim()) {newErrors.ho = t('logs.ho_1')} else if (data.ho.trim().includes(' ')) {newErrors.ho = t('logs.ho_2')};
        if (!data.ten.trim()) {newErrors.ten = t('logs.ten_1')} else if (data.ten.trim().includes('.')) {newErrors.ten = t('logs.ten_2')}; 
        if (data.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|vn|net)$/.test(data.email)) {
            newErrors.email = t('logs.email_1');
        }
        if (data.sdt && !/^0[0-9]{9}$/.test(data.sdt)) newErrors.sdt = t('logs.sdt_1');
        if (data.sdt && !/^0/.test(data.sdt)) newErrors.sdt = t('logs.sdt_2');
        setErrors(newErrors);
        // Trả về true nếu không có lỗi nào (Object rỗng)
        return Object.keys(newErrors).length === 0;
    }, [badInput, t]);
        const isDisabled = useMemo(() => {
            if (!customerDataBefore || !customer) return true;

            const hasErrors = Object.values(errors).some(error => error && error !== "");
            const isUnchanged = JSON.stringify(customerDataBefore) === JSON.stringify(customer);
            
            return isUnchanged || hasErrors;
        }, [customerDataBefore, customer, errors]);
        const handleChangeAddress =(e) => {
            const {name, value} = e.target;
            setErrors({
                ...errors,
                [name]: false
            });
            
    
            if (name == "province") {
                setProvinceCurrent(e.target.options[e.target.selectedIndex].value);
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
                setDistrictCurrent(e.target.options[e.target.selectedIndex].value);
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
                setWardCurrent(e.target.options[e.target.selectedIndex].value);
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

            fetch(`${url.urlASP}/api/customer/updated`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(finalData)
            })
            .then(response => response.json())
            .then(() => {
                window.location.href = '/list';
            })
            .catch(error => console.error(error));

        }
        
    
    

    return (
        <div className="container max-w-7xl mx-auto flex flex-col gap-4 items-center my-10  ">
            <div className="font-bold text-2xl bg-blue-600 text-white p-2 rounded-lg px-8">{t('title')}</div>
            <div className="p-8 space-y-6">
            <input type="hidden" id="customerId" value="{{khachHang.customerId}}"/>
            <input type="hidden" id="mongoId" value="{{khachHang._id}}"/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className={`${errors.ho ? 'text-red-500' : 'text-slate-700'} text-sm font-semibold text-gray-700 mb-1 ${errors.ho ? 'text-red-500' : ''}`}>{t('ho')}<span className="text-red-500">*</span></label>
                    <input type="text" id="ho" name="ho"
                    onBlur={handleBlur}
                    placeholder={t('placeholder_ho')}
                     value={customer.ho} onChange={(e) => handleChange(e)}
                        className={`${errors.ho 
                                                    ? 'border-red-500 bg-red-50 focus:ring-red-100' 
                                                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                                                } border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                    />
                    {errors.ho && <p className="text-red-500 text-xs mt-1 italic">{errors.ho}</p>}
                </div>
                <div className="flex flex-col">
                    <label className={` text-sm font-semibold text-gray-700 mb-1`}>{t('ten_dem')}</label>
                    <input type="text" id="ho" name="tenDem" 
                    value={customer.tenDem} onChange={(e) => handleChange(e)}
                    placeholder={t('placeholder_ten_dem')}
                        className={`'border-slate-200 focus:ring-blue-100 focus:border-blue-500' border border-gray-300 p-2.5 rounded-lg focus:ring-2 outline-none transition-all`}/>
                </div>

                <div className="flex flex-col">
                    <label className={`${errors.ten ? 'text-red-500' : 'text-slate-700'} text-sm font-semibold text-gray-700 mb-1 ${errors.ten ? 'text-red-500' : ''}`}>{t('ten')}<span className="text-red-500">*</span></label>
                    <input type="text" id="ten" name="ten"
                    onBlur={handleBlur}
                    placeholder={t('placeholder_ten')}
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
                    <label className={`text-sm font-semibold text-gray-700 mb-1 ${errors.email ? 'text-red-500' : ''}`}>{t('email')}</label>
                    <input type="email" id="email" name="email" value={customer.email} onBlur={handleBlur} onChange={handleChange}
                        placeholder={t('placeholder_email')}
                        className={`${errors.email ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 italic">{errors.email}</p>}
                </div>

                <div className="flex flex-col">
                    <label  className="text-sm font-semibold text-gray-700 mb-1">{t('sdt')}</label>
                    <input type="text" id="sdt" name="sdt" value={customer.sdt} onBlur={handleBlur} onChange={handleChange}
                        placeholder={t('placeholder_sdt')}
                        className={`${errors.sdt ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                    />
                    {errors.sdt && <p className="text-red-500 text-xs mt-1 italic">{errors.sdt}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label  className="text-sm font-semibold text-gray-700 mb-1">{t('date_of_birth')}</label>
                    <input type="date" id="dateOfBirth" name="dateOfBirth" onBlur={handleBlur} onChange={(e) => handleChange(e)} value={dayjs(dateCurrent).format('YYYY-MM-DD')}
                        className={`${errors.dateOfBirth ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'} border border-gray-300  p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all `}/>
                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1 italic">{errors.dateOfBirth}</p>}
                </div>
 
                <div className="flex flex-col">
                    <label  className="text-sm font-semibold text-gray-700 mb-1">{t('common:gender.gender')}</label>
                    <select id="gender" name="gender" data-selected={customer.gender} onBlur={handleBlur} onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all">
                        <option value="Nam">{t('common:gender.male')}</option>
                        <option value="Nữ">{t('common:gender.female')}</option>
                        <option value="Khác">{t('common:gender.other')}</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="queQuan">
                    <select id="province" name="province" 
                    onChange={handleChangeAddress} 
                    value={provinceCurrent}
                    className="border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="" data-key="">{t('common:address.province')}</option>
                    {provinces.map((province) => (
                                        <option value={province.name} key={province.name} data-key={province.name}>{province.name}</option>
                                    ))}
                    </select>
                    <select id="district" name="district" 
                    onChange={handleChangeAddress} 
                    value={districtCurrent}
                    className="border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="" data-key="" selected>{t('common:address.district')}</option>
                    {(
                                    districts.map((district) => (
                                        <option value={district.name} key={district.name} data-key={district.name}>{district.name}</option>
                                        ))
                                )}
                    </select>
                    <select id="ward" name="ward" 
                    value={wardCurrent}
                    onChange={handleChangeAddress} className="border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="" data-key="" selected>{t('common:address.ward')}</option>
                        {(
                                    wards.map((ward) => (
                                        <option value={ward.name} key={ward.name} data-key={ward.name}>{ward.name}</option>
                                    ))
                                )}
                    </select>
                </div>
            </div>

            <div className="pt-4 flex gap-4">
                <a href="/list" className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl text-center transition-all">
                    {t('cancel')}
                </a>
                <button type="button" id="btnUpdate"  
                disabled={isDisabled}
                onClick={handleUpdate}
                    className={`flex-2 ${isDisabled ? 'bg-gray-400' : 'bg-amber-500 hover:bg-amber-600'} text-white font-bold py-3 rounded-xl shadow-lg transform transition-all active:scale-95`}>
                    {t('save')}
                </button>
            </div>
        </div>
        </div>
    )
}

export default Edit;