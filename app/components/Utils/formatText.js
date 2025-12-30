export function formatNumber  (num)  {
	// ใช้ toLocaleString() เพื่อเพิ่มเครื่องหมาย , คั่นหลักพัน
	if (typeof num === "number" && !isNaN(num)) {
		return num.toLocaleString();
	}
	return num ?? 0;
};
