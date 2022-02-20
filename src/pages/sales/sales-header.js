const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'User',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Created at',
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
    title: 'Total Cost',
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
    title: 'Status',
    sortable: true,
    sortType: 'string'
  },
];

export default header;
