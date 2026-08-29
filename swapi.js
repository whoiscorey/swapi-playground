function swapiFetch(url) {
  fetch(url)
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error))
}

function swapi() {
  const categories = ['films', 'people', 'planets', 'species', 'starships', 'vehicles']

  const category = categories.find((arg) => arg === process.argv[2])
  const id = process.argv[3]

  const baseUrl = `https://swapi.info/api`
  const categoryUrl = `${baseUrl}/${category}`
  const idUrl = `${categoryUrl}/${id}`

  switch (true) {
    case !!id:
      swapiFetch(idUrl)
      break
    case !!category:
      swapiFetch(categoryUrl)
      break
    default:
      console.log('category required:')
      swapiFetch(baseUrl)
  }
}

swapi()
