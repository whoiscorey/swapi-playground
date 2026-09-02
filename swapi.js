const categories = [
  "films",
  "people",
  "planets",
  "species",
  "starships",
  "vehicles",
];
const baseUrl = `https://swapi.info/api/`;

function swapiFetch(url) {
  fetch(url)
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
}

function swapiJoe() {
  const category = categories.find((arg) => arg === process.argv[2]);
  const id = process.argv[3];

  const categoryUrl = new URL(`./${category}`, baseUrl);
  const idUrl = new URL(`./${category}/${id}`, baseUrl);

  switch (true) {
    case !!id:
      swapiFetch(idUrl);
      break;
    case !!category:
      swapiFetch(categoryUrl);
      break;
    default:
      console.error("category required:");
      swapiFetch(baseUrl);
  }
}

swapiJoe();
