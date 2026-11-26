import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || '';

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");

  const fetchTodos = async () => {
    const response = await axios.get(`${API_BASE}/todos`);
    setTodos(response.data);
  };

  const addTodo = async () => {
    if (task.tr()) {
      const response = await axios.post(`${API_BASE}/todos`, { text: task });
      setTodos([...todos, response.data]);
      setTask("");
    }
  };

  const toggleComplete = async (id) => {
    const response = await axios.patch(`${API_BASE}/todos/${id}`);
    const updatedTodos = todos.map(todo =>
      todo._id === id ? response.data : todo
    );
    setTodos(updatedTodos);
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API_BASE}/todos/${id}`);
    setTodos(todos.filter(todo => todo._id !== id));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="App">
      <h1>Lista de Tarefas</h1>
      <div>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Adicione uma tarefa"
        />
        <button onClick={addTodo}>Adicionar</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo._id} style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
            <span onClick={() => toggleComplete(todo._id)}>{todo.text}</span>
            <button onClick={() => deleteTodo(todo._id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
