import { handleDatas } from '../../until'
import KhachHang from '../models/KhachHang'

class ListController {
    async index(req, res) {
        try {
            // 1. Lấy trang hiện tại từ URL (ví dụ: ?page=2), mặc định là trang 1
            let page = parseInt(req.query.page) || 1;
            if (page < 1) page = 1;

            // 2. Cấu hình số lượng hiển thị
            const limit = 10; // Mỗi trang 10 khách hàng
            const skip = (page - 1) * limit;

            // 3. Thực hiện song song: Đếm tổng số và Lấy dữ liệu theo trang
            const [khachHangs, totalDocs] = await Promise.all([
                KhachHang.find()
                    .skip(skip)
                    .limit(limit)
                    .lean(), // Sử dụng .lean() để object trả về nhẹ hơn và dễ xử lý ở HBS
                KhachHang.countDocuments()
            ]);

            const totalPages = Math.ceil(totalDocs / limit);
            

            // 4. Render kèm theo các thông số phân trang
            res.render('list', {
                khachHangs: khachHangs,
                currentPage: page,
                totalPages: totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                totalDocs: totalDocs
            });

        } catch (err) {
            console.error('Lỗi khi lấy danh sách khách hàng:', err);
            res.status(500).json({ 
                success: false, 
                message: 'Đã xảy ra lỗi khi lấy danh sách khách hàng.' 
            });
        }
    }
    delete(req, res) {
        const ids = req.body.ids; // Mảng ID khách hàng cần xóa
        console.log('IDs nhận được để xóa:', ids);
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có khách hàng nào được chọn để xóa.' });
        }

        KhachHang.deleteMany({ _id: { $in: ids } })
            .then(() => {
                res.json({ success: true, message: 'Đã xóa dữ liệu thành công' });
            })
            .catch(err => {
                console.error('Lỗi khi xóa khách hàng:', err);
                res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi xóa khách hàng.' });
            });
    }
    update(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ success: false, message: 'ID khách hàng không được cung cấp.' });
        }
        KhachHang.findById(id)
            .then(khachHang => {
                if (!khachHang) {
                    return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại.' });
                }
                res.render('edit', { khachHang });
            })
            .catch(err => {
                console.error('Lỗi khi tìm khách hàng:', err);
                res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi tìm khách hàng.' });
            });
    }
}

module.exports = new ListController();