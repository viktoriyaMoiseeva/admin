export default class SortableList {
  element;
  active;
  elements;
  placeholder;
  width;
  height;

  constructor({items = []} = {}) {
    this.items = items;
    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.getList();
    this.initEventListeners();
  }

  getTemplate() {
    return `
       <ul class="sortable-list"></ul>
    `;
  }

  getList() {
    if (this.items.length) {
      this.items.forEach(item => {
        this.element.append(item);
        item.classList.add('sortable-list__item');
        item.draggable = true;
      });
    }
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.initAction);
  }

  initAction = (event) => {
    const activeGrab = event.target.closest('[data-grab-handle]');
    const activeDelete = event.target.closest('[data-delete-handle]');


    if (!activeGrab && !activeDelete) {
      return;
    }

    this.active = event.target.closest('.sortable-list__item');
    this.elements = this.element.querySelectorAll('.sortable-list__item');

    activeGrab ? this.startDragging(event) : this.delete();
  };

  startDragging = (event) => {
    this.active.addEventListener('dragstart', (event) => {
      event.preventDefault();
    });

    this.width = this.active.clientWidth;
    this.height = this.active.clientHeight;

    this.active.classList.add('sortable-list__item_dragging');
    this.active.style.width = this.width + 'px';

    this.placeholder = document.createElement('div');
    this.placeholder.className = 'sortable-list__placeholder';
    this.placeholder.style.height = this.height + 'px';
    this.element.insertBefore(this.placeholder, this.active);

    this.dragAt(event.clientY);

    document.addEventListener('dragstart', () => {
      return false;
    });

    document.addEventListener('pointerover', this.drag);
    document.addEventListener('pointerup', this.drop);
  };

  drag = event => {
    event.preventDefault();
    this.dragAt(event.clientY);

    const pos = this.active.getBoundingClientRect();
    const activeStartY = pos.y;
    const activeEndY = activeStartY + this.height;
    this.elements.forEach((element, index) => {

      const elemSize = element.getBoundingClientRect();
      const elemStartY = elemSize.y;
      const elemEndY = elemStartY + this.height;

      if (this.active !== element && this.isIntersecting(activeStartY, activeEndY, elemStartY, elemEndY)) {
        if (Math.abs(activeStartY - elemStartY) < this.height / 2) {
          this.changeSorting(element, index);
        }
      }
    });
  };

  isIntersecting(min0, max0, min1, max1) {
    return Math.max(min0, max0) >= Math.min(min1, max1) &&
      Math.min(min0, max0) <= Math.max(min1, max1);
  }

  changeSorting(element, index) {
    const currIndex = [...this.element.children].indexOf(this.active);
    const el1 = currIndex > index ? this.placeholder : element;
    const el2 = currIndex > index ? element : this.placeholder;
    this.element.insertBefore(el1, el2);
  }

  drop = () => {
    document.removeEventListener('pointerover', this.drag);
    if (this.active) {
      this.element.insertBefore(this.active, this.placeholder);

      this.element.dispatchEvent(new CustomEvent('change-order', {
        bubbles: true
      }));

      this.active.style.top = 'unset';
      this.placeholder.remove();
      this.active.classList.remove('sortable-list__item_dragging');
      this.active = null;
    }
  };

  dragAt(clientY) {
    this.active.style.top = clientY - this.active.offsetHeight / 2 + 'px';
  }

  delete() {
    this.active.remove();
    this.active = null;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element.removeEventListener('pointerdown', this.initAction);
    this.remove();
    this.placeholder = null;
    this.active = null;
  }
}
