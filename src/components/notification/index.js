export default class NotificationMessage {
  element = null;
  static activeElement;

  constructor(message = '', {
    duration = 1000,
    type = 'success'
  } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  show(target = document.body) {
    if (NotificationMessage.activeElement) {
      NotificationMessage.activeElement.remove();
    }

    NotificationMessage.activeElement = this.element;
    target.append(this.element);

    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration}ms">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  destroy() {
    this.element.remove();
  }

  remove() {
    this.element.remove();
  }
}
