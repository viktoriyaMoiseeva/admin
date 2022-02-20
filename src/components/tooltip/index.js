class Tooltip {
  element;
  static instance;
  shift = 10;

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }
    this.initialize();
    this.render();
    return Tooltip.instance;
  }

  render() {
    this.element = document.createElement('div');
    document.body.append(this.element);
  }

  initialize() {
    document.addEventListener('pointerover', this.showTooltip);
    document.addEventListener('pointerout', this.hideTooltip);
  }

  showTooltip = event => {
    const active = event.target.closest('[data-tooltip]');

    if (!active) {
      return;
    }

    this.render();

    this.element.classList.add('tooltip');
    this.element.innerHTML = active.dataset.tooltip;
    document.addEventListener("pointermove", this.moveTooltip);
  };

  moveTooltip = event => {
    const shiftX = event.clientX;
    const shiftY = event.clientY;

    this.element.style.left = shiftX + this.shift + 'px';
    this.element.style.top = shiftY + this.shift + 'px';
  };

  hideTooltip = () => {
    document.removeEventListener("pointermove", this.moveTooltip);
    this.destroy();
  };

  destroy() {
    this.element.remove();
  }
}

const tooltip = new Tooltip();

export default tooltip;
