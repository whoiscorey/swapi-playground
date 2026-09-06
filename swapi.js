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

async function swapiResolver(value) {
  if (typeof value !== 'string' || !value.startsWith(base))
    return value;

  return fetch(value)
    .then(response => response.json())
    .then(data => data.title || data.name || value)
    .catch(() => value);
}

async function swapiProps(category, properties) {
  const result = {};

  for (const property of properties) {
    const value = category[property];

    if (property === 'url') {
      result[property] = value;
      continue;
    }

    if (Array.isArray(value)) {
      result[property] = await Promise.all(value.map(url => swapiResolver(url)))
      continue;
    }

    if (typeof value === 'string' && value.startsWith(base)) {
      result[property] = await swapiResolver(value)
      continue
    }

    result[property] = value;
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

function swapiSearch(query, data) {
  if (!query || !data)
    return undefined;

  const search = query.toLowerCase();
  const results = Array.isArray(data) ? data : [data];

  return results.filter(value => {
    return Object.values(value).some(val => {
      if (typeof val === 'string')
        return val.toLowerCase().includes(search);

      if (Array.isArray(val))
        return val.join(' ').toLowerCase().includes(search);

      return false;
    });
  });
}

function swapiFetch(url, category, property, id, query) {
  fetch(url)
    .then((response) => {
      swapiHandler(response, category, id);
      return response.json();
    })
    .then((json) => {
      return swapiData(json, property);
    })
    .then((data) => {
      if (id === 'search' && query) {
        data = swapiSearch(query, data);
      }
      console.log(data);
    })
    .catch((error) => console.error(error.message))
}

function swapiJoe() {
  const category = categories.find((arg) => arg === swapiArgs(2, 0));
  const property = swapiArgs(2, 1);

  const search = swapiArgs(3) === 'search';
  const id = search ? 'search' : swapiArgs(3);
  const query = search ? swapiArgs(4) : undefined;

  let path = `${category}/`;

  if ((!isNaN(id) && id !== undefined) || (typeof id === 'string' && id === 'schema')) {
    path += `${id}`;
  }

  const url = new URL(path, base);

  swapiFetch(url, category, property, id, query);
}

swapiJoe();
