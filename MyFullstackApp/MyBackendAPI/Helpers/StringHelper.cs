using System.Text.RegularExpressions;
using System.Globalization;
namespace MyBackendAPI.Helpers;
public static class StringHelper
{
    public static string FormatName(string input)
    {
        if (string.IsNullOrEmpty(input)) return "";

        string clean = Regex.Replace(input, @"[^a-zA-ZÀ-ỹ\s]", "").Trim();
        if (string.IsNullOrEmpty(clean)) return "";

        TextInfo textInfo = new CultureInfo("vi-VN", false).TextInfo;
        return textInfo.ToTitleCase(clean.ToLower());
    }
}