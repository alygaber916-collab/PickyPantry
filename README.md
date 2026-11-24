# Picky Pantry

Tell it what's in your kitchen; it ranks recipes you can cook right now.
A static website: no server, no build step, no dependencies.

## Run
Open `index.html` in any modern browser (double-click it).

## Structure
```text
index.html     Find recipes (ingredients, search, filters, results)
recipe.html    One recipe (opened as recipe.html?id=...)
about.html     About us
contact.html   Contact form
css/style.css  All styling
js/data.js     The recipes (edit here to add or change recipes)
js/shared.js   Matching/search logic and the recipe card markup
js/script.js   Behaviour of index.html
js/recipe.js   Behaviour of recipe.html
docs/DOCUMENTATION.md    Full documentation (requirements, diagrams, code reference, tests)
docs/documentation.html  The same documentation, formatted for the browser
```

## Add a recipe
Copy an entry in `js/data.js` and change it. The format is described at the top of that file.

## Documentation
Read `docs/documentation.html` in a browser (it needs internet only to draw the diagrams), or `docs/DOCUMENTATION.md` on GitHub.
