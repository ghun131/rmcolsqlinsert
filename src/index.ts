import { readFileSync, writeFileSync } from "node:fs";

function prepareInput(path: string) {
  const data = readFileSync(path);
  if (!data) {
    throw Error("Failed to read sql file!");
  }

  // const tempStr = data.toString().replace(/\s/g, "");
  const tempStr = data.toString();
  let strArr = [];
  if (tempStr.includes("VALUE")) {
    strArr = tempStr.split("VALUES");
  } else if (tempStr.includes("values")) {
    strArr = tempStr.split("values");
  } else {
    throw Error("No VALUES for INSERT statement!");
  }

  return {
    insert: strArr[0],
    input: strArr[1].replace(/\s/g, "").split("),"),
  };
}

// Remove the first column INSERT INTO statement
function rmFirstColInsertStm(insertStm: string) {
  const words = insertStm.split(" ").filter((el) => !!el);
  const colNames = words.filter((col) =>
    [",", "(", ")"].some((sym) => col.includes(sym))
  );
  colNames.shift();

  const columns = "(" + colNames.join(" ");
  const insert = words.slice(0, 3).join(" ");

  return insert + " " + columns;
}

function rmFirstCol(path: string) {
  const { insert, input } = prepareInput(path);
  const insertStt = rmFirstColInsertStm(insert);
  const temp = input
    .map((item) => {
      const arr = item.split(",");
      const newItem = arr
        .reduce((acc, el, idx) => {
          if (idx !== 0) acc.push(el);
          return acc;
        }, [] as string[])
        .join(", ");

      return "(" + newItem;
    })
    .join("),\n");

  return insertStt + " VALUES \n" + temp;
}

// Remove random column with insert statement
function rmNColInsertStm(insertStm: string, idx: number) {
  const words = insertStm.split(" ").filter((wd) => !!wd);
  const colNames = words.filter((col) =>
    [",", "(", ")"].some((sym) => col.includes(sym))
  );

  let columns = colNames
    .reduce((acc, item, index) => {
      if (index !== idx) acc.push(item);

      return acc;
    }, [] as string[])
    .join(" ");

  // when remove last column
  if (idx === colNames.length - 1) {
    columns = columns.substring(0, columns.length - 1) + ")";
  }

  return words.slice(0, 3).join(" ") + " " + columns;
}

function rmNCol(colIdx: number, path: string) {
  if (colIdx === 0) return rmFirstCol(path);

  const { insert, input } = prepareInput(path);
  const insertStt = rmNColInsertStm(insert, colIdx);

  const temp = input
    .reduce((acc, item, index, inputArr) => {
      const arr = item.split(",");

      let result = arr
        .reduce((curAcc, curItem, curIdx) => {
          if (curIdx !== colIdx) curAcc.push(curItem);

          return curAcc;
        }, [] as string[])
        .join(", ");

      // add semi colon when removing the last column
      if (index === inputArr.length - 1) {
        result += ");";
      }

      acc.push(result);

      return acc;
    }, [] as string[])
    .join("),\n");

  console.log("temp", temp);

  return insertStt + " VALUES \n" + temp;
}

function writeSQLFile(colIdx: number, path: string) {
  try {
    const inputPath = path + "/input.sql";
    const data = colIdx ? rmNCol(colIdx, inputPath) : rmFirstCol(inputPath);
    writeFileSync(path + "/output.sql", data, { encoding: "utf8" });
  } catch (error) {
    throw error;
  }
}

const removeColumn = writeSQLFile;

export default removeColumn;
