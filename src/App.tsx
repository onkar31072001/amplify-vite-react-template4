import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from "../amplify/data/resource";

// Generate the client
const client = generateClient<Schema>();

function App() {
  const { signOut } = useAuthenticator();

  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state for better UX
  const [error, setError] = useState<string | null>(null); // Error state for feedback

  // Fetch todos using a subscription
  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => {
        console.log('Data received from subscription:', data.items);
        setTodos(data.items);
        setLoading(false); // Data received, stop loading
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        setError("Failed to fetch todos.");
        setLoading(false);
      },
    });

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Create new todo
  const createTodo = async () => {
    try {
      const content = window.prompt("Todo content");
      if (content) {
        const result = await client.models.Todo.create({ content });
        console.log("Todo created:", result);
      }
    } catch (err) {
      console.error("Error creating todo:", err);
      setError("Failed to create todo.");
    }
  };

  // Delete a todo
  const deleteTodo = async (id: string) => {
    try {
      const result = await client.models.Todo.delete({ id });
      console.log("Todo deleted:", result);
    } catch (err) {
      console.error("Error deleting todo:", err);
      setError("Failed to delete todo.");
    }
  };

  return (
    <main>
      <h1>My Todos</h1>

      {/* Show loading indicator if still fetching */}
      {loading && <p>Loading todos...</p>}

      {/* Show error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={createTodo}>+ New Todo</button>
      <ul>
        {todos.length > 0 ? (
          todos.map((todo) => (
            <li key={todo.id} onClick={() => deleteTodo(todo.id)}>
              {todo.content}
            </li>
          ))
        ) : (
          <p>No todos found.</p>
        )}
      </ul>

      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review the next steps of this tutorial.
        </a>
      </div>

      <button onClick={signOut}>Sign Out</button>
    </main>
  );
}

export default App;


