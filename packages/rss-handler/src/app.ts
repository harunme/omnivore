require('dotenv').config();
const express = require('express');
const { rssHandler } = require('./index');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req:any, res:any) => {
    return res.send('rss-handler')
});

app.post('/', async (req:any, res:any) => {
  await rssHandler(req,res);
});

// @ts-ignore
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
