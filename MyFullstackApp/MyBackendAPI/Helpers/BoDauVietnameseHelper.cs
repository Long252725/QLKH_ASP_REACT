using System.Globalization;
using System.Text;

public static class BoDauVietnameseHelper {
    public static string RemoveVietnameseDiacritics(string str)
        {
            // Chuyển sang FormD (NFD)
            string nfdNormalizedString = str.Normalize(NormalizationForm.FormD);
            StringBuilder sb = new StringBuilder();

            foreach (char c in nfdNormalizedString)
            {
                UnicodeCategory uc = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
                // Chỉ giữ lại các ký tự không phải là dấu (NonSpacingMark)
                if (uc != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }

            // Thay thế chữ 'đ' thủ công vì FormD không tách được 'đ' thành 'd' + dấu
            string finalString = sb.ToString().Normalize(NormalizationForm.FormC);
            return finalString.Replace('đ', 'd').Replace('Đ', 'D');
        }
}