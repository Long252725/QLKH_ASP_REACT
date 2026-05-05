export default function Filter({ showFilter, t, objectSearch, setObjectSearch, handleInputChange, provinces, visibleColumns, setVisibleColumns }) {
    return (
        <div>
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
                              <div className="flex flex-col gap-3 ">
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
                                      className="w-full rounded-lg border border-slate-200 text-slate-700 bg-slate-50 py-2 pr-3 pl-10 text-sm transition-all outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-10 text-sm transition-all outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"
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
                              {/* Section: Hiển thị cột */}
                              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5">
                                <label className="text-[11px] font-bold tracking-tight text-slate-400 uppercase">
                                  {t('display_columns')}
                                </label>
                                <div className="grid grid-cols-1 gap-y-2.5">
                                  {Object.keys(visibleColumns).map((col) => (
                                    <label key={col} className="group flex cursor-pointer items-center justify-between">
                                      <span className="text-sm font-medium text-slate-600 transition-colors group-hover:text-blue-600">
                                        {t(`table_${col}`)}
                                      </span>
                                      <div className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={visibleColumns[col]}
                                          onChange={() => setVisibleColumns({
                                            ...visibleColumns,
                                            [col]: !visibleColumns[col]
                                          })}
                                          className="sr-only peer"
                                        />
                                        {/* Custom Toggle Switch */}
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
        </div>
    );
}