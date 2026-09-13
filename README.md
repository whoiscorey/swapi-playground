# Star Wars API Playground
Having fun with the Star Wars API

- the `base` variable in `swapi.js` can be swapped between `swapi.dev` and `swapi.info` at any time
  - functionality remains the same when changing `base`, except when calling the `schema` endpoint against `swapi.dev`
- returned data is cached and url string values are resolved to display the name or title instead of a url
  - unless the property name is 'url', then the url is displayed

### getting started
- clone the repo
- `cd swapi-playground`
- run with `node`
- categories used in the examples are inter-changeable with the other categories (films, people, planets, species, starships, vehicles)
- properties used in examples are not inter-changeable between categories
  - run `node swapi category schema` for available properties (only works if `base` points to `swapi.info`)

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
- search for a string in a category:
  - `node swapi category search string`
- search for a string in one property of a category:
  - `node swapi category search.property string`
- search date_properties of a category for items before or after a date: 
  - `node swapi category search.date_property before date`
  - `node swapi category search.date_property after date`

### usage examples:

#### list available categories
```javascript
node swapi

// returns: available categories: films, people, planets, species, starships, vehicles
```

#### get all data for a category
```javascript
node swapi films

// returns all data for all films
```

#### get all data for an id in a category
```javascript
node swapi people 1

// returns people data for Luke Skywalker
```

#### get the schema for a category
```javascript
node swapi planets schema

// returns the JSON schema for the planets category
```
- `schema` only works if `base` points to `https://swapi.info/api/`

#### get property data for an entire category
```javascript
node swapi species.name,designation,homeworld,people,films

// returns the name, designation, homeworld, people, and films for all entries in the 'species' category
```
- separate category from properties with '.'
- include additional properties by separating with ',' (no spaces)
- run `node swapi category schema` to display all possible properties for a category

#### get property data for an id in a category
```javascript
node swapi starships.name,crew,passengers,pilots,films 10

// returns the name, number of crew members, passenger capacity, the pilots of, and the film appearances of the Millennium Falcon
```

#### search for a string in a category
```javascript
node swapi people search skywalker

// returns all data for all people with a string property that includes the string 'skywalker'
```

#### search a specific property for a string in a category
```javascript
node swapi films search.characters vader

// returns all data for films with a character whose name contains 'vader'
```

#### search a date property of a category with the before or after operator
```javascript
node swapi films search.release_date before 2005

// returns all data for films released before 2005, not including films released in 2005
```

```javascript
node swapi films search.release_date after 2002

// returns all data for all films released after 2002, not including any films released in 2002
```
- date properties: `release_date`, `created`, `edited` 
  - the date property `release_date` only exists for the `films` category
  - the date properties `create` and `edited` exist in all categories
- supported date formats: `yyyy`, `yyyy-mm`, `yyyy-mm-dd`
- the date provided in the query is **excluded** by both operators
