# Star Wars API Playground
Having fun with the Star Wars API

### getting started
- clone the repo
- `cd swapi-playground`
- run with `node`
- categories used in the examples are inter-changeable with the other categories (films, people, planets, species, starships, vehicles)
- properties used in examples are not inter-changeable between categories, run `node swapi category schema` for available properties

#### syntax overview
- get a category schema:
  - `node swapi category schema`
- get data for an entire category:
  - `node swapi category`
- get data for an id in a category:
  - `node swapi category id`
- get data of one property of an entire category:
  - `node swapi category.property`
- get data of one property for an id in a category:
  - `node swapi category.property id`
- get data of multiple properties for an entire category:
  - `node swapi category.property1,property2`
- get data of multiple properties for an id in a category:
  - `node swapi category.property1,property2 id`

### usage examples: 

#### list available categories: 
```javascript
node swapi

// returns: category required: films, people, planets, species, starships, vehicles
```
 - fetches the base URL and returns a list of categorie
 - this is also the 'error' received when ran with a misspelled or non-existent category

#### get all data for a category
```javascript
node swapi films

// returns all data for all films
```

#### get all data for a an id in a category
```javascript
node swapi people 1

// returns people data for Luke Skywalker
```

#### get the schema for a category
```javascript
node swapi planets schema

// returns the JSON schema for the planets category
```

#### get property data for an entire category
```javascript
node swapi species.name,designation,homeworld,people,films

// returns the name, designation, homeworld, people, and films for all entries in the 'species' category
```
- separate category from properties with '.'
- include additional properties by separating with ',' (no spaces)
- run `node swapi cagetory schema` to display all possible properties for a category

#### get property data for an id in a category
```javascript
node swapi starships.name,crew,passengers,pilots,films 10

// returns the name, number of crew members, passenger capacity, the pilots of, and the film appearances of the Millennium Falcon
```
