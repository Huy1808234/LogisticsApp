const db = require("./utils/db");
const { geocodeCity } = require("./services/shippingService"); // import từ chỗ bạn đã viết
require("dotenv").config();

async function updateWarehouseCoordinates() {
  const conn = await db.getConnection();

  const [warehouses] = await conn.query(`
    SELECT WarehouseID, Street, Ward, District, City FROM Warehouse
  `);

  for (const wh of warehouses) {
    const address = [wh.Street, wh.Ward, wh.District, wh.City].filter(Boolean).join(", ");
    console.log(`📍 Geocoding kho ${wh.WarehouseID}: ${address}`);

    try {
      const geo = await geocodeCity(address);
      const [lng, lat] = geo.coords;

      await conn.query(
        `UPDATE Warehouse SET Lat = ?, Lng = ?, Updated_at = NOW() WHERE WarehouseID = ?`,
        [lat, lng, wh.WarehouseID]
      );

      console.log(`✅ Cập nhật: ${lat}, ${lng}`);
    } catch (err) {
      console.warn(`❌ Không thể geocode kho ${wh.WarehouseID}: ${err.message}`);
    }
  }

  conn.release();
  console.log("🎉 Hoàn tất cập nhật tọa độ cho kho.");
}

updateWarehouseCoordinates();
