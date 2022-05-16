import fs from 'fs/promises';

const DB_PATH = new URL('../db.json', import.meta.url);

let data = {};

const load = async () => {
  try {
    const raw = await fs.readFile(DB_PATH);
    data = JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await write();
    }
  }
};

const write = async () => {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};

const get = (key) => {
  return data[key];
};

const set = async (key, val) => {
  await load();
  data[key] = val;
  await write();
};

export { load, get, set };
