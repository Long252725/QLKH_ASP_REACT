using System;
using System.Globalization;

namespace MyBackendAPI.Helpers
{
    public static class FormatDateHelper
    {
        public static string FormatDate(object value)
        {
            if (value == null) return "";

            DateTime dt;

            if (value is DateTime dateTimeValue)
            {
                dt = dateTimeValue;
            }
            else if (double.TryParse(value.ToString(), out double serialDate))
            {
                dt = DateTime.FromOADate(serialDate);
            }
            else
            {
                string dateStr = value.ToString().Trim();
                if (string.IsNullOrEmpty(dateStr)) return "";

                string[] formats = { "dd/MM/yyyy", "dd-MM-yyyy", "yyyy-MM-dd", "M/d/yyyy", "yyyy/MM/dd" };
        
                if (!DateTime.TryParseExact(dateStr, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out dt))
                {
                    // Nếu không khớp định dạng chuẩn, thử cho parse tự do
                    if (!DateTime.TryParse(dateStr, out dt))
                    {
                        return ""; // Không parse được thì trả về rỗng
                    }
                }
            }

            // Trả về định dạng DD-MM-YYYY
            return dt.ToString("dd-MM-yyyy");
        }}
}


