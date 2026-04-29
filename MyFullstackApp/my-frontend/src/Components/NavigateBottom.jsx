export default function NavigateBottom({ objectSearch, setObjectSearch, totalPages, pageSizeSate, setPageSizeState, handleSearch, t }) {
  return (
    <>
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center border-t border-gray-100 bg-gray-50">
        <div></div>
        <div className="flex cursor-pointer items-center justify-center gap-2 border-t border-gray-100 bg-gray-50 p-4">
          <button
            onClick={() => setObjectSearch((prev) => ({ ...prev, page: 1 }))}
            disabled={objectSearch.page == 1}
            className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors ${objectSearch.page == 1 ? 'cursor-not-allowed bg-gray-200 text-gray-400' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            {t('first')}
          </button>

          <div className="flex gap-1">
            {[...Array(totalPages)]
              .map((_, i) => (
                <button
                  key={i}
                  onClick={() => setObjectSearch((prev) => ({ ...prev, page: i + 1 }))}
                  className={`h-8 w-8 cursor-pointer rounded-md text-sm font-medium transition-colors ${objectSearch.page === i + 1 ? 'bg-blue-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))
              .slice(
                Math.max(0, objectSearch.page - 3),
                Math.min(totalPages, objectSearch.page + 2),
              )}
          </div>

          <button
            onClick={() => setObjectSearch((prev) => ({ ...prev, page: totalPages }))}
            disabled={objectSearch.page == totalPages || totalPages < 1}
            className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors ${objectSearch.page == totalPages || totalPages < 1 ? 'cursor-not-allowed bg-gray-200 text-gray-400' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            {t('last')}
          </button>
        </div>
        <div className="flex items-center justify-center gap-1 justify-self-end rounded p-3 text-sm font-medium transition-colors">
          {t('page_size')}
          <input
            type="number"
            value={pageSizeSate}
            onChange={(e) => {
              setPageSizeState(e.target.value);
            }}
            onKeyPress={(e) => e.key == 'Enter' && handleSearch(pageSizeSate)}
            onBlur={() => {
              handleSearch(pageSizeSate);
            }}
            className="h-8 w-20 cursor-pointer rounded-md border border-gray-300 bg-white px-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          ></input>
        </div>
      </div>
    </>
  );
}
