import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './styles.css';
import logo from './assets/logo.png';

Modal.setAppElement('#root');

function App() {
    const [events, setEvents] = useState([]);
    const [form, setForm] = useState({ name: '', date: '', type: 'Birthday' });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('All');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [todoModalIsOpen, setTodoModalIsOpen] = useState(false);
    const [newTask, setNewTask] = useState('');
    const [editingTaskIndex, setEditingTaskIndex] = useState(null);
    const [taskEditText, setTaskEditText] = useState('');

    const categories = ['All', 'Birthday', 'Meeting', 'Conference', 'Party', 'Workshop'];

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get('http://localhost:3001/events');
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:3001/update-event/${editingId}`, form);
                setMessage('Event updated successfully!');
            } else {
                await axios.post('http://localhost:3001/add-event', form);
                setMessage('Event added successfully!');
            }
            fetchEvents();
            resetForm();
        } catch (error) {
            console.error('Error saving event:', error);
            setMessage('Error saving event');
        }
    };

    const resetForm = () => {
        setForm({ name: '', date: '', type: 'Birthday' });
        setEditingId(null);
        setModalIsOpen(false);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleEdit = (event) => {
        setForm({ name: event.name, date: event.date, type: event.type });
        setEditingId(event.id);
        setModalIsOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/delete-event/${id}`);
            fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleCategoryClick = (category) => {
        setCategory(category);
        setSelectedEvent(null);
    };

    const filteredEvents = category === 'All' ? events : events.filter(event => event.type === category);

    const handleEventClick = async (event) => {
        try {
            const response = await axios.get(`http://localhost:3001/tasks/${event.id}`);
            setSelectedEvent({ ...event, tasks: response.data });
            setTodoModalIsOpen(true);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const fetchTasks = async (eventId) => {
        try {
            const response = await axios.get(`http://localhost:3001/tasks/${eventId}`);
            setSelectedEvent((prevEvent) => ({ ...prevEvent, tasks: response.data }));
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleAddTask = async () => {
        if (newTask.trim()) {
            try {
                const response = await axios.post('http://localhost:3001/add-task', {
                    eventId: selectedEvent.id,
                    description: newTask,
                });
                const addedTask = { id: response.data.id, description: newTask, completed: false };
                setSelectedEvent({ ...selectedEvent, tasks: [...selectedEvent.tasks, addedTask] });
                fetchTasks(selectedEvent.id);
                setNewTask('');
                await fetchEvents(); // <-- Add this line to refresh events
            } catch (error) {
                console.error('Error adding task:', error);
            }
        }
    };

    const handleToggleTask = async (index) => {
        const task = selectedEvent.tasks[index];
        const updatedTask = { ...task, completed: !task.completed };

        try {
            await axios.put(`http://localhost:3001/update-task-completion/${task.id}`, {
                completed: updatedTask.completed,
            });
            const updatedTasks = selectedEvent.tasks.map((t, i) => (i === index ? updatedTask : t));
            setSelectedEvent({ ...selectedEvent, tasks: updatedTasks });
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleTaskEditChange = (index) => {
        setEditingTaskIndex(index);
        setTaskEditText(selectedEvent.tasks[index].description);
    };

    const handleTaskEditSubmit = async () => {
        const task = selectedEvent.tasks[editingTaskIndex];
        if (taskEditText.trim()) {
            try {
                await axios.put(`http://localhost:3001/update-task-description/${task.id}`, {
                    description: taskEditText,
                });
                const updatedTasks = selectedEvent.tasks.map((t, i) =>
                    i === editingTaskIndex ? { ...t, description: taskEditText } : t
                );
                setSelectedEvent({ ...selectedEvent, tasks: updatedTasks });
                fetchTasks(selectedEvent.id);
                setEditingTaskIndex(null);
                setTaskEditText('');
                await fetchEvents(); // <-- Add this line to refresh events
            } catch (error) {
                console.error('Error updating task:', error);
            }
        }
    };

    const handleDeleteTask = async (index) => {
        const task = selectedEvent.tasks[index];
        try {
            await axios.delete(`http://localhost:3001/delete-task/${task.id}`);
            const updatedTasks = selectedEvent.tasks.filter((_, i) => i !== index);
            setSelectedEvent({ ...selectedEvent, tasks: updatedTasks });
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div className="container">
            <img src={logo} alt="Event Planner Logo" className="logo" />
            <button onClick={() => { setModalIsOpen(true); setEditingId(null); }}>Add Event</button>
            {message && <p className="message">{message}</p>}
            <div className="category-tabs">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={category === cat ? 'active' : ''}
                        onClick={() => handleCategoryClick(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="event-list">
                {filteredEvents.map(event => (
                    <div key={event.id} className="event-card" onClick={() => handleEventClick(event)}>
                        <h3>{event.name}</h3>
                        <p>{new Date(event.date).toLocaleDateString()}</p>
                        <p>{event.type}</p>
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(event); }}>Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}>Delete</button>
                    </div>
                ))}
            </div>
            {/* Add/Edit Event Modal */}
            <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="modal">
                <h2>{editingId ? 'Update Event' : 'Add Event'}</h2>
                <form onSubmit={handleSubmit} className="event-form">
                    <input
                        type="text"
                        placeholder="Event Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                   required />
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required />
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
                        {categories.slice(1).map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button type="submit">{editingId ? 'Update Event' : 'Add Event'}</button>
                </form>
                <button className="close-button" onClick={() => setModalIsOpen(false)}>Close</button>
            </Modal>
            {/* To-Do List Modal */}
            {selectedEvent && (
                <Modal isOpen={todoModalIsOpen} onRequestClose={() => setTodoModalIsOpen(false)} className="modal">
                    <h2>{selectedEvent.name} - To-Do List</h2>
                    <div className="todo-list">
                        <ul>
                            {(selectedEvent.tasks || []).map((task, index) => (
                                <li key={task.id} className="todo-item">
                                    <input
                                        type="checkbox"
                                        checked={task.completed || false}
                                        onChange={() => handleToggleTask(index)}
                                    />
                                    {editingTaskIndex === index ? (
                                        <div className="task-edit-box">
                                            <input
                                                type="text"
                                                value={taskEditText}
                                                onChange={(e) => setTaskEditText(e.target.value)}
                                                className='todoedit'
                                            />
                                            <button onClick={handleTaskEditSubmit}>Save</button>
                                        </div>
                                    ) : (
                                        <span className={task.completed ? 'completed' : ''}>{task.task_description}</span>
                                    )}
                                    <FaEdit className="icon" onClick={() => handleTaskEditChange(index)} />
                                    <FaTrash className="icon" onClick={() => handleDeleteTask(index)} />
                                </li>
                            ))}
                        </ul>
                        <input
                            type="text"
                            placeholder="New Task"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            className="wide-input"
                        />
                        <button onClick={handleAddTask} className="wide-button">Add Task</button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default App;
