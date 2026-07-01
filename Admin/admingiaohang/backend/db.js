const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Huy.nh1808234',
  database: 'logistic_system'
});

db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối database:', err);
    return;
  }
  console.log('Kết nối thành công đến MySQL');
});

module.exports = db;
