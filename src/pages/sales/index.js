import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Sales {
  element;
  rangePicker;
  salesTable;
  from;
  to;
  range = 10;

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.to = new Date();
    this.from = new Date(this.to);
    this.from.setDate(this.from.getDate() - this.range);

    this.getRangePicker();
    this.getSalesTable();

    return this.element;
  }

  getTemplate() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
            <h1 class="page-title">Продажи</h1>
        </div>
        <div data-element="ordersContainer" class="full-height flex-column"></div>
      </div>
    `;
  }

  getRangePicker() {
    this.rangePicker = new RangePicker({
      from: this.from,
      to: this.to
    });

    this.rangePicker.element.dataset.element = 'rangePicker';

    this.element.firstElementChild.append(this.rangePicker.element);

    this.rangePicker.element.addEventListener('date-select', this.updateData);
  }

  getSalesTable() {
    this.salesTable = new SortableTable(header, {
      isSortLocally: false,
      url: this.getSalesTableUrl(),
      hasLink: false,
      sorted: {
        id: 'createdAt',
        order: 'desc'
      }
    });
    const ordersContainer = this.element.querySelector('[data-element=ordersContainer]');
    ordersContainer.append(this.salesTable.element);
  }

  getSalesTableUrl() {
    const url = new URL('api/rest/orders', BACKEND_URL);
    url.searchParams.set('createdAt_gte', this.from.toISOString());
    url.searchParams.set('createdAt_lte', this.to.toISOString());


    return url.toString();
  }

  updateData = async(event) => {
    const {from, to} = event.detail;
    this.from = from;
    this.to = to;

    this.salesTable.destroy();
    this.getSalesTable();
  };

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
    this.rangePicker.element.removeEventListener('date-select', this.updateData);
  }
}
