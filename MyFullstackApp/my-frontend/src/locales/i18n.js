import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import FORM_VI from './vi/form.json';
import LIST_VI from './vi/list.json';
import EDIT_VI from './vi/edit.json';
import COMMON_VI from './vi/common.json';
import IMPORT_VI from './vi/import.json';
import FORM_EN from './en/form.json';
import LIST_EN from './en/list.json';
import EDIT_EN from './en/edit.json';
import IMPORT_EN from './en/import.json';
import COMMON_EN from './en/common.json';


const resources = {
    vi: {
        form: FORM_VI,
        list: LIST_VI,
        edit: EDIT_VI,
        common: COMMON_VI,
        import: IMPORT_VI
    },
    en: {
        form: FORM_EN,
        list: LIST_EN,
        edit: EDIT_EN,
        common: COMMON_EN,
        import: IMPORT_EN
    }
}

const defaultNS = 'form, common'
i18n
.use(LanguageDetector)
.use(initReactI18next)
.init({
    resources,
    // lng: 'vi',
    fallbackLng: 'vi', // Mặc định sẽ dùng tiếng Việt nếu không phát hiện được ngôn ngữ nào khác
    ns: ['form', 'list', 'common', 'edit', 'import'],
    defaultNS,
    interpolation: {
        escapeValue: false,
    },
    detection: {
        order: ['localStorage', 'cookie', 'navigator'],
        caches: ['localStorage'],
    },
});

export default i18n;
