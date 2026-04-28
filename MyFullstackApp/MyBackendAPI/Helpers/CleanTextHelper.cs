using System.Text.RegularExpressions;

public static class CleanTextHelper
{
    public static string CleanText(string str)
        {
            if (string.IsNullOrWhiteSpace(str)) return "";

            // 1. Chuyển về chữ thường và Trim
            string result = str.ToLower().Trim();

            // 2. Loại bỏ dấu tiếng Việt (Tương đương .normalize("NFD") và replace dấu)
            result = BoDauVietnameseHelper.RemoveVietnameseDiacritics(result);

            // 3. Xóa các tiền tố: tinh, thanh pho, tp, quan, huyen, xa, v.v.
            // Logic: (tinh|thanh\s*pho|tp\.?|quan|huyen|phuong|xa|thi\s*xa|thi\s*tran)\s*
            string patternPrefix = @"(tinh|thanh\s*pho|tp\.?|quan|huyen|phuong|xa|thi\s*xa|thi\s*tran)\s*";
            result = Regex.Replace(result, patternPrefix, "", RegexOptions.IgnoreCase);

            // 4. Xóa sạch khoảng trắng còn lại (\s+)
            result = Regex.Replace(result, @"\s+", "");

            // 5. Chỉ giữ lại chữ cái và số ([^a-z0-9])
            result = Regex.Replace(result, @"[^a-z0-9]", "");

            return result;
        }
}