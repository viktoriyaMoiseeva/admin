const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};
  element;
  data = {};
  count = 0;
  isLoading = true;
  dataKeys = [];
  dataValues = [];

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date()
    },
    label = '',
    link = '',
    formatHeading = (data) => data,
  } = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.update();
    this.initEventListeners();
  }

  getTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label} ${this.getLink()}
        </div>

        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
          </div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
  }

  getLink() {
    return this.link ? `
       <a href=${this.link} class="column-chart__link">View all</a>
    ` : '';
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

  async update(from = this.range.from, to = this.range.to) {
    this.isLoading = true;
    this.element.classList.add('column-chart_loading');

    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      this.data = await response.json();
      this.dataKeys = Object.keys(this.data);
      this.dataValues = Object.values(this.data);

      this.count = this.dataValues.reduce((prev, cur) => {
        return prev + cur;
      });

      this.chartsLoaded();
    }

    return this.data;
  }

  chartsLoaded() {
    if (this.dataKeys.length !== 0) {
      this.isLoading = false;
      this.element.classList.remove('column-chart_loading');
      this.subElements.body.innerHTML = this.getChartElements();
      this.subElements.header.innerHTML = this.formatHeading(this.count);
    }
  }

  getChartElements() {
    const maxValue = Math.max(...this.dataValues);
    const scale = this.chartHeight / maxValue;

    const chartElements = Object.entries(this.data).map(item => {
      const value = String(Math.floor(item[1] * scale));
      const date = new Date(Date.parse(item[0]));
      const formatDate = date.toLocaleDateString('ru-RU', {year: 'numeric', month: 'short', day: 'numeric'});

      const formatValue = this.formatHeading(item[1]);
      return `<div style="--value: ${value}" data-tooltip="<div><small>${formatDate}</small></div><strong>${formatValue}</strong>"></div>`;
    });

    return chartElements.join('');
  }

  initEventListeners() {
    this.subElements.body.addEventListener('pointerover', this.hovered);
    this.subElements.body.addEventListener('pointerout', this.unhovered);
  }

  hovered = event => {
    const active = event.target.closest("[data-tooltip]");

    if (!active) {
      return;
    }
    active.parentNode.classList.add('has-hovered');
    active.classList.add('is-hovered');
  };

  unhovered = () => {
    const active = this.element.querySelector('.is-hovered');

    if (!active) {
      return;
    }
    const activeParent = active.parentNode;

    active.classList.remove('is-hovered');
    activeParent.classList.remove('has-hovered');

  };

  destroy() {
    this.remove();
    this.subElements = {};
  }

  remove() {
    this.element.remove();
  }
}
