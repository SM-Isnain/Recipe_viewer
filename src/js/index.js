import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import {DOMelements as DOM, renderLoader, clearLoader} from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
/** Global state of the app
** - Search object
** - Current recipe object
** - Shopping list object
** - Liked recipes
*/
const state = {};

// Search controller
const controlSearch = async () => {
  // 1. Get query from view
  const query = searchView.readInput();
  if (query) {
    // 2. New search object and add to state
    state.search = new Search(query);
    // 3. Clear previous results and show loading spinner
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(DOM.searchRes);
    try {
      // 4. Search for recipes
      await state.search.getResults();
      // 5. Render results on UI
      clearLoader();
      searchView.renderResults(state.search.recipes);
    } catch (error) {
      alert('Something went wrong with search');
      clearLoader();
    }
  }
};

DOM.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

DOM.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.recipes, goToPage);
  }
});

// Recipe controller
const controlRecipe = async () => {
  // Get Id from url
  const id = window.location.hash.replace('#','');
  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(DOM.recipe);
    // Highlight selected recipe
    if (state.search) searchView.highlightSelected(id);
    // Create new recipe object
    state.recipe = new Recipe(id);
    try {
    // Get recipe data and parse ingredients
    await state.recipe.getFullResult();
    state.recipe.parseIngredients();

    // Calculate servings and time
    state.recipe.calcTime();
    state.recipe.calcServings();

    // Render recipe
    clearLoader();
    recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      alert('Error processing recipe!');
    }
  }
};

window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);

// List controller
const controlList = () => {
  // Create a new list if there is none
  if (!state.list) state.list = new List();
  //Add each ingredient to list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

// Handle delete and update list item events
DOM.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;
  //Implement delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // Delete item from stateList
    state.list.deleteItem(id);
    // Delete from UI
    listView.deleteItem(id);
  } else if (e.target.matches('.shopping__count-value')) {
    const newCount = parseFloat(e.target.value, 10);
    state.list.updateCount(id, newCount);
  }
});

// Likes controller
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentId = state.recipe.id;
  // User has not yet liked current recipe
  if (!state.likes.isLiked(currentId)) {
    // Add like to stateList
    const newLike = state.likes.addLike(currentId, state.recipe.title, state.recipe.author, state.recipe.img);
    // Toggle the like button
    likesView.toggleLikeBtn(true);
    // Add like to UI list
    likesView.renderLike(newLike);
  // User has liked current recipe
  } else {
    // Remove like from state
    state.likes.deleteLike(currentId);
    // Toggle the like button
    likesView.toggleLikeBtn(false);
    // Remove like from UI list
    likesView.deleteLike(currentId);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};



// Restore liked recipes on page load
window.addEventListener('load', () => {
  state.likes = new Likes();
  // Restore likes
  state.likes.readStorage();
  // Toggle like menu
  likesView.toggleLikeMenu(state.likes.getNumLikes());
  // Render existing liked recipes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
DOM.recipe.addEventListener('click', e => {
   if (e.target.matches('.btn-decrease, .btn-decrease *')) {
     // Decrease button is clicked
     if (state.recipe.servings > 1) {
       state.recipe.updateServings('dec');
       recipeView.updateServingsIngredients(state.recipe);
     }
   } else if (e.target.matches('.btn-increase, .btn-increase *')) {
     state.recipe.updateServings('inc');
     recipeView.updateServingsIngredients(state.recipe);
   } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
     // Add ingredients to shopping list
     controlList();
   } else if (e.target.matches('.recipe__love, .recipe__love *')) {
     // Like controller
     controlLike();
   }
});
