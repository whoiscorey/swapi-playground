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
    return undefined

  if (property === undefined)
    return arg

  return arg.split('.')[property]
}

function swapiHandler(response, category, id) {
  if (!category)
    throw new Error(`category required: ${categories.join(", ")}`);

  if (id && !response.ok)
    throw new Error(`${category} id ${id} not found`);
}

function swapiProps(category, properties) {
  const result = {};

  properties.forEach((property) => {
    result[property] = category[property];
  });

  return result;
}

function swapiData(json, property) {
  if (!property)
    return json;

  const properties = property.split(',');

  if (Array.isArray(json))
    return json.map((category) => swapiProps(category, properties));

  return swapiProps(json, properties);
}

function swapiFetch(url, category, property, id) {
  fetch(url)
    .then((response) => {
      swapiHandler(response, category, id);
      return response.json();
    })
    .then((json) => {
      const data = swapiData(json, property)
      console.log(data)
    })
    .catch((error) => console.error(error.message));
}

function swapiJoe() {
  const category = categories.find((arg) => arg === swapiArgs(2, 0));
  const property = swapiArgs(2, 1);
  const id = swapiArgs(3);

  let path = `${category}/`;

  if (id)
    path += `${id}`

  const url = new URL(path, base);

  swapiFetch(url, category, property, id);
}

swapiJoe();
