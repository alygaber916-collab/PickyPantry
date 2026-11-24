/* script.js
   The "Find recipes" page (index.html):
   the ingredient chips, the filters and the list of results.
*/

// the ingredients the user added, e.g. ["eggs", "tomato"]
var myIngredients = loadMyIngredients();

// grab the elements we need from the page
var ingredientInput = document.getElementById("ingredient-input");
var addButton = document.getElementById("add-btn");
var resetButton = document.getElementById("reset-btn");
var chipsList = document.getElementById("chips");
var chipsEmpty = document.getElementById("chips-empty");
var searchInput = document.getElementById("search-input");
var dietFilter = document.getElementById("diet-filter");
var timeFilter = document.getElementById("time-filter");
var levelFilter = document.getElementById("level-filter");
var resultsBox = document.getElementById("results");
var resultCount = document.getElementById("result-count");

/* ---------- ingredients ---------- */

function addIngredient() {
  var value = ingredientInput.value.trim().toLowerCase();

  // only add it if it's not empty and not already in the list
  if (value !== "" && !myIngredients.includes(value)) {
    myIngredients.push(value);
  }

  ingredientInput.value = "";
  ingredientInput.focus();
  render();
}

function removeIngredient(name) {
  var newList = [];
  for (var i = 0; i < myIngredients.length; i++) {
    if (myIngredients[i] !== name) {
      newList.push(myIngredients[i]);
    }
  }
  myIngredients = newList;
  render();
}

// draws the little bubbles (chips) under the input
function renderChips() {
  chipsList.innerHTML = "";

  for (var i = 0; i < myIngredients.length; i++) {
    makeChip(myIngredients[i]);
  }

  // show the "no ingredients yet" hint only when the list is empty
  chipsEmpty.hidden = myIngredients.length > 0;
}

function makeChip(name) {
  var li = document.createElement("li");
  li.textContent = name;

  var button = document.createElement("button");
  button.type = "button";
  button.textContent = "\u00d7";
  button.setAttribute("aria-label", "Remove " + name);
  button.addEventListener("click", function () {
    removeIngredient(name);
  });

  li.appendChild(button);
  chipsList.appendChild(li);
}

/* ---------- results ---------- */

function renderResults() {
  var list = searchRecipes({
    mine: myIngredients,
    text: searchInput.value,
    diet: dietFilter.value,
    maxTime: timeFilter.value,
    level: levelFilter.value
  });

  // "1 recipe found" / "5 recipes found"
  if (list.length === 1) {
    resultCount.textContent = "1 recipe found";
  } else {
    resultCount.textContent = list.length + " recipes found";
  }

  if (list.length === 0) {
    resultsBox.innerHTML = '<p class="empty">No recipes match. Try removing a filter or adding another ingredient.</p>';
    return;
  }

  var html = "";
  for (var i = 0; i < list.length; i++) {
    var badge = "";
    if (myIngredients.length > 0) {
      badge = "You have " + list[i].haveCount + " of " + list[i].totalCount;
    }
    html += recipeCardHTML(list[i], badge);
  }
  resultsBox.innerHTML = html;
}

// redraw everything (used when the ingredients change)
function render() {
  saveMyIngredients(myIngredients);
  renderChips();
  renderResults();
}

function resetFilters() {
  searchInput.value = "";
  dietFilter.value = "all";
  timeFilter.value = "999";
  levelFilter.value = "all";
  renderResults();
}

/* ---------- events ---------- */

addButton.addEventListener("click", addIngredient);

ingredientInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addIngredient();
  }
});

// whenever a filter changes, update the results
searchInput.addEventListener("input", renderResults);
dietFilter.addEventListener("input", renderResults);
timeFilter.addEventListener("input", renderResults);
levelFilter.addEventListener("input", renderResults);

resetButton.addEventListener("click", resetFilters);

// first draw when the page opens
render();
