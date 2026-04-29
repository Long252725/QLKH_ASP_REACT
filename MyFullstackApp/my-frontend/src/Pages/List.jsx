import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BoxConfirmDelete from '../Components/BoxConfirmDelete';
import NavigateBottom from '../Components/NavigateBottom';
import dayjs from 'dayjs';

const List = ({ url }) => {
  const { t } = useTranslation('list');
  const urlASP = url.urlASP;
  const [showAlert, setShowAlert] = useState(false);
  // const [checkAll, setCheckAll] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showFail, setShowFail] = useState(false);
  const [showSucess, setShowSucess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [pageSizeSate, setPageSizeState] = useState(10);
  const [idSelected, setIdSelected] = useState([]);
  const [detailCustomer, setDetailCustomer] = useState({});
  const [objectSearch, setObjectSearch] = useState({
    keyword: '',
    province: '',
    sortBy: '',
    gender: '',
    dobFrom: '',
    dobTo: '',
    page: 1,
    pageSize: pageSizeSate,
  });
  const [totalPages, setTotalPages] = useState();
  const formatDateString = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN'); // Kết quả: 28/04/2026
  };
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v2/p/?depth=2')
      .then((res) => res.json())
      .then((datas) => {
        setProvinces(datas);
      });
  }, []);
  const fetchCustomers = useCallback(
    (searchParams) => {
      setIsLoading(true);
      // Tắt các alert cũ trước khi bắt đầu đợt fetch mới
      setShowSucess(false);
      setShowFail(false);

      const query = new URLSearchParams(searchParams).toString();
      fetch(`${urlASP}/api/customer/search?${query}`)
        .then((res) => res.json())
        .then((data) => {
          const updatedData = data.items.map((item) => ({ ...item, isChecked: false }));
          setCustomers(updatedData);
          setTotalPages(data.totalPages);

          // Xử lý mượt: Tắt loading xong mới hiện Success
          setIsLoading(false);
          setTimeout(() => {
            setShowSucess(true);
            setTimeout(() => setShowSucess(false), 3000);
          }, 100); // Delay nhẹ 100ms để transition của Loading kịp exit
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
          setShowFail(true);
          setTimeout(() => setShowFail(false), 2000);
        });
    },
    [urlASP],
  );

  useEffect(() => {
    fetchCustomers(objectSearch);
  }, [objectSearch, fetchCustomers]);

  const handleSelect = (id) => {
    console.log('Selected customer ID:', id);
    setDetailCustomer(customers.find((customer) => customer.id === id));
  };
  const handleEdit = (id) => {
    // Chuyển hướng đến trang sửa
    window.location.href = `/edit?id=${id}`;
  };
  const handleDelete = (id) => {
    setConfirmDelete(true);
    setIdSelected([id]);
  };
  const handleOnChangeSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleSearch = (pageSize) => {
    console.log('Search term:', searchTerm);

    pageSize
      ? setObjectSearch((prev) => ({ ...prev, page: 1, keyword: searchTerm, pageSize: pageSize }))
      : setObjectSearch((prev) => ({ ...prev, page: 1, keyword: searchTerm }));
  };
  // delete

  const handleConfirmDelete = () => {
    console.log('Selected IDs for deletion:', idSelected);
    if (idSelected.length === 0) {
      setShowAlert(true);
      setConfirmDelete(false);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } else {
      setConfirmDelete(true);
    }
  };
  const handleCheckItem = (id) => {
    setIdSelected(
      idSelected.includes(id) ? idSelected.filter((item) => item !== id) : [...idSelected, id],
    );
  };

  const handleDeleteSelected = () => {
    setConfirmDelete(false);
    setIsLoading(true);
    // Gọi API xóa ở đây
    fetch(`${urlASP}/api/customer/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(idSelected),
    })
      .then((response) => response.json())
      .then(() => {
        // setCheckAll(false)
        // Cập nhật lại danh sách khách hàng
        setIdSelected([]);
        fetchCustomers(objectSearch);
        // Hiển thị thông báo thành công
        setShowSucess(true);
        setIsLoading(false);
        setTimeout(() => {
          setShowSucess(false);
        }, 3000);
      })
      .catch((error) => {
        console.error(error);
        setShowFail(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        setTimeout(() => {
          setShowFail(false);
        }, 3000);
      })
      .finally(() => {});
  };
  // Filter
  const handleInputChange = (e) => {
    if (e.target.name == 'province') {
      setObjectSearch({ ...objectSearch, province: e.target.value });
    } else if (e.target.name == 'gender') {
      setObjectSearch({ ...objectSearch, gender: e.target.value });
    } else if (e.target.name == 'dobFrom') {
      setObjectSearch({ ...objectSearch, dobFrom: e.target.value });
    } else if (e.target.name == 'dobTo') {
      setObjectSearch({ ...objectSearch, dobTo: e.target.value });
    }
  };
  return (
    <>
      <div className="mx-auto my-10 flex w-[98%] flex-col items-center gap-3">
        <div>
          <div className="fixed top-25 right-5 z-50 flex flex-col items-end gap-2 rounded px-5 py-2 text-white">
            <AnimatePresence>
              {showAlert && (
                <motion.div
                  key="alert" // Thêm key để React định danh
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="z-50 flex items-center justify-center gap-2 rounded bg-yellow-500 px-5 py-2 text-white shadow-lg"
                >
                  <i className="fa-solid fa-circle-check"></i>
                  <p>{t('logs.showAlert')}</p>
                </motion.div>
              )}

              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="z-50 flex items-center gap-3 rounded bg-blue-600 px-5 py-2 text-white shadow-xl"
                >
                  {/* Vòng xoay Tailwind */}
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <p className="font-medium">{t('logs.isLoading')}</p>
                </motion.div>
              )}

              {showSucess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="z-50 flex items-center gap-2 rounded bg-green-500 px-5 py-2 text-white shadow-lg"
                >
                  <i className="fa-solid fa-check-circle"></i>
                  <p>{t('logs.showSuccess')}</p>
                </motion.div>
              )}
              {showFail && (
                <motion.div
                  key="fail-alert"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="z-50 flex items-center justify-center gap-2 rounded bg-red-500 px-5 py-2 text-white shadow-lg"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                  <p>{t('logs.showFail')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex w-full gap-2">
          <div className="relative flex w-full max-w-md items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="fa-solid fa-magnifying-glass text-sm text-slate-400"></i>
            </div>

            <input
              type="text"
              id="searchInput"
              value={searchTerm} // Gắn giá trị vào State\
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(pageSizeSate)}
              onChange={handleOnChangeSearch}
              className="block w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-10 text-sm placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#2563eb] focus:outline-none"
              placeholder={t('placeholder_search')}
            />
          </div>

          <button
            id="btnSearch"
            onClick={() => {
              handleSearch(pageSizeSate);
            }}
            className="flex w-24 items-center justify-center gap-2 rounded bg-[#2563eb] p-2 font-bold text-white hover:cursor-pointer hover:bg-blue-800"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            {t('search')}
          </button>
          <button
            id="btnLoc"
            onClick={() => {
              setShowFilter(!showFilter);
            }}
            className="flex w-24 items-center justify-center gap-2 rounded bg-[#2563eb] p-2 font-bold text-white hover:cursor-pointer hover:bg-blue-800"
          >
            <i className="fa-solid fa-filter"></i>
            {t('filter')}
          </button>

          <button
            id="btnReload"
            onClick={() => {
              window.location.reload();
            }}
            className="flex items-center justify-center gap-2 rounded bg-[#2563eb] p-2 px-3 font-bold text-white hover:cursor-pointer hover:bg-blue-800"
          >
            <i className="fa-solid fa-arrows-rotate"></i> {t('refresh')}
          </button>
          <button
            id="btnDeleteSelected"
            onClick={handleConfirmDelete}
            className="flex w-24 items-center justify-center gap-2 rounded bg-red-500 p-2 font-bold text-white hover:cursor-pointer hover:bg-red-800"
          >
            <i className="fa-solid fa-trash"></i>
            {t('delete')}
          </button>
          <a href="/form">
            <button
              id="themBtn"
              className="flex w-24 items-center justify-center gap-2 rounded bg-green-500 p-2 font-bold text-white hover:cursor-pointer hover:bg-green-800"
            >
              <i className="fa-solid fa-plus"></i>
              {t('add')}
            </button>
          </a>
        </div>
        {/* Filter Box */}
        {/* showFilter */}
        <div className="grid w-full grid-cols-[1fr_4.5fr_1fr] gap-2">
          <div className="h-fit w-full overflow-hidden rounded  bg-white">
            {showFilter && (
              <div className='border border-slate-200 shadow-sm rouned'>
                <div className="border-b border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <i className="fa-solid fa-filter text-blue-500"></i>
                    <h3 className="text-xs font-bold tracking-wider uppercase">{t('filter')}</h3>
                  </div>
                </div>

                <div className="flex flex-col gap-5 p-4">
                  {/* Section: Ngày sinh */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[11px] font-bold tracking-tight text-slate-400 uppercase">
                      {t('filter_dateOfBirth')}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="relative">
                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">
                          Từ
                        </span>
                        <input
                          type="date"
                          name="dobFrom"
                          value={objectSearch.dobFrom}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-10 text-sm transition-all outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">
                          Đến
                        </span>
                        <input
                          type="date"
                          name="dobTo"
                          value={objectSearch.dobTo}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-10 text-sm transition-all outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Giới tính */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold tracking-tight text-slate-400 uppercase">
                      {t('filter_gender')}
                    </label>
                    <select
                      name="gender"
                      value={objectSearch.gender}
                      onChange={handleInputChange}
                      className="w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm transition-all outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">{t('filter_gender_all')}</option>
                      <option value="Nam">{t('filter_gender_male')}</option>
                      <option value="Nữ">{t('filter_gender_female')}</option>
                      <option value="Khác">{t('filter_gender_other')}</option>
                    </select>
                  </div>

                  {/* Section: Địa chỉ */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold tracking-tight text-slate-400 uppercase">
                      {t('filter_address')}
                    </label>
                    <select
                      name="province"
                      value={objectSearch.province}
                      onChange={handleInputChange}
                      className="w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm transition-all outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">{t('filter_address_all')}</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Footer: Nút Reset */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (Object.values(objectSearch).some((val) => val !== '')) {
                          setObjectSearch({
                            ...objectSearch,
                            province: '',
                            gender: '',
                            dobFrom: '',
                            dobTo: '',
                          });
                        }
                      }}
                      className="group flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-600 hover:text-white active:scale-95"
                    >
                      <i className="fa-solid fa-filter-circle-xmark transition-transform group-hover:rotate-12"></i>
                      {t('clear_filter')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex h-fit w-full flex-col items-center rounded bg-white shadow-sm">
            <div className="grid w-full grid-cols-[50px_1fr_0.8fr_1.3fr_0.8fr_0.5fr_2fr_100px] items-center gap-3.75 rounded-t bg-[#2563eb] px-5 py-3 text-[12px] font-bold tracking-[0.05em] text-white uppercase">
              <div></div>
              <div className="name flex items-center gap-3">
                {t('table_name')}
                {objectSearch.sortBy === 'HoTenDayDu_asc' && (
                  <i
                    className="fa-solid fa-arrow-up-z-a cursor-pointer"
                    onClick={() => setObjectSearch({ ...objectSearch, sortBy: 'HoTenDayDu_desc' })}
                  ></i>
                )}
                {objectSearch.sortBy === 'HoTenDayDu_desc' && (
                  <i
                    className="fa-solid fa-arrow-down-z-a cursor-pointer"
                    onClick={() => setObjectSearch({ ...objectSearch, sortBy: '' })}
                  ></i>
                )}
                {objectSearch.sortBy === '' && (
                  <i
                    className="fa-solid fa-sort cursor-pointer"
                    onClick={() => setObjectSearch({ ...objectSearch, sortBy: 'HoTenDayDu_asc' })}
                  ></i>
                )}
              </div>
              <div className="sdt">{t('table_phone')}</div>
              <div className="email">{t('table_email')}</div>
              <div className="dateOfBirth">{t('table_dateOfBirth')}</div>
              <div className="gender">{t('table_gender')}</div>
              <div className="address">{t('table_address')}</div>
              <div className="thaoTac">{t('table_action')}</div>
            </div>
            {/* Confirmation Dialog */}
            <div>
              {confirmDelete && (
                <BoxConfirmDelete
                  count={idSelected.length}
                  onCancel={() => {
                    setConfirmDelete(false);
                    // setIdSelected([]);
                  }}
                  onConfirm={handleDeleteSelected}
                />
              )}
            </div>
            <div className="w-full border border-slate-300">
              {customers.length > 0 ? (
                customers.map((customer) => {
                  return (
                    <div
                      className="grid grid-cols-[50px_1fr_0.8fr_1.3fr_0.8fr_0.5fr_2fr_100px] items-center gap-3.75 bg-white px-5 py-3 text-[12px] font-medium tracking-[0.05em] text-black text-slate-700 hover:cursor-pointer hover:bg-blue-50"
                      key={customer.id}
                      onClick={() => {
                        handleSelect(customer.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={idSelected.includes(customer.id) || false}
                        onChange={() => handleCheckItem(customer.id)}
                        className="cursor-pointer"
                      />
                      <div className="name">{customer.hoTenDayDu}</div>
                      <div className="sdt">{customer.sdt}</div>
                      <div className="email">{customer.email}</div>
                      <div className="dateOfBirth">{formatDateString(customer.dateOfBirth)}</div>
                      <div className="gender">{customer.gender}</div>
                      <div className="address">
                        {customer.province} - {customer.district} - {customer.ward}
                      </div>
                      <div className="flex justify-center gap-2">
                        <button
                          className="group rounded border border-yellow-500 bg-white px-2 py-1 group-hover:text-white hover:cursor-pointer hover:bg-yellow-600"
                          onClick={() => handleEdit(customer.id)}
                        >
                          <i className="fa-solid fa-pencil text-yellow-500 group-hover:text-white"></i>
                        </button>
                        <button
                          className="group rounded border border-red-500 bg-white px-2 py-1 group-hover:text-white hover:cursor-pointer hover:bg-red-600"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <i className="fa-solid fa-trash-can text-red-500 group-hover:text-white"></i>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center">{t('logs.noData')}</div>
              )}
              {/* Navigation */}
              {totalPages >= 1 && (
                <NavigateBottom
                  objectSearch={objectSearch}
                  setObjectSearch={setObjectSearch}
                  totalPages={totalPages}
                  pageSizeSate={pageSizeSate}
                  setPageSizeState={setPageSizeState}
                  handleSearch={handleSearch}
                  t={t}
                />
              )}
            </div>
          </div>

          <div className="rounde flex flex-col gap-3">
            {Object.keys(detailCustomer).length > 0 && (
              <div className="flex h-fit w-full flex-col justify-start rounded border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-blue-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold tracking-wider text-blue-700 uppercase">
                      Thông tin chi tiết
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-3 text-sm text-slate-700">
                  <div className="gap-1 text-[13px] font-medium">
                    <div className="text-[10px] font-bold text-blue-500">Họ và tên:</div>
                    {detailCustomer.hoTenDayDu}
                  </div>
                  <div className="gap-1 text-[13px] font-medium">
                    <div className="text-[10px] font-bold text-blue-500">Số điện thoại:</div>
                    {detailCustomer.sdt}
                  </div>
                  <div className="gap-1 text-[13px] font-medium">
                    <div className="text-[10px] font-bold text-blue-500">Email:</div>
                    {detailCustomer.email}
                  </div>
                  <div className="gap-1 text-[13px] font-medium">
                    <div className="text-[10px] font-bold text-blue-500">Ngày sinh:</div>
                    {detailCustomer.dateOfBirth
                      ? dayjs(detailCustomer.dateOfBirth).format('DD/MM/YYYY')
                      : ''}
                  </div>
                  <div className="gap-1 text-[13px] font-medium">
                    <div className="text-[10px] font-bold text-blue-500">Giới tính:</div>
                    {detailCustomer.gender}
                  </div>
                  <div className="gap-1 text-[13px] font-medium">
                    <div className="text-[10px] font-bold text-blue-500">Địa chỉ:</div>
                    {detailCustomer.province} - {detailCustomer.district} - {detailCustomer.ward}
                  </div>
                </div>
              </div>
            )}
            {idSelected.length > 0 && (
              <div className="flex w-full flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                {/* Header: Nền xanh nhẹ, text đậm cho sang */}
                <div className="border-b border-slate-100 bg-blue-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold tracking-wider text-blue-700 uppercase">
                      Danh sách được chọn
                    </h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                      {idSelected.length}
                    </span>
                  </div>
                </div>

                {/* List: Dùng chiều cao linh hoạt, item có hover và icon xóa nhanh */}
                <ul className="scrollbar-custom max-h-55 overflow-auto p-2">
                  {idSelected.map((id, index) => (
                    <li
                      key={index}
                      className="group flex items-center justify-between rounded-lg p-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-600"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-400 group-hover:bg-blue-600" />
                        {customers.find((customer) => customer.id === id)?.hoTenDayDu || 'Unknown'}
                      </div>
                      <button
                        className="cursor-pointer text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
                        onClick={() => setIdSelected(idSelected.filter((item) => item !== id))}
                      >
                        <i className="fa-solid fa-xmark text-xs"></i>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Footer: Chứa nút hành động chính */}
                <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                  <button
                    onClick={() => {
                      setConfirmDelete(true);
                    }}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 text-sm font-bold text-white shadow-sm shadow-red-200 transition-all hover:bg-red-600 active:scale-[0.98]"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    Xoá tất cả mục đã chọn
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2"></div>
      </div>
    </>
  );
};

export default List;
