
// Tạo chuỗi password đã hash
const bcrypt = require('bcryptjs');
const password = '234567';

bcrypt.hash(password, 10).then(hash => {
    console.log(hash); // copy chuỗi này và lưu vào DB
});