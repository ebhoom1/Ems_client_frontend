import axios from "axios";

// Fiscal year range helper
export const fiscalYearRange = (iso) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const s = m >= 4 ? y : y - 1;
  const e = s + 1;
  return `${String(s).slice(-2)}-${String(e).slice(-2)}`;
};

// Site code sanitizer
export const siteCode = (site) =>
  (site || "SITE").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "SITE";

// Local fallback series
const localSeries = ({ site, isoDate, prefix }) => {
  const key = `seq-${prefix}-${siteCode(site)}-${fiscalYearRange(isoDate)}`;
  const next = Number(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(next));
  return `${siteCode(site)}/${prefix}/${fiscalYearRange(isoDate)}/${String(next).padStart(3, "0")}`;
};

// API-backed generator
export const nextReportNumber = async ({ apiBase, site, isoDate, prefix }) => {
  try {
    const fy = fiscalYearRange(isoDate);
    const { data } = await axios.get(
      `${apiBase}/api/reports/next-seq?fy=${fy}&site=${encodeURIComponent(site)}&prefix=${prefix}`
    );
    if (data?.success && data?.reportNo) return data.reportNo;
  } catch {}
  return localSeries({ site, isoDate, prefix });
};

