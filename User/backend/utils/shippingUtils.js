// === File: backend/utils/shippingUtils.js (ORS + fallback Haversine) ===
const axios = require('axios');
require('dotenv').config();

const OPENCAGE_KEY = process.env.OPENCAGE_KEY;
const OPENROUTESERVICE_KEY = process.env.OPENROUTESERVICE_KEY;

function normalizeText(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function geocodeCity(address) {
  const res = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
    params: {
      q: address,
      key: OPENCAGE_KEY,
      countrycode: 'vn',
      limit: 1,
      language: 'vi'
    },
  });

  const result = res.data.results?.[0];
  if (!result) throw new Error(`Không tìm thấy tọa độ cho: ${address}`);

  const coords = [result.geometry.lng, result.geometry.lat];
  const components = result.components || {};

  const province = components.state || components.county || '';
  const locality = components.city || components.town || components.village || components.suburb || '';

  return {
    coords,
    province,
    locality,
  };
}

function haversineDistance(fromCoords, toCoords) {
  const toRad = deg => deg * (Math.PI / 180);
  const [lng1, lat1] = fromCoords;
  const [lng2, lat2] = toCoords;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getDistance(fromCoords, toCoords) {
  console.log('📍 Từ:', fromCoords);
  console.log('📍 Đến:', toCoords);

  if (
    !Array.isArray(fromCoords) || fromCoords.length !== 2 ||
    !Array.isArray(toCoords) || toCoords.length !== 2
  ) {
    throw new Error('Tọa độ không hợp lệ');
  }

  const url = 'https://api.openrouteservice.org/v2/directions/driving-car?instructions=false';
  try {
    const res = await axios.post(
      url,
      {
        coordinates: [fromCoords, toCoords],
        options: {
          avoid_features: [],
          avoid_polygons: null
        }
      },
      {
        headers: {
          Authorization: OPENROUTESERVICE_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!res.data || !res.data.features || res.data.features.length === 0) {
      throw new Error('ORS không có dữ liệu');
    }

    const route = res.data.features[0];
    const distance = route.properties.segments[0].distance;
    const duration = route.properties.segments[0].duration;

    return {
      distanceKm: parseFloat((distance / 1000).toFixed(2)),
      durationHours: parseFloat((duration / 3600).toFixed(2)),
    };
  } catch (err) {
    console.log('⚠️ ORS thất bại, fallback qua Haversine');
    const fallbackDistance = haversineDistance(fromCoords, toCoords) * 1.3; // thêm hệ số ước lượng đường thật
    return {
      distanceKm: parseFloat(fallbackDistance.toFixed(2)),
      durationHours: parseFloat((fallbackDistance / 40).toFixed(2)), // giả định tốc độ TB 40km/h
    };
  }
}

function determineRegion(fromProvince, toProvince) {
  const NORTH = ["Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Cao Bằng", "Điện Biên", "Hà Giang", "Hà Nam", "Hà Nội", "Hải Dương", "Hải Phòng", "Hòa Bình", "Hưng Yên", "Lai Châu", "Lạng Sơn", "Lào Cai", "Nam Định", "Ninh Bình", "Phú Thọ", "Quảng Ninh", "Sơn La", "Thái Bình", "Thái Nguyên", "Tuyên Quang", "Vĩnh Phúc", "Yên Bái"];
  const CENTRAL = ["Bình Định", "Bình Thuận", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Gia Lai", "Hà Tĩnh", "Khánh Hòa", "Kon Tum", "Lâm Đồng", "Ninh Thuận", "Nghệ An", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Trị", "Thanh Hóa", "Thừa Thiên Huế"];
  const SOUTH = ["An Giang", "Bà Rịa Vũng Tàu", "Bạc Liêu", "Bến Tre", "Bình Dương", "Bình Phước", "Cà Mau", "Cần Thơ", "Đồng Nai", "Đồng Tháp", "Hậu Giang", "TP Hồ Chí Minh", "Kiên Giang", "Long An", "Sóc Trăng", "Tây Ninh", "Tiền Giang", "Trà Vinh", "Vĩnh Long"];

  if (fromProvince === toProvince) return 'nội_tỉnh';
  const inSameRegion =
    (NORTH.includes(fromProvince) && NORTH.includes(toProvince)) ||
    (CENTRAL.includes(fromProvince) && CENTRAL.includes(toProvince)) ||
    (SOUTH.includes(fromProvince) && SOUTH.includes(toProvince));
  return inSameRegion ? 'nội_miền' : 'liên_miền';
}

function isUrbanDistrict(localityRaw = '') {
  const normalized = normalizeText(localityRaw);
  const urbanDistricts = ['quan 1', 'quan 3', 'quan 4', 'quan 5', 'quan 6', 'quan 7', 'quan 8', 'quan 10', 'quan 11', 'go vap', 'tan binh', 'tan phu', 'phu nhuan', 'binh thanh', 'thu duc', 'hoan kiem', 'ba dinh', 'cau giay', 'dong da', 'hai ba trung', 'thanh xuan', 'hai chau', 'thanh khe', 'son tra', 'my tho'];
  return urbanDistricts.some(d => normalized.includes(d));
}

function calculatePrice(region, chargeableWeight, extraServices = [], isUrban = true, declaredValue = 0) {
  const baseRates = {
    nội_tỉnh: {
      nội_thành: [22000, 22000, 22000, 22000],
      ngoại_thành: [25000, 25000, 25000, 25000],
    },
    nội_miền: {
      nội_thành: [28000, 30500, 33000, 35500],
      ngoại_thành: [32500, 35500, 38000, 41000],
    },
    liên_miền: {
      nội_thành: [31000, 36000, 41500, 46000],
      ngoại_thành: [36000, 41500, 48000, 53000],
    },
  };
  const extraPerHalfKg = {
    nội_tỉnh: { nội_thành: 6000, ngoại_thành: 7000 },
    nội_miền: { nội_thành: 8000, ngoại_thành: 9000 },
    liên_miền: { nội_thành: 12000, ngoại_thành: 14000 },
  };

  const type = isUrban ? 'nội_thành' : 'ngoại_thành';
  let basePrice = baseRates[region][type][3];
  if (chargeableWeight <= 2.0) {
    const index = Math.floor((chargeableWeight - 0.01) / 0.5);
    basePrice = baseRates[region][type][index];
  } else {
    const extraWeight = chargeableWeight - 2.0;
    basePrice += Math.ceil(extraWeight / 0.5) * extraPerHalfKg[region][type];
  }

  let extraFee = 0;
  if (extraServices.includes('speed')) extraFee += 15000;
  if (extraServices.includes('fragile')) extraFee += 10000;
  if (extraServices.includes('cod')) extraFee += 5000;
  const insurance = declaredValue > 0 ? declaredValue * 0.01 : 0;

  return basePrice + extraFee + insurance;
}

module.exports = {
  normalizeText,
  geocodeCity,
  getDistance,
  determineRegion,
  isUrbanDistrict,
  calculatePrice,
};
