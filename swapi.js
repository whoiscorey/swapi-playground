const categories = ['films', 'people', 'planets', 'species', 'starships', 'vehicles']

function swapiFetch(category) {
  const baseUrl = `https://swapi.info/api`
  fetch(`${baseUrl}/${category}`)
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error))
}

const swapiCategory = process.argv[2]

swapiFetch(`${swapiCategory}`)
