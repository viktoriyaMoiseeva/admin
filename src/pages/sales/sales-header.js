const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'Клиент',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Дата',
    sortable: true,
    sortType: 'string',
    template: data => {
      const date = new Date(Date.parse(data));
      const formatDate = date.toLocaleDateString('ru-RU', {year: 'numeric', month: 'short', day: 'numeric'});
      return `
          <div class="sortable-table__cell">
            ${formatDate}
          </div>
        `;
    }
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `
          <div class="sortable-table__cell">
            $${data.toLocaleString('en-US')}
          </div>
        `;
    }
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string'
  },
];

export default header;
