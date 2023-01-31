import fs from 'node:fs/promises';

// Para indicar o caminho do arquivo utilizamos o import.meta.url pois ele pega o caminho de onde esse importe é chamado
// Caso contrário irá pegar o caminho da onde executamos o nosso projeto, então pelo import.meta.url temos um controle mais acurado.
const databasePath = new URL('../db.json',import.meta.url);

export class Database {
  //Adicionamos o # para deixar essa propriedade privada,
  //Assim ao importar essa classe o atribuito "database" não irá mais aparecer no auto complete.
  #database = {};

  constructor(){
    fs.readFile(databasePath,'utf-8')
      .then(data=>this.#database=JSON.parse(data))
      .catch(()=>this.#persist());
  }

  #persist(){
    fs.writeFile(databasePath,JSON.stringify(this.#database));
  }

  select(table,search){ 
    let data = this.#database[table] ?? [];
    if(search){
      data = data.filter(row=>{
        return Object.entries(search).some(([key,value])=>{
          return row[key].includes(value);
        })
      })
    }
    return data;
  }

  findById(table,id){
    if(!table || !id) throw new Error(`Please informe the id and the table`);
    let data = this.#database[table];
    if(!data) throw new Error(`table ${table} not founded`);
    
    data = data.find(row=>{
      return row.id === id;
    });
    
    if(!data) throw new Error(`ID of table ${table} not founded`);
    
    return data;
  }

  insert(table,data){
    if(Array.isArray(this.#database[table])){
      this.#database[table].push(data)
    }else{
      this.#database[table] = [data];
    }
    this.#persist();
    return data;
  }

  delete(table,id){
    const rowIndex = this.#database[table].findIndex(row=>row.id===id);
    if(rowIndex > -1){
      this.#database[table].splice(rowIndex,1);
      this.#persist();
    }else{
      throw new Error(`ID of table ${table} not founded`);
    }
  }

  update(table,id,data){
    const rowIndex = this.#database[table].findIndex(row=>row.id===id);
    if(rowIndex > -1){
      this.#database[table][rowIndex] = {id,...data};
      this.#persist();
    }else{
      throw new Error(`ID of table ${table} not founded`);
    }
  }
}