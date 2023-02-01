// eslint-disable-next-line import/prefer-default-export
export function addRow(table, content) {
  const newRow = table.insertRow(-1);
  const newCell = newRow.insertCell(0);
  newCell.appendChild(content);
}
