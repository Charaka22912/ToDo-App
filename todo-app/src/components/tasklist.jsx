import  { useState, useEffect } from "react";

function Tasklist() {
    const [task, setTask] = useState("");
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        // Fetch tasks from the backend when the component mounts
        const fetchTasks = async () => {
            const response = await fetch("http://localhost:5000/tasks");
            const data = await response.json();
            setTasks(data);  // Update state with tasks from database
        };

        fetchTasks();
    }, []);

    const handleChange = (event) => {
        setTask(event.target.value);
    };

    const handleSubmit = async () => {
        if (!task.trim()) {
            alert("Task cannot be empty");
            return;
        }

        // Send the task to the backend
        await fetch("http://localhost:5000/add-task", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task }),
        });

        // Fetch the updated list of tasks from the database
        const response = await fetch("http://localhost:5000/tasks");
        const data = await response.json();
        setTasks(data);  // Update state with new list of tasks

        setTask(""); // Clear input after submission
    };
    const handleComplete = (taskId) => {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        ));
      };
    
      const handleDelete = async (taskId) => {
        try {
          // Make an API call to delete the task from the database
          await fetch(`http://localhost:5000/tasks/${taskId}`, {
            method: 'DELETE',
          });
      
          // Update the state to remove the task from the UI
          setTasks(tasks.filter(task => task.id !== taskId));
        } catch (error) {
          console.error("Error deleting task:", error);
        }
      };
    return (
        <>
            <div className="ui segment">To Do List</div>
            <div >
                <input className="ui input focus"
                    type="text"
                    value={task}
                    onChange={handleChange}
                    placeholder="Add new Task"
                />
            </div>
            <button className="ui positive button" type="button" onClick={handleSubmit}>Submit</button>
            <hr />
            <div>
  <h3>Task List</h3>
  <div className="ui cards">
    {tasks.map((taskItem) => (
      <div className="ui card" key={taskItem.id}>
        <div className="content">
          <div className="header">{taskItem.task}</div>
        </div>
        <div className="extra content">
          <div className="ui two buttons">
          <button 
                  className="ui green basic button"
                  onClick={() => handleComplete(taskItem.id)}
                  disabled={taskItem.completed}
                >
                  {taskItem.completed ? 'Completed' : 'Complete'}
                </button>
                <button 
                  className="ui red basic button"
                  onClick={() => handleDelete(taskItem.id)}
                >
                  Delete
                </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

        </>
    );
}

export default Tasklist;
