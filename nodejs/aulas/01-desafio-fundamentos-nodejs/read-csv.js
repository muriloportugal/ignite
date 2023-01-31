import fs from 'node:fs';
import { parse } from 'csv-parse';

const tasksPath = new URL('./tasks.csv',import.meta.url);

const readFile = async () => {
  const records = [];
  const parser = fs
    .createReadStream(tasksPath)
    .pipe(parse());

  let count = 0;
  for await (const record of parser) {
    if(count===0){
      count++;
      continue;
    }
    const [title,description] = record;
    const task = { title: title , description: description };
    

    fetch('http://localhost:3333/tasks',{
      method: 'POST',
      body: JSON.stringify(task),
    }).then(resp=>{
      resp.text().then(data=>console.log(data));
    }).catch(error=>{
      console.log(error);
    })

    records.push(record);
  }
  return records;
};


(async () => {
  const records = await readFile();
})();