import { useTranslation } from "react-i18next";
export default function BoxConfirmDelete({ count, onCancel, onConfirm }) {
    const {t} = useTranslation(['list', 'common']);
    return <>
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop mờ phía sau */}
        <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => {
            onCancel();
        }} 
        />

        {/* Nội dung Modal */}
        <div className="relative w-full max-w-sm transform overflow-hidden rounded-xl bg-white p-6 text-center shadow-2xl transition-all border border-slate-100">
        
        {/* Icon hoặc Warning (Tuỳ chọn thêm cho đẹp) */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
        </div>

        <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-2">
            {t('confirm_delete', { count: count })}
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
            {t('warming_delete')}
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-center gap-3">
            <button
            className="inline-flex cursor-pointer justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            onClick={() => {
            onCancel();
        }} 
            >
            {t('cancel')}
            </button>
            <button
            className="inline-flex cursor-pointer justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
            onClick={()=> onConfirm()}
            >
            {t('confirm')}
            </button>
        </div>
        </div>
    </div>
    </>

}