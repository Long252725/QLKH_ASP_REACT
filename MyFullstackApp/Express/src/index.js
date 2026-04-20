import { connect } from './config/db/index.js';
const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const app = express();
const port = 8888;
import multer from 'multer';
import Customers from './app/models/Customers.js';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
// const storageMemory = multer.memoryStorage();
const upload = multer({ storage: storage });


connect();
app.use(cors());
app.use(express.json());

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const workbook = xlsx.readFile(req.file.path, {cellDates: true}); //neu ma luu vao o dia
    // const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true }); //neu ma luu vao ram
    const sheetname = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetname];
    const datas = xlsx.utils.sheet_to_json(worksheet);
    const {dataTrue, dataFalse, dataTrung} = await handleNomarlizeData(datas);
    console.log("Dữ liệu đã chuẩn hóa:", dataTrue);
    // console.log("Dữ liệu không hợp lệ:", dataFalse);
    // console.log("Dữ liệu trùng:", dataTrung);
    addDataBase(dataTrue);


    // console.log(data);
    res.json({ message: 'File uploaded successfully', dataTrue, dataFalse, dataTrung });
});

function formatDate(value) {
    if (!value) return "";

    let d, m, y;

    // Trường hợp 1: Nếu Excel trả về đối tượng Date (khi dùng cellDates: true)
    if (value instanceof Date) {
        if (isNaN(value.getTime())) return "";
        d = value.getDate();
        m = value.getMonth() + 1;
        y = value.getFullYear();
    } 
    // Trường hợp 2: Nếu là số Serial của Excel (ví dụ: 44197)
    else if (typeof value === 'number') {
        const date = new Date((value - 25569) * 86400 * 1000);
        d = date.getDate();
        m = date.getMonth() + 1;
        y = date.getFullYear();
    }
    // Trường hợp 3: Nếu là chuỗi (String)
    else if (typeof value === 'string') {
        // Tách chuỗi theo dấu - hoặc /
        const parts = value.split(/[-/]/);
        if (parts.length === 3) {
            // Kiểm tra xem là định dạng DD-MM-YYYY hay YYYY-MM-DD
            if (parts[0].length === 4) { // YYYY-MM-DD
                y = parts[0]; m = parts[1]; d = parts[2];
            } else { // DD-MM-YYYY
                d = parts[0]; m = parts[1]; y = parts[2];
            }
        } else {
            // Nếu chuỗi lạ, thử cho Date parse
            const date = new Date(value);
            if (isNaN(date.getTime())) return "";
            d = date.getDate();
            m = date.getMonth() + 1;
            y = date.getFullYear();
        }
    }

    // Đảm bảo trả về đúng định dạng DD-MM-YYYY (thêm số 0 phía trước)
    const day = String(d).padStart(2, '0');
    const month = String(m).padStart(2, '0');
    const year = String(y);

    // Kiểm tra xem các giá trị có phải là số hợp lệ không
    if (day === "NaN" || month === "NaN" || year === "NaN") return "";

    return `${day}-${month}-${year}`;
}
// Áp dụng vào mảng data của bạn:
function cleanText(str) {
    if (!str) return "";
    return str
        .toLowerCase()
        .trim()
        .normalize("NFD")              
        .replace(/[\u0300-\u036f]/g, "") // 1. Xóa dấu: "Thành phố" -> "thanh pho"
        .replace(/đ/g, "d")
        // 2. Xóa tiền tố (Không dùng ^, dùng \s* để khớp cả khi có hoặc không có khoảng trắng)
        // Lưu ý: "thanh pho" đã mất dấu nên regex phải là "thanhpho" hoặc "thanh\s*pho"
        .replace(/(tinh|thanh\s*pho|tp\.?|quan|huyen|phuong|xa|thi\s*xa|thi\s*tran)\s*/gi, "")
        // // 3. Xóa sạch khoảng trắng còn lại
        .replace(/\s+/g, "")
        // // 4. Chỉ giữ lại chữ cái và số
        .replace(/[^a-z0-9]/g, ""); 
}
const fetchAllProvinces = async () => {
    try {
        const response = await fetch('https://provinces.open-api.vn/api/v2/p/?depth=2');
        const provinces = await response.json();
        return provinces;
    } catch (error) {
        console.error('Error fetching provinces:', error);
        return [];
    }
}
const fetchDistrictsByProvince = async (provinceId) => {
    try{
        const response = await fetch(`https://provinces.open-api.vn/api/v2/p/${provinceId}?depth=2`);
        const districts = await response.json();
        return districts.wards || [];
    } catch (error) {
        console.error(`Error fetching districts for province ${provinceId}:`, error);
        return [];
    }

}
const fetchWardsByDistrict = async (districtId) => {
    try{
        const response = await fetch(`https://provinces.open-api.vn/api/v2/w/${districtId}/to-legacies/`);
        const wards = await response.json();
        return wards || [];
    } catch (error) {
        console.error(`Error fetching wards for district ${districtId}:`, error);
        return [];
    }

}
const data = [{
  'Họ ': 'Nguyen',
  'Tên đệm': 'Thanh',
  'Tên': 'Long',
  'Giới tính': 'Nam',
  'Email': 'inthanhlong1@gmail.com',
  'SDT': 968410930,
  'Ngày sinh': '2006-07-09T16:59:30.000Z',
  'Tỉnh/Thành Phố': 'Thành phố Hà Nội',
  'Quận/Huyện': 'Phường Ba Đình',
  'Phường/Xã': 'Phường Quán Thánh'
},
{
  'Họ ': 'Nguyen',
  'Tên đệm': 'Thanh',
  'Tên': 'Long',
  'Giới tính': 'Nam',
  'Email': 'inthanhlong@gmail.com',
  'SDT': 968410931,
  'Ngày sinh': '2006-07-09T16:59:30.000Z',
  'Tỉnh/Thành Phố': 'Thành phố Hà Nội',
  'Quận/Huyện': 'Phường Ba Đình',
  'Phường/Xã': 'Phường Quán Thánh'
},
{
  'Họ ': 'Nguyen',
  'Tên đệm': 'Thanh',
  'Tên': 'Long',
  'Giới tính': 'Nam',
  'Email': 'inthanhlong@gmail.com',
  'SDT': 968410932,
  'Ngày sinh': '2006-07-09T16:59:30.000Z',
  'Tỉnh/Thành Phố': 'Thành phố Hà Nội',
  'Quận/Huyện': 'Phường Ba Đình',
  'Phường/Xã': 'Phường Quán Thánh'
},
{
  'Họ ': 'Nguyen',
  'Tên đệm': 'Thanh',
  'Tên': 'Long',
  'Giới tính': 'Nam',
  'Email': 'inthanhlong@gmail.com',
  'SDT': 968410933,
  'Ngày sinh': '2006-07-09T16:59:30.000Z',
  'Tỉnh/Thành Phố': 'Thành phố Hà Nội',
  'Quận/Huyện': 'Phường Ba Đình',
  'Phường/Xã': 'Phường Quán Thánh'
},
{
  'Họ ': 'Nguyen',
  'Tên đệm': 'Thanh Thi',
  'Tên': 'Long Thuc  .',
  'Giới tính': 'Nam',
  'Email': 'inthanhlong@gmail.com',
  'SDT': 968410933,
  'Ngày sinh': '2006-07-09T16:59:30.000Z',
  'Tỉnh/Thành Phố': '',
  'Quận/Huyện': '',
  'Phường/Xã': ' Quán Thánh'
}]

// console.log(cleanText("TP Hà Nội")); // -> "hanoi"

const provinceMap = new Map()
async function handleNomarlizeData(data) {
    const {uniqueData, dataTrung} = await locData(data);
    console.log("Dữ liệu đã loc:", uniqueData);
    // console.log("Dữ liệu sai:", dataFalse);
    // Handle Data--------
    // 1. Lấy tất cả Tỉnh ngay từ đầu
    // 1. Phải đợi tải xong Tỉnh đã
        const provinces = await fetchAllProvinces();
        provinces.forEach(p => {
            provinceMap.set(cleanText(p.name), { 
                id: p.code, 
                originalName: p.name, 
                districts: new Map() 
            });
        });
    const dataTrue = [];
    const dataFalse = [];

    for (const item of uniqueData){
        // --- XỬ LÝ TỈNH ---
            const pKey = cleanText(item['Tỉnh/Thành Phố'].trim());
            let provinceInfo;
            if(pKey) {
                provinceInfo = provinceMap.get(pKey);
            } else {
                item['Tỉnh/Thành Phố'] = ""; // Nếu không có dữ liệu tỉnh, để trống
            }
            // console.log('pKey', pKey)
            if (provinceInfo) {
                // console.log(`Đã tìm thấy tỉnh: ${provinceInfo.originalName} (ID: ${provinceInfo.id})`);
                item['Tỉnh/Thành Phố'] = provinceInfo.originalName; // Tên gốc của tỉnh
                // console.log(`Đang xử lý tỉnh: ${provinceInfo.originalName} (ID: ${provinceInfo.id})`);
                const pId = provinceInfo.id;
                // --- XỬ LÝ HUYỆN ---
                // Nếu tỉnh này chưa có danh sách huyện trong Cache thì fetch
                if (provinceInfo.districts.size === 0) {
                    const districts = await fetchDistrictsByProvince(pId);
                    districts.forEach(d => {
                        provinceInfo.districts.set(cleanText(d.name), { id: d.code, originalName: d.name, wards: new Map() });
                    });
                }
            } else {
                item['Tỉnh/Thành Phố'] = ""; // Nếu không có dữ liệu tỉnh, để trống
            }
            const dKey = cleanText(item['Quận/Huyện']);
            let districtInfo;
            if(dKey && provinceInfo) {
                districtInfo = provinceInfo.districts.get(dKey);
            } else {
                item['Quận/Huyện'] = ""; // Nếu không có dữ liệu huyện, để trống
            }
            if(districtInfo) {
                item['Quận/Huyện'] = districtInfo.originalName; // Tên gốc của huyện
                const dId = districtInfo.id;
                // --- XỬ LÝ XÃ ---
                // Nếu huyện này chưa có danh sách xã trong Cache thì fetch
                if (districtInfo.wards.size === 0) {
                    const wards = await fetchWardsByDistrict(dId);
                    wards.forEach(w => {
                        districtInfo.wards.set(cleanText(w.name), { id: w.code, originalName: w.name });
                    });
                }
            } else {
                item['Quận/Huyện'] = ""; // Nếu không có dữ liệu huyện, để trống
            }
            const wKey = cleanText(item['Phường/Xã']);
            console.log('wKey', wKey);
            let wardInfo;
            if(wKey && districtInfo) {
                wardInfo = districtInfo.wards.get(wKey);
            } else {
                item['Phường/Xã'] = ""; // Nếu không có dữ liệu xã, để trống
            }
            if(wardInfo) {
                item['Phường/Xã'] = wardInfo.originalName; // Tên gốc của xã
                console.log(`Đã chuẩn hóa địa chỉ: ${item['Tỉnh/Thành Phố']} - ${item['Quận/Huyện']} - ${item['Phường/Xã']}`);
            } else {
                item['Phường/Xã'] = ""; // Nếu không có dữ liệu xã, để trống
            }
    

                // Gender
                const rawGender = item['Giới tính'] || "";
                const cleanGender = rawGender.replace(/[^a-zA-ZÀ-ỹ\s]/g, '').trim();
                const formattedGender = cleanGender.charAt(0).toUpperCase() + cleanGender.slice(1).toLowerCase();
                // Ho
                const rawHo = item['Họ '] || "";
                const cleanHo = rawHo.replace(/[^a-zA-ZÀ-ỹ\s]/g, '').trim();
                
                const formattedHo = cleanHo.charAt(0).toUpperCase() + cleanHo.slice(1).toLowerCase();
                // Tên đệm
                const rawTenDem = item['Tên đệm'] || "";
                const cleanTenDem = rawTenDem.replace(/[^a-zA-ZÀ-ỹ\s]/g, '').trim();
                const arrayTD = cleanTenDem.split(/\s+/);
                const formattedTenDem = arrayTD.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                // Tên
                const rawTen = item['Tên'] || "";
                const cleanTen = rawTen.replace(/[^a-zA-ZÀ-ỹ\s]/g, '').trim();
                const arrayTen = cleanTen.split(/\s+/);
                const formattedTen = arrayTen.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                //SDT
                const rawSdt = String(item['SDT'] || "").trim();
                if (rawSdt.length > 0 && !/^[0-9\s\-()+]+$/.test(rawSdt)) {
                    dataFalse.push(item);
                    continue; // Bỏ qua bản ghi này và chuyển sang bản ghi tiếp theo
                }
                const formattedSdt = rawSdt.startsWith('0') && rawSdt.length === 10 ? rawSdt : (rawSdt.length === 9 ? '0' + rawSdt : rawSdt);
                // Email
                const rawEmail = String(item['Email'] || "").trim().toLowerCase();
                if (rawEmail.length > 0 && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|vn|net)$/.test(rawEmail)) {
                    dataFalse.push(item);
                    continue; // Bỏ qua bản ghi này và chuyển sang bản ghi tiếp theo
                }
                const formattedEmail = rawEmail;
                dataTrue.push({
                Ho: formattedHo,
                TenDem: formattedTenDem,
                Ten: formattedTen,
                HoTenDayDu: `${formattedHo} ${formattedTenDem} ${formattedTen}`,
                Gender: formattedGender,
                Email: formattedEmail,
                Sdt: formattedSdt,
                DateOfBirth: formatDate(item['Ngày sinh']),
                Province: item['Tỉnh/Thành Phố'].trim(),
                District: item['Quận/Huyện'].trim(),
                Ward: item['Phường/Xã'].trim()
            })}
            return {dataTrue, dataFalse, dataTrung};

}
// (async () => {
//     const result = await handleNomarlizeData(data);
//     console.log("Dữ liệu đã chuẩn hóa:", result);
// })();
function checkCorrectData(item) {
    const email = String(item.Email).toLowerCase();
    const sdt = String(item.Sdt).trim();
}
async function locData(data) {
    // 1. Đếm tần suất xuất hiện của SDT và Email
    const countSDT = {};
    const countEmail = {};
    const dataTrung = [];

    data.forEach(item => {
        // console.log('item', item);
        const sdt = String(item['SDT']).trim();
        const email = String(item['Email']).trim().toLowerCase();
        
        countSDT[sdt] = (countSDT[sdt] || 0) + 1;
        countEmail[email] = (countEmail[email] || 0) + 1;
    });
    console.log('Tần suất SDT:', countSDT);
    console.log('Tần suất Email:', countEmail);

    // 2. Lọc dữ liệu
    const uniqueData = data.filter(item => {
        const sdt = String(item.Sdt).trim();
        const email = item.Email.trim().toLowerCase();

        // Nếu SDT hoặc Email xuất hiện nhiều hơn 1 lần trong toàn bộ danh sách
        if (countSDT[sdt] > 1 || countEmail[email] > 1) {
            dataTrung.push(item);
            return false; 
        }
        
        return true; 
    });

    return { uniqueData, dataTrung };
}
// (async () => {
//     const {uniqueData, dataFalse} = await locData(data);
//     console.log("Dữ liệu đã chuẩn hóa:", uniqueData);
//     console.log("Dữ liệu sai:", dataFalse);
// })();


const addDataBase = (data) => {
    console.log(data);

    try {
        Customers.insertMany(data)
        .then(() => {
            console.log('Data inserted successfully');
        })
        .catch((error) => {
            console.error('Error inserting data:', error);
        });
    } catch (error) {
        console.error('Error inserting data:', error);  
}
}
//  addDataBase(newData);
const XLSX = require('xlsx');

const generateTestData = (number) => {
    const data = [];
    
    // 1. Danh sách dữ liệu mẫu
    const hoList = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Đặng", "Bùi", "Đỗ"];
    const tenDemList = ["Thành", "Thị", "Văn", "Minh", "Anh", "Hồng", "Ngọc", "Khánh", "Xuân", "Hữu"];
    const tenList = ["Long", "Hương", "Tuấn", "Lan", "Hùng", "Mai", "Dũng", "Cúc", "Tùng", "Phương"];
    
    // 2. Cấu trúc địa chỉ logic để test (Tỉnh - Huyện - Xã)
    const geoMatrix = [
        { 
            p: "Thành phố Hà Nội", 
            pVariants: ["tp hà nội", "Ha Noi", "hà nội", "T.P Hà Nội"],
            districts: [
                { d: "Quận Ba Đình", dVariants: ["Ba Đình", "ba dinh", "Q.Ba Đình"], wards: ["Phường Quán Thánh", "Quán Thánh", "quan thanh"] },
                { d: "Quận Cầu Giấy", dVariants: ["Cầu Giấy", "cau giay", "Q. Cầu Giấy"], wards: ["Phường Dịch Vọng", "Dịch Vọng", "dich vong"] }
            ]
        },
        { 
            p: "Tỉnh Cao Bằng", 
            pVariants: ["cao bằng", "tỉnh cao bằng", "Cao Bang", "tinh Cao Bang"],
            districts: [
                { d: "Huyện Thạch An", dVariants: ["Thạch An", "thach an", "h.thach an"], wards: ["Thị trấn Đông Khê", "Đông Khê", "dong khe"] },
                { d: "Huyện Quảng Hòa", dVariants: ["Quảng Hòa", "quang hoa"], wards: ["Xã Phúc Sen", "Phúc Sen", "phuc sen"] }
            ]
        },
        { 
            p: "Thành phố Hồ Chí Minh", 
            pVariants: ["tp.hcm", "Hồ Chí Minh", "TP HCM", "hcm"],
            districts: [
                { d: "Quận 1", dVariants: ["Q1", "quan 1", "Quận 01"], wards: ["Phường Bến Nghé", "Bến Nghé", "ben nghe"] },
                { d: "Quận Bình Thạnh", dVariants: ["Bình Thạnh", "binh thanh"], wards: ["Phường 15", "p15", "phuong 15"] }
            ]
        }
    ];

    for (let i = 1; i <= number; i++) {
        // Chọn ngẫu nhiên bộ địa chỉ logic
        const geo = geoMatrix[i % geoMatrix.length];
        const dist = geo.districts[i % geo.districts.length];
        const ward = dist.wards[i % dist.wards.length];

        // Tạo lỗi ngẫu nhiên: 30% số bản ghi sẽ dùng tên viết tắt/không dấu
        const useVariant = i % 3 === 0;
        
        const province = useVariant ? geo.pVariants[i % geo.pVariants.length] : geo.p;
        const district = useVariant ? dist.dVariants[i % dist.dVariants.length] : dist.d;
        const finalWard = useVariant ? ward.toLowerCase() : ward;

        // Tạo trùng lặp: cứ mỗi 50 bản ghi sẽ có 1 cặp trùng hoàn toàn để test logic uniqueData
        let email = `testuser${i}@gmail.com`;
        let sdt = `0912${i.toString().padStart(6, '0')}`;
        
        if (i % 50 === 0) {
            email = `testuser${i-1}@gmail.com`; // Trùng với thằng ngay trước nó
            sdt = `0912${(i-1).toString().padStart(6, '0')}`;
        }

        data.push({
            "Họ ": hoList[i % 10],
            "Tên đệm": tenDemList[i % 10],
            "Tên": tenList[i % 10],
            "Giới tính": i % 2 === 0 ? "Nam" : "NỮ",
            "Email": email,
            "SDT": sdt,
            "Ngày sinh": `${(i % 28) + 1}-${((i % 12) + 1).toString().padStart(2, '0')}-199${i % 10}`,
            "Tỉnh/Thành Phố": province,
            "Quận/Huyện": district,
            "Phường/Xã": finalWard
        });
    }

    // Xuất file
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data_1000_Users");
    
    XLSX.writeFile(workbook, "test_1000_users.xlsx");
    console.log("✅ Đã tạo file test_1000_users.xlsx với 1000 bản ghi!");
};

// generateTestData(1000);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
