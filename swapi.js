const categories = [
  "films",
  "people",
  "planets",
  "species",
  "starships",
  "vehicles",
];
const base = `https://swapi.dev/api/`;
const cache = new Map();

function swapiArgs(type, property) {
  const arg = process.argv[type];

  if (!arg)
    return undefined;

  if (property === undefined)
    return arg;

  return arg.split('.')[property];
}

async function swapiPages(url) {
  const results = [];
  let next = url;

  while (next) {
    const response = await fetch(next);
    const json = await response.json();

    if (Array.isArray(json))
      return json;

    results.push(...json.results);
    next = json.next;
  }

  return results;
}

async function swapiResolver(value) {
  if (typeof value !== 'string' || !value.startsWith(base))
    return value;

  const category = value.slice(base.length).split('/')[0];
  const url = new URL(`${category}/`, base)

  if (!cache.has(category))
    cache.set(category, swapiPages(url)
      .then(list => new Map(list.map(item => [item.url, item.title || item.name || item.url])))
      .catch(error => {
        console.error(`error: could not resolve ${category}: ${error.message}`);
        return new Map();
      }));

  const map = await cache.get(category);
  return map.get(value) ?? value;
};

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
  if (Array.isArray(json) && json.length === 0)
    return json;

  const array = Array.isArray(json) ? json[0] : json
  const properties = property ? property.split(',') : Object.keys(array);

  if (Array.isArray(json))
    return await Promise.all(json.map(category => swapiProps(category, properties)));

  return await swapiProps(json, properties);
}

async function swapiSearch(query, data, property, searchProperty) {
  const array = (Array.isArray(data) && data.length > 0);

  if (!query || !array)
    return undefined;

  const search = query.toLowerCase();
  const results = Array.isArray(data) ? data : [data];

  const result = results.filter(values => {
    const target = searchProperty ? values[searchProperty] : Object.values(values);

    if (typeof target === 'string')
      return target.toLowerCase().includes(search);

    if (Array.isArray(target))
      return target.some(value => typeof value === 'string' && value.toLowerCase().includes(search));

    return false;
  });

  return await swapiData(result, property);
}

function swapiFetch(url, property, id, query, searchProperty) {
  fetch(url)
    .then((response) => {
      if (id && !response.ok)
        throw new Error('id not found');

      return response.json();
    })
    .then(async (json) => {
      const pages = json.next ? await swapiPages(json.next) : [];
      const data = json.results ? [...json.results, ...pages] : json;

      if (id !== 'search')
        return swapiData(data, property);

      const fields = searchProperty && property
        ? [...new Set([searchProperty, ...property.split(',')])].join(',')
        : undefined;

      const resolved = await swapiData(data, fields);
      return swapiSearch(query, resolved, property, searchProperty)
    })
    .then((data) => {
      if (data && data.length === 0)
        throw new Error('no results')

      console.log(data);
    })
    .catch((error) => console.error(error.message))
}

function swapiJoe() {
  try {
    const category = categories.find((arg) => arg === swapiArgs(2, 0));

    if (!category)
      throw new Error(`error, category required: ${categories.join(", ")}`);

    const property = swapiArgs(2, 1);

    const searchArg = swapiArgs(3, 0);
    const searchProperty = swapiArgs(3, 1);

    const search = searchArg === 'search';
    const id = search ? 'search' : swapiArgs(3);
    const query = search ? swapiArgs(4) : undefined;

    if (id === 'search' && !query)
      throw new Error('error, query required: `node swapi people search luke`')

    let path = `${category}/`;

    if (typeof id === 'string' && id !== 'search')
      path += `${id}`

    const url = new URL(path, base);

    swapiFetch(url, property, id, query, searchProperty);

  } catch (error) {
    console.error(error.message);
  }
}

swapiJoe();
