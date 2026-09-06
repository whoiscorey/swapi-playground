const categories = [
  "films",
  "people",
  "planets",
  "species",
  "starships",
  "vehicles",
];
const base = `https://swapi.info/api/`;

function swapiArgs(type, property) {
  const arg = process.argv[type];

  if (!arg)
    return undefined;

  if (property === undefined)
    return arg;

  return arg.split('.')[property];
}

function swapiHandler(response, category, id) {
  if (!category)
    throw new Error(`category required: ${categories.join(", ")}`);

  if (id && !response.ok)
    throw new Error(`${category} id ${id} not found`);
}

async function swapiResolver(url) {
  return fetch(url)
    .then(response => response.json())
    .then(data => data.title || data.name || url);
}

async function swapiProps(category, properties) {
  const result = {};

  for (const property of properties) {
    const url = category[property];

    if (property === 'url') {
      result[property] = url;
      continue;
    }

    if (Array.isArray(url)) {
      result[property] = await Promise.all(url.map(urls => swapiResolver(urls)))
      continue;
    }

    if (typeof url === 'string' && url.startsWith(base)) {
      result[property] = await swapiResolver(url)
      continue
    }

    result[property] = url;
  };

  return result;
}

async function swapiData(json, property) {
  const properties = property
    ? property.split(',')
    : Object.keys(Array.isArray(json) ? json[0] : json);

  if (Array.isArray(json))
    return await Promise.all(json.map(category => swapiProps(category, properties)));

  return await swapiProps(json, properties);
}

function swapiFetch(url, category, property, id) {
  fetch(url)
    .then((response) => {
      swapiHandler(response, category, id);
      return response.json();
    })
    .then((json) => swapiData(json, property).then((data) => console.log(data)))
    .catch((error) => console.error(error.message));
}

function swapiJoe() {
  const category = categories.find((arg) => arg === swapiArgs(2, 0));
  const property = swapiArgs(2, 1);
  const id = swapiArgs(3);

  let path = `${category}/`;

  if (id)
    path += `${id}`;

  const url = new URL(path, base);

  swapiFetch(url, category, property, id);
}

swapiJoe();
