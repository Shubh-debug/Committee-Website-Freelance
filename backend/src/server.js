import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🪔 गणेश मित्र मंडळ API listening on http://localhost:${PORT}`);
});
