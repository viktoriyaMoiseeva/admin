import SortableList from '../../components/sortable-list/index.js';
import Notification from '../../components/notification/index.js';


export default class Category {
  element;
  category;
  sortableList;
  notification;

  constructor(category = {}) {
    this.category = category;
    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.getSubcategories();
    this.initEventListeners();
  }

  getTemplate() {
    return `
       <div class="category category_open" data-id="${this.category.id}">
        <header class="category__header" data-element="header">
        ${this.category.title}
        </header>
        <div class="category__body">
          <div class="subcategory-list" data-element="list"></div>
        </div>
     </div>
    `;
  }

  getSubcategories() {
    if (this.category?.subcategories?.length) {
      this.sortableList = new SortableList({
        items: this.category.subcategories.map(item => {
          const element = document.createElement('li');
          element.classList.add('categories__sortable-list-item');
          element.dataset.grabHandle = '';
          element.dataset.id = item.id;
          element.dataset.count = item.count;
          element.dataset.title = item.title;
          element.innerHTML = `
            <strong>${item.title}</strong>
            <span><b>${item.count}</b> products</span>
        `;
          return element;
        })
      });

      this.subElements.list.append(this.sortableList.element);
    }
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }


  initEventListeners() {
    this.element.addEventListener('click', this.toggleOpened);
    this.element.addEventListener('change-order', this.save);
  }

  toggleOpened = event => {
    const active = event.target.closest('[data-element=header]');
    if(!active) {
      return;
    }

    this.element.classList.toggle('category_open');
  };

  save = async() => {
    this.updateOrder();

    const url = new URL('api/rest/subcategories', process.env.BACKEND_URL);
    const response = await fetch(url.toString(), {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.category.subcategories),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      this.notification = new Notification('Category Order Saved', {
        duration: 2000,
        type: 'success'
      });

      this.notification.show();
    }
  };

  updateOrder() {
    const list = this.element.querySelectorAll('.categories__sortable-list-item');
    this.category.subcategories =  [...list].map((item, index) => {
      const newData = {
        category: this.category.id,
        count: +item.dataset.count,
        id: item.dataset.id,
        title: item.dataset.title,
        weight: index + 1
      };
      return newData;
    });
  }


  remove() {
    this.element.remove();
  }

  destroy() {
    this.element.removeEventListener('click', this.toggleOpened);
    this.element.removeEventListener('change-order', this.save);
    this.remove();
    this.notification.destroy();
    this.sortableList.destroy();
  }
}
