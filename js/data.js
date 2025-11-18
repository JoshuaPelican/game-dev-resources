async function getCsvFromGoogleSheet(csvUrl) {
  try {
    const response = await fetch(csvUrl, {
      method: 'get',
      headers: {
        'content-type': 'text/csv;charset=UTF-8',
      },
    });

    if (response.status === 200) {
      const csvData = await response.text();
      // You can now process the csvData string, e.g., parse it into an array of objects
      return csvData;
    } else {
      console.error(`Error fetching CSV: Status code ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error("Error during fetch operation:", error);
    return null;
  }
}


/**
 * Takes a raw CSV string and converts it to a JavaScript object.
 * @param {string} text The raw CSV string.
 * @param {string[]} headers An optional array of headers to use. If none are
 * given, they are pulled from the first line of `text`.
 * @param {string} quoteChar A character to use as the encapsulating character.
 * @param {string} delimiter A character to use between columns.
 * @returns {object[]} An array of JavaScript objects containing headers as keys
 * and row entries as values.
 * https://stackoverflow.com/questions/59218548/what-is-the-best-way-to-convert-from-csv-to-json-when-commas-and-quotations-may/59219146#59219146
 */
function csvToJson(text, headers, quoteChar = '"', delimiter = ',') {
  const regex = new RegExp(`\\s*(${quoteChar})?(.*?)\\1\\s*(?:${delimiter}|$)`, 'gs');

  const match = line => [...line.matchAll(regex)]
    .map(m => m[2])  // we only want the second capture group
    .slice(0, -1);   // cut off blank match at the end

  const lines = text.split('\n');
  const heads = headers ?? match(lines.shift());

  return lines.map(line => {
    return match(line).reduce((acc, cur, i) => {
      // Attempt to parse as a number; replace blank matches with `null`
      const val = cur.length <= 0 ? null : Number(cur) || cur;
      const key = heads[i] ?? `extra_${i}`;
      return { ...acc, [key]: val };
    }, {});
  });
}