const categories = [
  "films",
  "people",
  "planets",
  "species",
  "starships",
  "vehicles",
];
const base = `https://swapi.dev/api/`;
const operators = ['before', 'after'];
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
  if (Array.isArray(json) && json.length === 0)
    return json;

  const array = Array.isArray(json) ? json[0] : json
  const properties = property ? property.split(',') : Object.keys(array);

  if (Array.isArray(json))
    return await Promise.all(json.map(category => swapiProps(category, properties)));

  return await swapiProps(json, properties);
}

function swapiDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value);
}

function swapiCompare(value, query, operator) {
  const date = String(value).slice(0, query.length);

  return operator === 'before' ? date < query : date > query;
}

async function swapiSearch(data, options) {
  const { query, property, searchProperty, operator } = options;
  const array = (Array.isArray(data) && data.length > 0);

  if (!query || !array)
    return undefined;

  const search = query.toLowerCase();
  const results = Array.isArray(data) ? data : [data];

  if (operator) {
    const sample = results.find(values => values[searchProperty] !== undefined);

    if (!swapiDate(sample && sample[searchProperty]))
      throw new Error(`error: ${operator} operator requires a date property\n`
        + `${operator} operator supported properties: created, edited, release_date`);

    if (!/^\d{4}(-\d{2}){0,2}$/.test(query))
      throw new Error(`error: ${operator} operator requires proper date formatting\nsupported formats: yyyy, yyyy-mm-dd`);
  }

  const result = results.filter(values => {
    const target = searchProperty ? values[searchProperty] : Object.values(values);

    if (operator)
      return swapiCompare(target, query, operator)

    if (typeof target === 'string')
      return target.toLowerCase().includes(search);

    if (Array.isArray(target))
      return target.some(value => typeof value === 'string' && value.toLowerCase().includes(search));

    return false;
  });

  return await swapiData(result, property);
}

function swapiFetch(url, options) {
  const { property, searchProperty, mode } = options;

  fetch(url)
    .then((response) => {
      if (mode === 'id' && !response.ok)
        throw new Error('id not found');

      return response.json();
    })
    .then(async (json) => {
      const pages = json.next ? await swapiPages(json.next) : [];
      const data = json.results ? [...json.results, ...pages] : json;

      if (mode !== 'search')
        return swapiData(data, property);

      const fields = searchProperty && property
        ? [...new Set([searchProperty, ...property.split(',')])].join(',')
        : undefined;

      const resolved = await swapiData(data, fields);
      return swapiSearch(resolved, options)
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
    const available = `available categories: ${categories.join(', ')}`;
    const input = swapiArgs(2, 0);

    if (!input)
      return console.log(available);

    const category = categories.find((arg) => arg === input);

    if (!category)
      throw new Error(`error, supported category required\n${available}`);

    const property = swapiArgs(2, 1);

    const searchArg = swapiArgs(3, 0);
    const searchProperty = swapiArgs(3, 1);

    const search = searchArg === 'search';
    const operator = search && operators.includes(swapiArgs(4)) ? swapiArgs(4) : undefined;
    const id = search ? undefined : swapiArgs(3);
    const mode = search ? 'search' : (id ? 'id' : 'list');
    const query = search ? (operator ? swapiArgs(5) : swapiArgs(4)) : undefined;

    if (mode === 'search' && !query)
      throw new Error('error, search query required: `node swapi people search luke`')

    if (operator && !searchProperty)
      throw new Error('error: operator requires a date property: `node swapi films search.release_date before 2005`');

    let path = `${category}/`;

    if (mode === 'id')
      path += `${id}`

    const url = new URL(path, base);
    const options = { property, mode, query, searchProperty, operator };

    swapiFetch(url, options);

  } catch (error) {
    console.error(error.message);
  }
}

swapiJoe();
