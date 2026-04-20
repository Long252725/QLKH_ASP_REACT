const KhachHang = require('../models/KhachHang')
import { handleDatas } from '../../until'
class FormController {
    index(req, res) {
        res.render('formKhachHang')
    }
    createKhachHang(req, res) {
        // res.json({ success: true, message: 'Dữ liệu đã được nhận!' })
        const data = req.body
        const khachHang = new KhachHang(data)
        khachHang.save()
            .then(() => {
                res.json({ success: true, message: 'Khách hàng đã được tạo thành công!' })
            })
            .catch(err => {
                console.error('Lỗi khi tạo khách hàng:', err);
                res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi tạo khách hàng.' })
            })
    }
    showKhachHang(req, res) {
        const customerId = req.params.customerId;
        KhachHang.findOne({
            customerId: customerId
        })
        .then(khachHang => {
            res.render('showKhachHang', {
                khachHang: khachHang
            })
        })
    }
    search(req, res) {
        const name = req.query.name;
        KhachHang.findOne({
            HoTen: name
        })
        .then(khachHang => {
            res.json({ success: true, khachHang: khachHang })
        })
        .catch(err => {
            console.error('Lỗi khi tìm kiếm khách hàng:', err);
            res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi tìm kiếm khách hàng.' })
        })
    }
    updateKhachHang(req, res) {
        const data = req.body;
        const customerId = data.customerId;
        console.log(customerId)

        KhachHang.findOneAndUpdate(
            { customerId: customerId },
            { $set: data },
            { new: true }
        )
        .then(khachHang => {
            res.json({ success: true, message: 'Khách hàng đã được cập nhật thành công!', khachHang: khachHang })
        })
        .catch(err => {
            console.error('Lỗi khi cập nhật khách hàng:', err);
            res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi cập nhật khách hàng.' })
        })
    }

}

module.exports = new FormController