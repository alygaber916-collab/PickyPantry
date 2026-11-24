/* recipe.js
   The single recipe page (recipe.html?id=...).
   Shows the ingredients (have / missing), the steps and similar recipes.
*/

// read the id from the address, e.g. recipe.html?id=shakshuka
var params = new URLSearchParams(location.search);
var box = document.getElementById("recipe");
var mine = loadMyIngredients();

var notFound = '<p class="empty">Recipe not found. <a href="index.html#finder">Back to all recipes</a></p>';

function showRecipe(recipe) {
  document.title = recipe.name + " - Picky Pantry";

  var html = '<a class="back" href="index.html#finder">&larr; Back to recipes</a>';
  html += "<h1>" + recipe.name + "</h1>";
  html += '<p class="meta">' + recipe.time + " min &middot; " + recipe.level + " &middot; serves " + recipe.servings + "</p>";

  // diet tags
  html += '<div class="tags">';
  for (var i = 0; i < recipe.diet.length; i++) {
    html += '<span class="tag">' + recipe.diet[i] + "</span>";
  }
  html += "</div>";

  // ingredients: green/bold if the user has it, grey with "(missing)" if not
  html += "<h2>Ingredients</h2>";
  html += '<ul class="ing-list">';
  for (var j = 0; j < recipe.ingredients.length; j++) {
    var ing = recipe.ingredients[j];
    if (ing.owned) {
      html += '<li class="have"><span>' + ing.name + "</span></li>";
    } else {
      html += '<li class="missing"><span>' + ing.name + " (missing)</span></li>";
    }
  }
  html += "</ul>";
  html += '<p class="hint">Salt, pepper and oil to taste.</p>';

  // steps
  html += "<h2>Steps</h2><ol>";
  for (var k = 0; k < recipe.steps.length; k++) {
    html += "<li>" + recipe.steps[k] + "</li>";
  }
  html += "</ol>";

  // similar recipes
  html += "<h2>You might also like</h2>";
  html += '<div class="results">';
  for (var n = 0; n < recipe.similar.length; n++) {
    var other = recipe.similar[n];
    var badge = "Similar diet";
    if (other.shared.length > 0) {
      badge = "Shares " + other.shared.join(", ");
    }
    html += recipeCardHTML(other, badge);
  }
  html += "</div>";

  box.innerHTML = html;
}

var recipe = recipeDetail(params.get("id") || "", mine);

if (recipe) {
  showRecipe(recipe);
} else {
  box.innerHTML = notFound;
}
