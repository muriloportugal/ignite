import { randomUUID } from 'node:crypto';
import { Database } from "./database.js";
import { buildRoutePath } from "./util/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (request,response)=>{
      const {search} = request.query;
      const task = search ? {
        title: decodeURIComponent(search),
        description: decodeURIComponent(search),
      } : null;
      const tasks = database.select('tasks',task);
      return response.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (request,response)=>{
      const {title,description} = request.body;
      if(!title || !description){
        return response.writeHead(400).end(JSON.stringify({erro:'Please informe the title and the description of the task.'}))
      }
      const task = {
        id: randomUUID(),
        title: title,
        description:description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null,
      };

      database.insert('tasks',task);
      return response.writeHead(201).end();
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (request,response)=>{
      try {
        const { id } = request.params;
        database.delete('tasks',id);
        return response.writeHead(204).end();  
      } catch (error) {
        return response.writeHead(400).end(JSON.stringify({message:error.message}));
      }
      
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (request,response)=>{
      try {
        const {id} = request.params;
        const {title,description} = request.body;
        if(!title && !description){
          return response.writeHead(400).end(JSON.stringify({erro:'Please informe the new title or the description of the task.'}))
        }
        
        let task = database.findById('tasks',id);
        
        task.title = title ?? task.title;
        task.description = description ?? task.description;
        task.updated_at = new Date();

        database.update('tasks',id,task);
        return response.writeHead(204).end()
      } catch (error) {
        return response.writeHead(400).end(JSON.stringify({message:error.message}));
      }
    },
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (request,response)=>{
      try {
        const {id} = request.params;
        
        let task = database.findById('tasks',id);
        
        task.updated_at = new Date();
        //Se a task tem data no campo completed_at é porque ela já esta concluída, então trocamos para null,
        //caso contrário adicionamos a data atual para indiciar que foi concluída
        if(task.completed_at){
          task.completed_at = null;
        }else{
          task.completed_at = new Date();
        }

        database.update('tasks',id,task);
        return response.writeHead(204).end()
      } catch (error) {
        return response.writeHead(400).end(JSON.stringify({message:error.message}));
      }
    },
  }
];
