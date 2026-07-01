const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/customers', require('./routes/Customers'));
app.use('/api/staff', require('./routes/Staff'));
app.use('/api/warehouses', require('./routes/Warehouse'));
app.use('/api/services', require('./routes/Service'));
app.use('/api/orders', require('./routes/Order'));
app.use('/api/payments', require('./routes/Payments'));
app.use('/api/packages', require('./routes/Package'));
app.use('/api/vehicles', require('./routes/Vehicle'));
app.use('/api/tracking', require('./routes/Tracking'));
app.use('/api/routes', require('./routes/Route'));
app.use('/api/route-points', require('./routes/RoutePoint'));
app.use('/api/transactions', require('./routes/Transactions'));
app.use('/api/accounts', require('./routes/Account'));

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
