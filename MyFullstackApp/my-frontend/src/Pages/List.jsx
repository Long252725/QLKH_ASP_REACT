import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BoxConfirmDelete from '../Components/BoxConfirmDelete';
import NavigateBottom from '../Components/NavigateBottom';
import StatChart from '../Components/StatChart';
import dayjs from 'dayjs';
import Filter from '../Components/Filter';
import SortableHeader from '../Components/SortableHeader';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

const List = ({ url }) => {
  const { t } = useTranslation('list');
  const urlASP = url.urlASP;
  const [showAlert, setShowAlert] = useState(false);
  // const [checkAll, setCheckAll] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showFail, setShowFail] = useState(false);
  const [showSucess, setShowSucess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(() => {
    const saved = localStorage.getItem('showFilter');
    return saved ? JSON.parse(saved) : false;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [customersSelected, setCustomersSelected] = useState(() => {
    const saved = localStorage.getItem('customersSelected');
    return saved ? JSON.parse(saved) : [];
  });
  const [provinces, setProvinces] = useState([]);
  const [pageSizeSate, setPageSizeState] = useState(() => {
    const saved = localStorage.getItem('pageSize');
    return saved ? JSON.parse(saved) : 10;
  });
  const [idSelected, setIdSelected] = useState(() => {
    const saved = localStorage.getItem('idSelected');
    return saved ? JSON.parse(saved) : [];
  });
  const [oneIdSelected, setOneIdSelected] = useState([]);
  const [detailCustomer, setDetailCustomer] = useState(() => {
    const saved = localStorage.getItem('detailCustomer');
    return saved ? JSON.parse(saved) : {};
  });
  const [totalCustomer, setTotalCustomer] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('visibleColumns');
    return saved
      ? JSON.parse(saved)
      : {
          phone: true,
          email: true,
          dateOfBirth: true,
          gender: true,
          address: true,
        };
  });

  const [objectSearch, setObjectSearch] = useState(() => {
    const saved = localStorage.getItem('objectSearch');
    return saved
      ? JSON.parse(saved)
      : {
          keyword: '',
          province: '',
          sortBy: '',
          gender: '',
          dobFrom: '',
          dobTo: '',
          page: 1,
          pageSize: pageSizeSate,
        };
  });
  const [totalPages, setTotalPages] = useState();

  // --------------------------
  // Định nghĩa danh sách cột gốc
  // 1. Khai báo danh sách các cột khả dụng
  const COLUMN_DEFS = {
    name: { label: t('table_name'), width: 'flex-1', isSortable: true },
    phone: { label: t('table_phone'), width: 'w-32 flex-none' },
    email: { label: t('table_email'), width: 'min-w-0 flex-[1.2]' },
    dateOfBirth: { label: t('table_dateOfBirth'), width: 'w-28 flex-none text-center' },
    gender: { label: t('table_gender'), width: 'w-20 flex-none text-center' },
    address: { label: t('table_address'), width: 'min-w-0 flex-[1.5]' },
  };

  // 2. Khởi tạo State thứ tự cột (Kết hợp với localStorage)
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('columnOrder');
    // Lọc lấy các cột mà visibleColumns đang cho phép hiện
    const defaultOrder = Object.keys(COLUMN_DEFS);
    return saved ? JSON.parse(saved) : defaultOrder;
  });
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const result = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('columnOrder', JSON.stringify(result));
        return result;
      });
    }
  };
  // --------------------------

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
  useEffect(() => {
    localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);
  useEffect(() => {
    localStorage.setItem('showFilter', JSON.stringify(showFilter));
  }, [showFilter]);
  useEffect(() => {
    localStorage.setItem('detailCustomer', JSON.stringify(detailCustomer));
  }, [detailCustomer]);
  useEffect(() => {
    localStorage.setItem('pageSize', JSON.stringify(pageSizeSate));
  }, [pageSizeSate]);

  useEffect(() => {
    // Hàm gọi API
    const fetchTotal = async () => {
      try {
        const res = await fetch(`${urlASP}/api/customer/total`);
        const data = await res.json();
        setTotalCustomer(data); // Giả sử API trả về trực tiếp con số hoặc data.count
      } catch (err) {
        console.error('Lỗi khi lấy tổng khách hàng:', err);
      }
    };

    fetchTotal();
  }, [urlASP]); // Chỉ chạy lại khi urlASP thay đổi
  useEffect(() => {
    localStorage.setItem('idSelected', JSON.stringify(idSelected));
    if (idSelected.length > 0) {
      fetch(`${urlASP}/api/customer/dddd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Bắt buộc phải có dòng này
        },
        body: JSON.stringify(idSelected),
      })
        .then((res) => res.json())
        .then((data) => {
          setCustomersSelected(data.data);
          localStorage.setItem('customersSelected', JSON.stringify(data.data));
          console.log(data.message);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [idSelected]);
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
    localStorage.setItem('objectSearch', JSON.stringify(objectSearch));
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
  const handleDeleteOne = (id) => {
    console.log('Deleting customer ID:', id);
    setConfirmDelete(true);
    setOneIdSelected([id]);
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

  const handleDeleteSelected = (ids) => {
    console.log('Selected IDs for deletion:', ids);
    setConfirmDelete(false);
    setIsLoading(true);
    // Gọi API xóa ở đây
    fetch(`${urlASP}/api/customer/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ids),
    })
      .then((response) => response.json())
      .then(() => {
        // setCheckAll(false)
        // Cập nhật lại danh sách khách hàng
        oneIdSelected.length > 0 ? setOneIdSelected([]) : setIdSelected([]);
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
        {/* Confirmation Dialog */}
        <div>
          {confirmDelete && oneIdSelected.length > 0 && (
            <BoxConfirmDelete
              count={1}
              onCancel={() => {
                setConfirmDelete(false);
                setOneIdSelected([]);
              }}
              onConfirm={() => handleDeleteSelected(oneIdSelected)}
            />
          )}
          {confirmDelete && oneIdSelected.length <= 0 && (
            <BoxConfirmDelete
              count={idSelected.length}
              onCancel={() => {
                setConfirmDelete(false);
              }}
              onConfirm={() => handleDeleteSelected(idSelected)}
            />
          )}
          
        </div>
        <div className="grid w-full grid-cols-[1fr_4.5fr_1fr] gap-2">
          <div></div>
          <div className="flex w-full flex-wrap items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            {/* Nhóm Tìm kiếm: Chiếm không gian chính */}
            <div className="flex min-w-[300px] flex-1 gap-2">
              <div className="relative w-full max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <i className="fa-solid fa-magnifying-glass text-xs text-slate-400"></i>
                </div>
                <input
                  type="text"
                  id="searchInput"
                  value={searchTerm}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(pageSizeSate)}
                  onChange={handleOnChangeSearch}
                  className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-3 pl-10 text-sm placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                  placeholder={t('placeholder_search')}
                />
              </div>

              <button
                id="btnSearch"
                onClick={() => handleSearch(pageSizeSate)}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
              >
                <i className="fa-solid fa-magnifying-glass"></i>
                {t('search')}
              </button>
            </div>

            {/* Nhóm Công cụ & Hành động */}
            <div className="flex items-center gap-2">
              {/* Nút Lọc & Reload: Dùng tone màu trung tính hơn để không lấn lướt nút chính */}
              <button
                id="btnLoc"
                onClick={() => setShowFilter(!showFilter)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  showFilter
                    ? 'border-blue-200 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <i className="fa-solid fa-filter text-xs"></i>
                {t('filter')}
              </button>

              <button
                id="btnReload"
                onClick={() => window.location.reload()}
                className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all group-hover:rotate-180 hover:bg-slate-50 hover:text-blue-600"
                title={t('refresh')}
              >
                <i className="fa-solid fa-arrows-rotate group-hover:rotate-180"></i>
              </button>

              {/* Đường gạch đứng phân cách */}
              <div className="mx-1 h-6 w-[1px] bg-slate-300"></div>

              {/* Nút Xóa: Chỉ nổi bật khi thực sự cần */}
              <button
                id="btnDeleteSelected"
                onClick={handleConfirmDelete}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white active:scale-95"
              >
                <i className="fa-solid fa-trash-can text-xs"></i>
                {t('delete')}
              </button>

              {/* Nút Thêm: Luôn là nút thu hút nhất */}
              <a href="/form">
                <button
                  id="themBtn"
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 active:scale-95"
                >
                  <i className="fa-solid fa-plus"></i>
                  {t('add')}
                </button>
              </a>
              <div></div>
            </div>
          </div>
        </div>
        {/* Filter Box */}
        {/* showFilter */}
        <div className="grid w-full grid-cols-[1fr_4.5fr_1fr] gap-2">
          <Filter
            showFilter={showFilter}
            t={t}
            objectSearch={objectSearch}
            setObjectSearch={setObjectSearch}
            handleInputChange={handleInputChange}
            provinces={provinces}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
          />

          <div className="flex h-fit w-full flex-col items-center overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            {/* HEADER: Đã chuyển sang Flex để khớp với Body */}
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="flex w-full items-center gap-4 bg-[#2563eb] px-5 py-3 text-[12px] font-bold tracking-[0.05em] text-white uppercase">
                {/* Cột Checkbox trống ở Header (khớp w-10 của body) */}
                <div className="w-10 flex-none"></div>
                <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                  {columnOrder.map((colId) => {
                    // Chỉ render nếu cột này đang được bật trong visibleColumns
                    if (colId !== 'name' && !visibleColumns[colId]) return null;

                    return (
                      <SortableHeader
                        key={colId}
                        id={colId}
                        column={COLUMN_DEFS[colId]}
                        currentSort={objectSearch.sortBy}
                        onSort={() => {
                          let newSort =
                            objectSearch.sortBy === 'HoTenDayDu_asc'
                              ? 'HoTenDayDu_desc'
                              : objectSearch.sortBy === 'HoTenDayDu_desc'
                                ? ''
                                : 'HoTenDayDu_asc';
                          setObjectSearch({ ...objectSearch, sortBy: newSort });
                        }}
                      />
                    );
                  })}
                </SortableContext>

                {/* Cột Thao tác (khớp w-24 của body) */}
                <div className="w-24 flex-none text-right">{t('table_action')}</div>
              </div>

              {/* BODY */}
              <div className="block max-h-150 w-full overflow-auto">
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <div
                      className="flex items-center gap-4 border-b border-slate-100 bg-white px-5 py-3 text-[12px] font-medium tracking-[0.05em] text-slate-700 transition-all last:border-none hover:cursor-pointer hover:bg-blue-50"
                      key={customer.id}
                      onClick={() => handleSelect(customer.id)}
                    >
                      {/* Checkbox */}
                      <div className="flex w-10 flex-none items-center justify-center">
                        <input
                          type="checkbox"
                          checked={idSelected.includes(customer.id) || false}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleCheckItem(customer.id);
                          }}
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      {/* RENDER DỮ LIỆU THEO THỨ TỰ CỘT ĐÃ KÉO THẢ */}
                      {columnOrder.map((colId) => {
                        if (colId !== 'name' && !visibleColumns[colId]) return null;
                        const colDef = COLUMN_DEFS[colId];

                        return (
                          <div key={colId} className={`${colDef.width} truncate`}>
                            {colId === 'name' && (
                              <span className="font-bold text-slate-900">
                                {customer.hoTenDayDu}
                              </span>
                            )}
                            {colId === 'phone' && customer.sdt}
                            {colId === 'email' && (
                              <span className="text-slate-500">{customer.email}</span>
                            )}
                            {colId === 'dateOfBirth' && (
                              <span className="text-slate-500">
                                {formatDateString(customer.dateOfBirth)}
                              </span>
                            )}
                            {colId === 'gender' && (
                              <span className="text-slate-500 italic">{customer.gender}</span>
                            )}
                            {colId === 'address' && (
                              <span className="text-slate-500">
                                {customer.province} - {customer.district} - {customer.ward}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Thao tác cố định cuối hàng */}
                      <div
                        className="flex w-24 flex-none justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className="..." onClick={() => handleEdit(customer.id)}>
                          <i className="fa-solid fa-pencil text-xs text-amber-600"></i>
                        </button>
                        <button className="..." onClick={() => handleDeleteOne(customer.id)}>
                          <i className="fa-solid fa-trash-can text-xs text-red-600"></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-400">...No Data...</div>
                )}
              </div>
            </DndContext>

            {/* Navigation */}
            {totalPages >= 1 && (
              <div className="w-full border-t border-slate-100 bg-slate-50">
                <NavigateBottom
                  totalCustomer={totalCustomer}
                  objectSearch={objectSearch}
                  setObjectSearch={setObjectSearch}
                  totalPages={totalPages}
                  pageSizeSate={pageSizeSate}
                  setPageSizeState={setPageSizeState}
                  handleSearch={handleSearch}
                  t={t}
                />
              </div>
            )}
          </div>

          <div className="flex h-180 flex-col gap-3 rounded">
            <div className="h-[50%]">
              {Object.keys(detailCustomer).length > 0 && (
                <div className="flex h-full w-full flex-col justify-start rounded border border-slate-200 bg-white shadow-sm">
                  <div className="h-[15%] border-b border-slate-100 bg-blue-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold tracking-wider text-blue-700 uppercase">
                        Thông tin chi tiết
                      </h3>
                    </div>
                  </div>
                  <div className="scrollbar-custom flex h-[85%] flex-col gap-2 overflow-auto p-3 text-sm text-slate-700">
                    <div className="gap-1 text-[13px] font-medium">
                      <div className="text-[10px] font-bold text-blue-500">Họ và tên:</div>
                      {detailCustomer.hoTenDayDu || 'Không có dữ liệu'}
                    </div>
                    <div className="gap-1 text-[13px] font-medium">
                      <div className="text-[10px] font-bold text-blue-500">Số điện thoại:</div>
                      {detailCustomer.sdt || 'Không có dữ liệu'}
                    </div>
                    <div className="gap-1 text-[13px] font-medium">
                      <div className="text-[10px] font-bold text-blue-500">Email:</div>
                      {detailCustomer.email || 'Không có dữ liệu'}
                    </div>
                    <div className="gap-1 text-[13px] font-medium">
                      <div className="text-[10px] font-bold text-blue-500">Ngày sinh:</div>
                      {detailCustomer.dateOfBirth
                        ? dayjs(detailCustomer.dateOfBirth).format('DD/MM/YYYY')
                        : 'Không có dữ liệu'}
                    </div>
                    <div className="gap-1 text-[13px] font-medium">
                      <div className="text-[10px] font-bold text-blue-500">Giới tính:</div>
                      {detailCustomer.gender || 'Không có dữ liệu'}
                    </div>
                    <div className="gap-1 text-[13px] font-medium">
                      <div className="text-[10px] font-bold text-blue-500">Địa chỉ:</div>
                      {detailCustomer.province} - {detailCustomer.district} - {detailCustomer.ward}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="h-[45%]">
              {idSelected.length > 0 && (
                <div className="flex h-full w-full flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                  {/* Header: Nền xanh nhẹ, text đậm cho sang */}
                  <div className="h-[20%] border-b border-slate-100 bg-blue-50/50 p-4">
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
                  <ul className="scrollbar-custom h-[60%] overflow-auto p-2">
                    {customersSelected.length > 0 &&
                      customersSelected.map((c, index) => (
                        <li
                          key={index}
                          className="group flex items-center justify-between rounded-lg p-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-600"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-blue-400 group-hover:bg-blue-600" />
                            {c.hoTenDayDu || 'Unknown'}
                          </div>
                          <button
                            className="cursor-pointer text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
                            onClick={() =>
                              setIdSelected(idSelected.filter((item) => item !== c.id))
                            }
                          >
                            <i className="fa-solid fa-xmark text-xs"></i>
                          </button>
                        </li>
                      ))}
                  </ul>

                  {/* Footer: Chứa nút hành động chính */}
                  <div className="flex h-[20%] gap-2 border-t border-slate-100 bg-slate-50/50 p-4">
                    <button
                      onClick={() => {
                        setConfirmDelete(true);
                      }}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 text-xs font-bold text-white shadow-sm shadow-red-200 transition-all hover:bg-red-600 active:scale-[0.98]"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                      Xoá tất cả
                    </button>
                    <button
                      onClick={() => {
                        setIdSelected([]);
                      }}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-xs font-bold text-white shadow-sm shadow-red-200 transition-all hover:bg-amber-600 active:scale-[0.98]"
                    >
                      <i class="fa-regular fa-circle-xmark"></i>
                      Bỏ chọn
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2"></div>
      </div>
      <StatChart />

    </>
  );
};

export default List;
