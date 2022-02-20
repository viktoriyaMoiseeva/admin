import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Dashboard {
  element;
  subElements;
  rangePicker;
  columnCharts;
  bestsellersTable;
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
    this.getColumnCharts();
    this.getBestsellersTable();

    this.subElements = this.getSubElements();

    return this.element;
  }

  getTemplate() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
            <h2 class="page-title">Панель управления</h2>
        </div>
        <div class="dashboard__charts"></div>
        <h3 class="block-title">Лидеры продаж</h3>
      </div>
    `;
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

  getRangePicker() {
    this.rangePicker = new RangePicker({
      from: this.from,
      to: this.to
    });

    this.rangePicker.element.dataset.element = 'rangePicker';

    this.element.firstElementChild.append(this.rangePicker.element);

    this.rangePicker.element.addEventListener('date-select', this.updateData);
  }

  getColumnCharts() {
    const charts = this.element.querySelector('.dashboard__charts');
    this.columnCharts = {
      ordersChart: new ColumnChart({
        url: 'api/dashboard/orders',
        range: {
          from: this.from,
          to: this.to,
        },
        label: 'orders',
        link: '#'
      }),

      salesChart: new ColumnChart({
        url: 'api/dashboard/sales',
        range: {
          from: this.from,
          to: this.to,
        },
        label: 'sales',
        formatHeading: data => `$${data.toLocaleString()}`
      }),

      customersChart: new ColumnChart({
        url: 'api/dashboard/customers',
        range: {
          from: this.from,
          to: this.to,
        },
        label: 'customers',
      })
    };

    Object.keys(this.columnCharts).forEach(key => {
      const chart = document.createElement('div');
      chart.dataset.element = key;

      const className = this.columnCharts[key].label;
      chart.className = `dashboard__chart_${className}`;

      chart.append(this.columnCharts[key].element);
      charts.append(chart);
    });
  }

  getBestsellersTable() {
    this.bestsellersTable = new SortableTable(header, {
      isSortLocally: true,
      url: this.getBestsellersUrl(),
    });
    this.bestsellersTable.element.dataset.element = 'sortableTable';

    this.element.append(this.bestsellersTable.element);
  }

  getBestsellersUrl() {
    const url = new URL('api/dashboard/bestsellers', BACKEND_URL);
    url.searchParams.set('from', this.from.toISOString());
    url.searchParams.set('to', this.to.toISOString());


    return url.toString();
  }

  updateData = async(event) => {
    const {from, to} = event.detail;
    this.from = from;
    this.to = to;

    await this.columnCharts.ordersChart.update(from, to);
    await this.columnCharts.salesChart.update(from, to);
    await this.columnCharts.customersChart.update(from, to);

    this.bestsellersTable.destroy();
    this.getBestsellersTable();
  };

  destroy() {
    this.remove();
    this.subElements = {};
  }

  remove() {
    this.element.remove();
    this.rangePicker.element.removeEventListener('date-select', this.updateData);
  }
}
