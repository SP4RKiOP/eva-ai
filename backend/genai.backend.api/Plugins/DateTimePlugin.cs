using Microsoft.SemanticKernel;
using System.ComponentModel;

namespace genai.backend.api.Plugins
{
    public class DateTimePlugin
    {
        [KernelFunction("current_date_time")]
        [Description("Returns the current date and time in a specified format.")]
        [return: Description("The current date and time as a string.")]
        public string GetCurrentDateTime([Description("The date and time format.")] string format = "yyyy-MM-dd HH:mm:ss")
        {
            return DateTime.Now.ToString(format);
        }

        [KernelFunction("add_days_to_date")]
        [Description("Adds a specified number of days to a given date and returns the result.")]
        [return: Description("The resulting date after adding days.")]
        public string AddDaysToDate([Description("The original date.")] string date, [Description("The number of days to add.")] int days)
        {
            DateTime parsedDate;
            if (DateTime.TryParse(date, out parsedDate))
            {
                return parsedDate.AddDays(days).ToString("yyyy-MM-dd");
            }
            else
            {
                throw new ArgumentException("Invalid date format.");
            }
        }

        [KernelFunction("format_date")]
        [Description("Formats a given date into a specified format.")]
        [return: Description("The formatted date as a string.")]
        public string FormatDate([Description("The date to format.")] string date, [Description("The desired format.")] string format = "yyyy-MM-dd")
        {
            DateTime parsedDate;
            if (DateTime.TryParse(date, out parsedDate))
            {
                return parsedDate.ToString(format);
            }
            else
            {
                throw new ArgumentException("Invalid date format.");
            }
        }
    }
}