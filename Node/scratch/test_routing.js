const express = require('express');
const app = express();

app.use((req, res, next) => {
  console.log(`BEFORE ROUTER: req.url = ${req.url}, req.baseUrl = ${req.baseUrl}`);
  next();
});

const router = express.Router();
router.use((req, res, next) => {
  console.log(`INSIDE ROUTER: req.url = ${req.url}, req.baseUrl = ${req.baseUrl}`);
  next();
});

router.get('/test/:id', (req, res) => {
  res.send('MATCHED');
});

app.use('/api', router);
app.use('/', router);

app.use((req, res) => {
  console.log(`AFTER ROUTER (404): req.url = ${req.url}`);
  res.status(404).send('NOT FOUND');
});

const server = app.listen(3003, () => {
  console.log('Test server running on port 3003');
});
