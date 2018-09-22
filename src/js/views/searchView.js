import {DOMelements as DOM} from './base';

export const readInput = () => DOM.searchInput.value;

export const clearInput = () => {
  DOM.searchInput.value = '';
};

export const clearResults = () => {
  DOM.searchResList.innerHTML = '';
  DOM.searchResPages.innerHTML = '';
};

export const highlightSelected = id => {
  const resultsArr = Array.from(document.querySelectorAll('.results__link'));
  resultsArr.forEach(el => {
    el.classList.remove('results__link--active');
  })
  if (document.querySelector(`.results__link[href*="#${id}"]`) !== null) {
  document.querySelector(`.results__link[href*="#${id}"]`).classList.add('results__link--active');  
  }
}

export const limitRecipeTitle = (title, limit=17) => {
  const newTitle = [];
  if (title.length > limit) {
    title.split(' ').reduce((acc, cur) => {
      if (acc + cur.length <= limit) {
        newTitle.push(cur);
      }
      return acc + cur.length;
    }, 0);
    // return modified title
    return `${newTitle.join(' ')}...`;
  }
  return title;
};

const renderRecipe = recipe => {
  const markup = `
  <li>
      <a class="results__link" href="#${recipe.recipe_id}">
          <figure class="results__fig">
              <img src="${recipe.image_url}" alt="${recipe.title}">
          </figure>
          <div class="results__data">
              <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
              <p class="results__author">${recipe.publisher}</p>
          </div>
      </a>
  </li>
  `;
  DOM.searchResList.insertAdjacentHTML('beforeend', markup);
};

const createButton = (page, type) => `
<button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
    <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
    <svg class="search__icon">
        <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
    </svg>
</button>
`;

const renderButtons = (page, numResults, resPerPage) => {
  const numpages = Math.ceil(numResults / resPerPage);
  let button;
    if (page === 1 && numpages > 1) {
    // Only button for next page
    button = createButton(page, 'next');
  } else if (page < numpages) {
      // Both buttons
      button = `${createButton(page, 'prev')}
      ${createButton(page, 'next')}`;
    } else if (page === numpages && numpages > 1) {
    // Only button for previous pages
    button = createButton(page, 'prev');
    }
    DOM.searchResPages.insertAdjacentHTML('afterbegin', button);
  };

export const renderResults = (recipes, page=1, resPerPage=10) => {
  // render results of current page
  const start = (page - 1) * resPerPage;
  const end = page * resPerPage;
  recipes.slice(start, end).forEach(el => renderRecipe(el));
  // render pagination buttons
  renderButtons(page, recipes.length, resPerPage);
};
