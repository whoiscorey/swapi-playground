const categories = [
  "films",
  "people",
  "planets",
  "species",
  "starships",
  "vehicles",
];
const base = `https://swapi.info/api/`;

function swapiHandler(res, category, id) {
  if (!category) {
    throw new Error(`category required: ${categories.join(", ")}`);
  }
  if (!res.ok) {
    throw new Error(`${category} id ${id} not found`);
  }
}

function swapiProps(category, properties) {
  if (properties.length === 1) return category[properties[0]];

  const result = {};

  properties.forEach((property) => {
    result[property] = category[property];
  });

  return result;
}

function swapiData(json, property) {
  if (!property) return json;

  const properties = property.split(',');

  if (Array.isArray(json)) {
    return json.map((category) => swapiProps(category, properties));
  }
  return swapiProps(json, properties);
}

function swapiFetch(url, category, property, id) {
  fetch(url)
    .then((res) => {
      swapiHandler(res, category, id);
      return res.json();
    })
    .then((json) => {
      const data = swapiData(json, property)
      console.log(data)
    })
    .catch((error) => console.error(error.message));
}

function swapiJoe() {
  const category = categories.find((arg) => arg === (process.argv[2] || '').split('.')[0]);
  const property = (process.argv[2] || '').split('.')[1];
  const id = process.argv[3];

  let path = `${category}/`;

  if (id) {
    path += `${id}`
  }

  const url = new URL(path, base);

  swapiFetch(url, category, property, id);
}

swapiJoe();
