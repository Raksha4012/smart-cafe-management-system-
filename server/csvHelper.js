// Helper functions for CSV conversion and parsing

export function jsonToCsv(items, headers) {
  if (!items || !items.length) {
    return headers ? headers.join(',') + '\n' : '';
  }

  const keys = headers || Object.keys(items[0]);
  const headerLine = keys.join(',');

  const rows = items.map(item => {
    return keys.map(key => {
      let val = item[key];
      if (val === undefined || val === null) val = '';
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      val = String(val).replace(/"/g, '""');
      if (val.includes(',') || val.includes('\n') || val.includes('"')) {
        val = `"${val}"`;
      }
      return val;
    }).join(',');
  });

  return [headerLine, ...rows].join('\n');
}

export function csvToJson(csvString) {
  if (!csvString || !csvString.trim()) return [];

  const lines = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvString.length; i++) {
    const char = csvString[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);

  if (lines.length === 0) return [];

  const headers = parseCsvRow(lines[0]);
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvRow(lines[i]);
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;
    const obj = {};
    headers.forEach((header, index) => {
      let val = row[index] || '';
      if (val.startsWith('{') || val.startsWith('[')) {
        try {
          val = JSON.parse(val);
        } catch (e) {
          // keep string if parse fails
        }
      } else if (!isNaN(val) && val.trim() !== '') {
        val = Number(val);
      } else if (val === 'true') val = true;
      else if (val === 'false') val = false;

      obj[header] = val;
    });
    result.push(obj);
  }

  return result;
}

function parseCsvRow(rowString) {
  const fields = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < rowString.length; i++) {
    const char = rowString[i];
    if (char === '"') {
      if (inQuotes && rowString[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(field.trim());
      field = '';
    } else {
      field += char;
    }
  }
  fields.push(field.trim());
  return fields;
}
