const categories = ['films', 'people', 'planets', 'species', 'starships', 'vehicles']

function swapiFetch(category) {
  const baseUrl = `https://swapi.info/api`
  fetch(`${baseUrl}/${category}`)
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error))
}

function swapi() {
  const category = process.argv[2]
  const result = categories.find((arg) => arg === `${category}`)

  if (result) {
    swapiFetch(`${category}`)
  } else if (!result) {
    console.log(`available categories: ${categories}`)
  } else {
    console.log(`category required: ${categories}`)
  }
}

swapi()
