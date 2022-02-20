import Category from '../../components/category/index.js';

export default class Categories {
  element;
  categories = [];

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.categories = await this.getCategories();
    this.getCategoryTemplate();

    return this.element;
  }

  getTemplate() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
        <div data-element="categoriesContainer"></div>
      </div>
    `;
  }

  async getCategories() {
    const url = new URL('api/rest/categories', process.env.BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      return await response.json();
    }
  }

  getCategoryTemplate() {
    const categoriesContainer = this.element.querySelector('[data-element=categoriesContainer]');
    this.categories.forEach(categoriesItem => {
      const category = new Category(categoriesItem);
      categoriesContainer.append(category.element);
    });
  }

  destroy() {
    this.element.remove();
    this.categories = [];
  }
}

