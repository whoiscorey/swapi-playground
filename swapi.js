function swapiFetch(category) {
  const baseUrl = `https://swapi.info/api`
  fetch(`${baseUrl}/${category}`)
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error))
}

function swapi() {
  const categories = ['films', 'people', 'planets', 'species', 'starships', 'vehicles']
  const category = process.argv[2]
  const result = categories.find((arg) => arg === `${category}`)

  switch (true) {
    case !!result:
      swapiFetch(category)
      break
    case !category:
      console.log(`category required: ${categories}`)
      break
    default:
      console.log(`available categories: ${categories}`)
  }
}

swapi()
