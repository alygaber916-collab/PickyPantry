/* shared.js
   Functions used by more than one page:
   - saving the ingredients the user typed
   - matching and searching recipes
   - the html for a recipe card
   data.js must be loaded before this file (it gives us RECIPES and STAPLES).
*/

/* ---------- saving ingredients ---------- */
// sessionStorage keeps the list while the tab is open, so it
// is still there when the user goes to a recipe and comes back.

function loadMyIngredients() {
  try {
    var saved = sessionStorage.getItem("mine");
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (e) {
    // storage is blocked or the data is broken, so just start with an empty list
    return [];
  }
}

function saveMyIngredients(list) {
  try {
    sessionStorage.setItem("mine", JSON.stringify(list));
  } catch (e) {
    // some private modes block storage. The site still works, it just can't remember.
  }
}

/* ---------- matching ---------- */

// Does the user have this ingredient?
// We check both ways so "tomato" matches "tomatoes" and "tomatoes" matches "tomato".
function userHas(mine, ingredient) {
  for (var i = 0; i < mine.length; i++) {
    if (ingredient.includes(mine[i]) || mine[i].includes(ingredient)) {
      return true;
    }
  }
  return false;
}

// Looks at one recipe and splits its ingredients into "have" and "missing".
// Staples like salt and oil are skipped.
// score is a number from 0 to 1 = ingredients the user has / ingredients needed.
function analyse(recipe, mine) {
  var have = [];
  var missing = [];

  for (var i = 0; i < recipe.ingredients.length; i++) {
    var item = recipe.ingredients[i];
    if (STAPLES.includes(item)) {
      continue;
    }
    if (userHas(mine, item)) {
      have.push(item);
    } else {
      missing.push(item);
    }
  }

  var total = have.length + missing.length;
  var score = 0;
  if (total > 0) {
    score = have.length / total;
  }
  return { have: have, missing: missing, score: score };
}

// A smaller copy of the recipe with only what the cards need.
// "extra" is for any additional fields we want to add.
function summary(recipe, extra) {
  var result = {
    id: recipe.id,
    name: recipe.name,
    time: recipe.time,
    level: recipe.level,
    diet: recipe.diet
  };
  for (var key in extra) {
    result[key] = extra[key];
  }
  return result;
}

// Search + filter + rank.
// options = { mine: [...], text: "", diet: "all", maxTime: 999, level: "all" }
// Returns the matching recipes, best match first (if two are equal, the quicker one goes first).
function searchRecipes(options) {
  // clean up the user's ingredients
  var mine = [];
  var rawList = options.mine || [];
  for (var i = 0; i < rawList.length; i++) {
    var clean = rawList[i].trim().toLowerCase();
    if (clean !== "") {
      mine.push(clean);
    }
  }

  var text = (options.text || "").trim().toLowerCase();
  var diet = options.diet || "all";
  var maxTime = Number(options.maxTime || 999);
  var level = options.level || "all";

  var found = [];

  for (var j = 0; j < RECIPES.length; j++) {
    var r = RECIPES[j];

    // 1. search box: look in the name and in the ingredients
    if (text !== "") {
      var inName = r.name.toLowerCase().includes(text);
      var inIngredients = false;
      for (var k = 0; k < r.ingredients.length; k++) {
        if (r.ingredients[k].includes(text)) {
          inIngredients = true;
        }
      }
      if (!inName && !inIngredients) {
        continue;
      }
    }

    // 2. filters
    if (diet !== "all" && !r.diet.includes(diet)) {
      continue;
    }
    if (r.time > maxTime) {
      continue;
    }
    if (level !== "all" && r.level !== level) {
      continue;
    }

    // 3. how many ingredients does the user have?
    var result = analyse(r, mine);

    // if the user added ingredients, hide recipes where they have none of them
    if (mine.length > 0 && result.have.length === 0) {
      continue;
    }

    found.push({ recipe: r, have: result.have, missing: result.missing, score: result.score });
  }

  // best score first, and if the score is the same the shorter time first
  found.sort(function (a, b) {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.recipe.time - b.recipe.time;
  });

  var output = [];
  for (var n = 0; n < found.length; n++) {
    var item = found[n];
    output.push(summary(item.recipe, {
      haveCount: item.have.length,
      totalCount: item.have.length + item.missing.length
    }));
  }
  return output;
}

// Everything the recipe page needs: the recipe itself plus 3 similar ones.
// Returns null if there is no recipe with that id.
function recipeDetail(id, mine) {
  var recipe = null;
  for (var i = 0; i < RECIPES.length; i++) {
    if (RECIPES[i].id === id) {
      recipe = RECIPES[i];
    }
  }
  if (recipe === null) {
    return null;
  }

  // find similar recipes: shared ingredients count 2 points, shared diet tags count 1 point
  var scored = [];
  for (var j = 0; j < RECIPES.length; j++) {
    var other = RECIPES[j];
    if (other.id === recipe.id) {
      continue;
    }

    var shared = [];
    for (var k = 0; k < recipe.ingredients.length; k++) {
      var ing = recipe.ingredients[k];
      if (!STAPLES.includes(ing) && other.ingredients.includes(ing)) {
        shared.push(ing);
      }
    }

    var sameDiet = 0;
    for (var d = 0; d < other.diet.length; d++) {
      if (recipe.diet.includes(other.diet[d])) {
        sameDiet++;
      }
    }

    scored.push({ recipe: other, shared: shared, score: shared.length * 2 + sameDiet });
  }

  scored.sort(function (a, b) {
    return b.score - a.score;
  });

  var similar = [];
  for (var s = 0; s < 3 && s < scored.length; s++) {
    similar.push(summary(scored[s].recipe, { shared: scored[s].shared }));
  }

  // mark each ingredient as owned or not
  var ingredients = [];
  for (var m = 0; m < recipe.ingredients.length; m++) {
    var name = recipe.ingredients[m];
    ingredients.push({
      name: name,
      owned: STAPLES.includes(name) || userHas(mine, name)
    });
  }

  var detail = summary(recipe, {});
  detail.servings = recipe.servings;
  detail.steps = recipe.steps;
  detail.ingredients = ingredients;
  detail.similar = similar;
  return detail;
}

/* ---------- html for a recipe card ---------- */
// Used in the results list and in "You might also like".
// badge is optional text for the yellow pill.
function recipeCardHTML(r, badge) {
  var html = '<a class="recipe-card" href="recipe.html?id=' + r.id + '">';
  html += "<h3>" + r.name + "</h3>";
  html += '<span class="meta">' + r.time + " min &middot; " + r.level + "</span>";
  if (badge) {
    html += '<span class="badge">' + badge + "</span>";
  }
  html += '<span class="tags">';
  for (var i = 0; i < r.diet.length; i++) {
    html += '<span class="tag">' + r.diet[i] + "</span>";
  }
  html += "</span>";
  html += "</a>";
  return html;
}
