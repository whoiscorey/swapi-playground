const categories = [
  "films",
  "people",
  "planets",
  "species",
  "starships",
  "vehicles",
];
const baseUrl = `https://swapi.info`;

function swapiHandler(res, category, id) {
  if (!category) {
    throw new Error(`category required: ${categories.join(", ")}`);
  }
  if (!res.ok) {
    throw new Error(`${category} id ${id} not found`);
  }
}

function swapiFetch(url, category, id) {
  fetch(url)
    .then((res) => {
      swapiHandler(res, category, id);
      return res.json();
    })
    .then((json) => console.log(json))
    .catch((error) => console.error(error.message));
}

function swapiJoe() {
  const category = categories.find((arg) => arg === process.argv[2]);
  const id = process.argv[3];

  let urlPath = `/api/${category}`;

  if (id) {
    urlPath += `/${id}`;
  }

  const url = new URL(urlPath, baseUrl);

  swapiFetch(url, category, id);
}

swapiJoe();
