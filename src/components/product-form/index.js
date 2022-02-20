import SortableList from '../sortable-list/index.js';

import escapeHtml from '../../utils/escape-html.js';

export default class ProductForm {
  element;
  categoriesUrl = 'api/rest/category';
  categories;
  data = {};
  subElements = {};

  constructor (productId = null) {
    this.productId = productId;
  }

  async render() {
    const element = document.createElement('div');
    const categoriesPromise = this.loadCategories();
    const productPromise = this.productId ? this.loadData() : [];

    const [categoriesData, productsData] = await Promise.all([categoriesPromise, productPromise]);

    this.categories = categoriesData;
    this.data = productsData[0];

    element.innerHTML = this.getTemplate();
    this.element = element;
    this.subElements = this.getSubElements();
    this.getImages();
    this.initEventListeners();
    return this.element;
  }

  async loadCategories() {
    const url = new URL(this.categoriesUrl, process.env.BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      return response.json();
    }
  }

  async loadData() {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    url.searchParams.set('id', this.productId);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      return response.json();
    }
  }

  async save() {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    const method = this.productId ? 'PATCH' : 'PUT';
    const data = this.setData();


    const response = await fetch(url.toString(), {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const customEvent = this.productId ?
        new CustomEvent("product-updated", {
          detail: 'Successfully updated'
        }) :
        new CustomEvent("product-saved", {
          detail: 'Successfully saved'
        });
      this.element.dispatchEvent(customEvent);
    }
  }

  setData() {
    return {
      description: this.data.description,
      discount: this.data.discount,
      id: this.data.id,
      images: this.data.images,
      price: this.data.price,
      quantity: this.data.quantity,
      status: this.data.status,
      subcategory: this.data.subcategory,
      title: this.data.title
    };
  }

  updateImages() {
    const imagesList = this.element.querySelectorAll('.products-edit__image');
    this.data.images =  [...imagesList].map(item => {
      const newData = {};
      newData.source = item.children.source.value;
      newData.url = item.children.url.value;
      return newData;
    });
  }

  getTemplate() {
    return `
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required
                type="text"
                id="title"
                name="title"
                class="form-control"
                value="${this.getValue('title')}"
                placeholder="Название товара">
            </fieldset>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required
                id="description"
                class="form-control"
                name="description"
                data-element="productDescription"
                placeholder="Описание товара">${this.getValue('description')}</textarea>
          </div>

          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button type="button" name="uploadImage" class="button-primary-outline">
                <span>Загрузить</span>
            </button>
          </div>

          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory" id="subcategory" required>
              ${this.getCategories()};
            </select>
          </div>

          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required
                id="price"
                type="number"
                name="price"
                class="form-control"
                placeholder="100"
                value="${this.getValue('price')}">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required
                id="discount"
                type="number"
                name="discount"
                class="form-control"
                placeholder="0"
                value="${this.getValue('discount')}">
            </fieldset>
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required
                id="quantity"
                type="number"
                class="form-control"
                name="quantity"
                placeholder="1"
                value="${this.getValue('quantity')}">
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status" required>
              <option value="1" ${this.isSelected(1, this.data?.status)}>Активен</option>
              <option value="0" ${this.isSelected(0, this.data?.status)}>Неактивен</option>
            </select>
          </div>

          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
    </form>
    `;
  }

  getCategories() {
    if (this.categories.length) {
      const categories = this.categories.map(category => {
        return category.subcategories.map(subcategory => {
          return `
              <option value="${subcategory.id}" ${this.isSelected(subcategory.id, this.data?.subcategory)}>${category.title} &gt; ${subcategory.title}</option>
            `;
        }).join('');
      });
      return categories.join('');
    }
  }

  isSelected(option, dataOption) {
    return option === dataOption ? 'selected' : '';
  }

  getValue(value) {
    if (typeof this.data?.[value] === 'string') {
      return escapeHtml(this.data[value]);
    } else if (typeof this.data?.[value] === 'number') {
      return this.data[value];
    }

    return '';
  }

  getImages() {
    if (this.data?.images?.length) {
      const sortableList = new SortableList({
        items: this.data.images.map(item => {
          const element = document.createElement('li');
          element.classList.add('products-edit__image', 'list-item');
          element.innerHTML = `
            <input type="hidden" name="url" value="${item.url}">
            <input type="hidden" name="source" value="${item.source}">
            <span>
              <img src="icon-grab.svg" data-grab-handle alt="grab">
              <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
              <span>${item.source}</span>
            </span>
            <button type="button">
                <img src="icon-trash.svg" data-delete-handle alt="delete">
            </button>
        `;
          return element;
        })
      });

      this.subElements.imageListContainer.append(sortableList.element);
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

  initEventListeners () {
    this.uploadImageBtn = this.element.querySelector('button[name=uploadImage]');
    this.uploadImageBtn.addEventListener('click', this.uploadImage);
    this.element.addEventListener('change', this.changeData);
    this.element.addEventListener('change-order', this.updateImages);
    this.element.addEventListener('submit', (event) => {
      event.preventDefault();
      this.save();
    });
  }

  uploadImage = () => {
    const hiddenUploadBtn = document.createElement("input");
    hiddenUploadBtn.type = "file";
    hiddenUploadBtn.name = "picture";
    hiddenUploadBtn.accept = "image/*";
    hiddenUploadBtn.click();

    hiddenUploadBtn.addEventListener('change', async () => {
      const image = hiddenUploadBtn.files[0];
      let result = await this.sendImageToImgur(image);
      this.addImageToList(image.name, result.data.link);
    });
  };

  async sendImageToImgur(image) {
    const url = 'https://api.imgur.com/3/image';
    let data = new FormData();
    data.append('image', image);
    this.uploadImageBtn.classList.add('is-loading');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`
      },
      body: data,
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      this.uploadImageBtn.classList.remove('is-loading');
      return response.json();
    }
  }

  addImageToList(name, link) {
    if (!this.data?.images?.length) {
      this.data.images = [];
    }
    this.data.images.push({source: name, url: link});
    this.subElements.imageListContainer.innerHTML = '';
    this.getImages();
  }

  changeData = event => {
    const active = event.target.closest('.form-control');
    const field = active.id;

    if (active.type === 'number' || field === 'status') {
      this.data[field] = +active.value;
    } else {
      this.data[field] = escapeHtml(active.value);
    }
  };

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

