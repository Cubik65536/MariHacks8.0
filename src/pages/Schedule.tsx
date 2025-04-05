import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import TodoList, { Todo } from '../components/Todo/TodoList';
import EventModal, { CalendarEvent } from '../components/Calendar/EventModal';
import { useAuth } from '../lib/AuthContext';
import { storageService } from '../lib/StorageService';

// Define interfaces that match the component expectations
interface StorageTodo extends Omit<Todo, 'dueDate'> {
  dueDate?: string;
}

interface StorageCalendarEvent extends Omit<CalendarEvent, 'start' | 'end'> {
  startTime: string;
  endTime: string;
}

// Helper function to convert StorageCalendarEvent to CalendarEvent
const convertToCalendarEvent = (event: StorageCalendarEvent): CalendarEvent => {
  return {
    ...event,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
  };
};

// Helper function to convert StorageTodo to Todo
const convertToTodo = (todo: StorageTodo): Todo => {
  return {
    ...todo,
    dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
  };
};

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Load todos and events from StorageService on component mount
  useEffect(() => {
    if (user) {
      // Load todos
      const userTodos = storageService.getTodos(user.id);
      setTodos(userTodos.map(convertToTodo));

      // Load events
      const userEvents = storageService.getEvents(user.id);
      setEvents(userEvents.map(convertToCalendarEvent));
    }
  }, [user]);

  const handleDateSelect = (selectInfo: any) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    setSelectedEvent({
      start: selectInfo.start,
      end: selectInfo.end,
      allDay: selectInfo.allDay,
    });
    setModalMode('create');
    setShowEventModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setModalMode('edit');
      setShowEventModal(true);
    }
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!user) return;

    if (modalMode === 'create') {
      // Create a new event in StorageService
      const newEvent = storageService.createEvent({
        title: eventData.title,
        description: eventData.description || '',
        startTime: eventData.start.toISOString(),
        endTime: eventData.end.toISOString(),
        allDay: eventData.allDay || false,
        color: '#3b82f6', // Default blue color
        userId: user.id,
      });

      // Update local state
      setEvents([...events, convertToCalendarEvent(newEvent)]);
    } else if (selectedEvent?.id) {
      // Update existing event in StorageService
      const updatedEvent = storageService.updateEvent(selectedEvent.id, user.id, {
        title: eventData.title,
        description: eventData.description || '',
        startTime: eventData.start.toISOString(),
        endTime: eventData.end.toISOString(),
        allDay: eventData.allDay || false,
      });

      if (updatedEvent) {
        // Update local state
        setEvents(events.map(event => 
          event.id === selectedEvent.id ? convertToCalendarEvent(updatedEvent) : event
        ));
      }
    }
  };

  const handleDeleteEvent = () => {
    if (!user || !selectedEvent?.id) return;

    // Delete event from StorageService
    if (storageService.deleteEvent(selectedEvent.id, user.id)) {
      // Update local state
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setShowEventModal(false);
      setSelectedEvent(undefined);
    }
  };

  const handleAddTodo = (todo: Omit<Todo, 'id'>) => {
    if (!user) return;

    // Create a new todo in StorageService
    const newTodo = storageService.createTodo({
      text: todo.text,
      completed: false,
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString() : undefined,
      priority: todo.priority,
      category: todo.category,
      userId: user.id,
    });

    // Update local state
    setTodos([...todos, convertToTodo(newTodo)]);

    // If the todo has a due date, also add it as a calendar event
    if (todo.dueDate) {
      const endDate = new Date(todo.dueDate);
      endDate.setHours(23, 59, 59);

      // Create a new event in StorageService
      const newEvent = storageService.createEvent({
        title: `📋 ${todo.text}`,
        description: `Priority: ${todo.priority}\nCategory: ${todo.category}`,
        startTime: new Date(todo.dueDate).toISOString(),
        endTime: endDate.toISOString(),
        allDay: true,
        color: '#3b82f6', // Default blue color
        userId: user.id,
      });

      // Update local state
      setEvents([...events, convertToCalendarEvent(newEvent)]);
    }
  };

  const handleToggleTodo = (id: string) => {
    if (!user) return;

    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Update todo in StorageService
    const updatedTodo = storageService.updateTodo(id, user.id, {
      completed: !todo.completed,
    });

    if (updatedTodo) {
      // Update local state
      setTodos(todos.map(t => 
        t.id === id ? convertToTodo(updatedTodo) : t
      ));

      // If the todo is being marked as completed and has a due date, remove its calendar event
      if (!todo.completed && todo.dueDate) {
        const eventId = `todo-${id}`;
        if (storageService.deleteEvent(eventId, user.id)) {
          setEvents(events.filter(event => event.id !== eventId));
        }
      }
    }
  };

  const handleDeleteTodo = (id: string) => {
    if (!user) return;

    // Delete todo from StorageService
    if (storageService.deleteTodo(id, user.id)) {
      // Update local state
      setTodos(todos.filter(todo => todo.id !== id));

      // Remove the corresponding calendar event if it exists
      const eventId = `todo-${id}`;
      if (storageService.deleteEvent(eventId, user.id)) {
        setEvents(events.filter(event => event.id !== eventId));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Schedule</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              select={handleDateSelect}
              eventClick={handleEventClick}
              height="auto"
              aspectRatio={1.8}
              eventContent={(eventInfo) => {
                const isTodo = eventInfo.event.id.startsWith('todo-');
                return (
                  <div className={`p-1 ${isTodo ? 'todo-event' : ''}`}>
                    <div className="text-sm font-medium">{eventInfo.event.title}</div>
                    {eventInfo.event.extendedProps.description && (
                      <div className="text-xs opacity-75">{eventInfo.event.extendedProps.description}</div>
                    )}
                  </div>
                );
              }}
            />
          </div>

          {/* Todo List */}
          <div className="lg:col-span-1">
            <TodoList
              todos={todos}
              onAddTodo={handleAddTodo}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
            />
          </div>
        </div>

        {/* Event Modal */}
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(undefined);
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          event={selectedEvent}
          mode={modalMode}
        />
      </div>
    </div>
  );
};

export default Schedule; 