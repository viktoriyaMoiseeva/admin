export default class SortableTable {
  element;
  subElements = {};
  data = [];
  table;
  perPage = 30;
  start = 0;
  end = this.perPage;

  constructor(headerConfig, {
    isSortLocally = false,
    url = '',
    hasLink = true,
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    }
  } = {}) {
    this.headerConfig = headerConfig;
    this.sorted = sorted;
    this.hasLink = hasLink;
    this.url = url;
    this.isSortLocally = isSortLocally;

    this.render();
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.table = this.element.firstElementChild;
    this.subElements = this.getSubElements();

    this.initEventListeners();
    await this.getData();
  }

  getTemplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
            <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.getHeaderItems()}
            </div>

            <div data-element="body" class="sortable-table__body">
            </div>
            
            <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

            <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
              <div>
                <p>No products satisfies your filter criteria</p>
                <button type="button" class="button-primary-outline">Reset all filters</button>
              </div>
            </div>
        </div>
    </div>`;
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

  getHeaderItems() {
    if (this.headerConfig.length) {
      const headerItems = this.headerConfig.map(item => {
        let order = this.sorted.id === item.id ? this.sorted.order : 'asc';
        return `
          <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="${order}">
            <span>${item.title}</span>
            ${this.getSortingArrow(item.id)}
          </div>
        `;
      });

      return headerItems.join('');
    }
  }

  getBodyItems() {
    if (this.data.length) {
      const bodyItems = this.data.map(product => {
        return this.hasLink ?
        `
          <a href="/products/${product.id}" class="sortable-table__row">
            ${this.getBodyItemData(product)}
          </a>
        ` :
        ` <div class="sortable-table__row">
              ${this.getBodyItemData(product)}
          </div>
        `;
      });

      return bodyItems.join('');
    }
  }

  getBodyItemData(product) {
    if (this.headerConfig.length) {
      const bodyItemData = this.headerConfig.map(item => {
        if (item.template) {
          return item.template(product[item.id]);
        } else {
          return `
            <div class="sortable-table__cell">${product[item.id]}</div>
          `;
        }
      });

      return bodyItemData.join('');
    }
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.handleClick);

    if (!this.isSortLocally) {
      window.addEventListener('scroll', this.scrollTable);
    }

  }

  async getData(isScrolling = false) {
    let data;

    this.table.classList.add('sortable-table_loading');

    if (isScrolling) {
      this.start += this.perPage;
      this.end += this.perPage;
    }

    const url = new URL(this.url, process.env.BACKEND_URL);
    url.searchParams.set('_sort', this.sorted.id);
    url.searchParams.set('_order', this.sorted.order);
    url.searchParams.set('_start', this.start.toString());
    url.searchParams.set('_end', this.end.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      data = await response.json();
      this.table.classList.remove('sortable-table_loading');

      if (data.length) {
        this.data = isScrolling ? [...this.data, ...data] : data;
        this.subElements.body.innerHTML = this.getBodyItems();
      } else {
        this.table.classList.add('sortable-table_empty');
      }
    }
  }

  handleClick = event => {
    const active = event.target.closest('[data-sortable="true"]');

    if (!active) {
      return;
    }

    this.start = 0;
    this.end = this.perPage;

    const order = active.dataset.order === 'asc' ? 'desc' : 'asc';
    active.dataset.order = order;

    this.isSortLocally ? this.sortOnClient(active.dataset.id, order) : this.sortOnServer(active.dataset.id, order);

    const arrow = active.querySelector('.sortable-table__sort-arrow');

    if (!arrow) {
      active.append(this.subElements.arrow);
    }
  };

  sortOnClient(id, order) {
    const directions = {
      asc: 1,
      desc: -1
    };

    const direction = directions[order];

    const sortType = this.headerConfig.find(item => {
      return item.id === id;
    }).sortType;


    switch (sortType) {
      case 'string':
        this.sortByStringValue(id, direction);
        break;

      case 'number':
        this.sortByNumValue(id, direction);
        break;
    }
  }

  sortByStringValue(id, direction) {
    const sortedData = [...this.data].sort((a, b) => {
      return direction * a[id].localeCompare(b[id], ['ru', 'en'], {caseFirst: 'upper'});
    });

    this.update(sortedData);
  }

  sortByNumValue(id, direction) {
    const sortedData = [...this.data].sort((a, b) => {
      return direction * (a[id] - b[id]);
    });

    this.update(sortedData);
  }

  sortOnServer(id, order) {
    this.sorted.id = id;
    this.sorted.order = order;

    this.getData();
  }

  scrollTable = () => {
    const windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;

    if (windowRelativeBottom === document.documentElement.clientHeight) {
      this.getData(true);
    }
  };

  getSortingArrow(id) {
    return this.sorted.id === id ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
      </span>` : '';
  }

  update(newData) {
    this.data = newData;
    this.subElements.body.innerHTML = this.getBodyItems();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    window.removeEventListener('scroll', this.scrollTable);
  }
}
