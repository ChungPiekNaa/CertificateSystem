export function formatDate(value) {
  if (!value) return "";

  const text = String(value).trim();

  // Handle DD/MM/YYYY entered by the user
  const parts = text.split("/");

  if (parts.length === 3) {
    const [day, month, year] = parts;

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthNumber = Number(month);

    if (
      /^\d{1,2}$/.test(day) &&
      /^\d{1,2}$/.test(month) &&
      /^\d{4}$/.test(year) &&
      monthNumber >= 1 &&
      monthNumber <= 12
    ) {
      return `${day.padStart(2, "0")} ${monthNames[monthNumber - 1]} ${year}`;
    }
  }

  // Handle Supabase timestamp
  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (match) {
    const [, year, month, day] = match;

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return `${day} ${monthNames[Number(month) - 1]} ${year}`;
  }

  return text;
}