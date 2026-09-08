const categories = [
  "films",
  "people",
  "planets",
  "species",
  "starships",
  "vehicles",
];
const base = `https://swapi.dev/api/`;

function swapiArgs(type, property) {
  const arg = process.argv[type];

  if (!arg) return undefined;

  if (property === undefined) return arg;

  return arg.split(".")[property];
}

async function swapiResolver(value) {
  if (typeof value !== "string" || !value.startsWith(base)) return value;

  return fetch(value)
    .then((response) => response.json())
    .then((data) => data.title || data.name || value)
    .catch(() => value);
}

async function swapiProps(category, properties) {
  const result = {};

  for (const property of properties) {
    const value = category[property];

    if (property === "url") {
      result[property] = value;
      continue;
    }

    if (Array.isArray(value)) {
      result[property] = await Promise.all(
        value.map((url) => swapiResolver(url)),
      );
      continue;
    }

    if (typeof value === "string" && value.startsWith(base)) {
      result[property] = await swapiResolver(value);
      continue;
    }

    result[property] = value;
  }

  return result;
}

async function swapiData(json, property) {
  const input = Array.isArray(json) ? json[0] : json;
  console.log(json, "--- json ---");
  console.log(json[0], "--- json[0] ---");
  console.log(property, "--- property ---");

  if ((!property && !input) || input.length === 0)
    throw new Error("no results found");
  console.log(input, "--- input ---");

  let properties;

  if (property) {
    properties = property.split(",");
  } else {
    properties = Object.keys(input);
  }

  if (Array.isArray(json))
    return await Promise.all(
      json.map((category) => swapiProps(category, properties)),
    );

  return await swapiProps(json, properties);
}

async function swapiSearch(query, data, property, searchProperty) {
  if (!query || !data || (Array.isArray(data) && data.length === 0))
    return undefined;

  const search = query.toLowerCase();
  const results = Array.isArray(data) ? data : [data];

  const result = results.filter((values) => {
    const target = searchProperty
      ? values[searchProperty]
      : Object.values(values);

    if (typeof target === "string")
      return target.toLowerCase().includes(search);

    if (Array.isArray(target))
      return target.some(
        (value) =>
          typeof value === "string" && value.toLowerCase().includes(search),
      );

    return false;
  });

  console.log(result, "--- result ---");
  return await swapiData(result, property);
}

function swapiFetch(url, category, property, id, query, searchProperty) {
  fetch(url)
    .then((response) => {
      if (id && !response.ok) throw new Error(`${category} id ${id} not found`);
      return response.json();
    })
    .then((json) => {
      const data = json.results || json;
      console.log(data, "--- data ---");
      return swapiData(data, id === "search" ? undefined : property);
    })
    .then(async (data) => {
      if (id === "search") {
        data = await swapiSearch(query, data, property, searchProperty);
      }
      console.dir(data, { depth: null });
    })
    .catch((error) => console.error(error));
}

function swapiJoe() {
  try {
    const category = categories.find((arg) => arg === swapiArgs(2, 0));

    if (!category)
      throw new Error(`error, category required: ${categories.join(", ")}`);

    const property = swapiArgs(2, 1);

    const searchArg = swapiArgs(3, 0);
    const searchProperty = swapiArgs(3, 1);

    const search = searchArg === "search";
    const id = search ? "search" : swapiArgs(3);
    const query = search ? swapiArgs(4) : undefined;

    if (typeof id === "string" && id === "search" && !query)
      throw new Error("error, query required: `node swapi people search luke`");

    let path = `${category}/`;

    if (
      (!isNaN(id) && id !== undefined) ||
      (typeof id === "string" && id !== "search")
    ) {
      path += `${id}`;
    }

    const url = new URL(path, base);

    swapiFetch(url, category, property, id, query, searchProperty);
  } catch (error) {
    console.error(error.message);
  }
}

swapiJoe();
