import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import TodoList, { Todo } from '../components/Todo/TodoList';
import EventModal, { CalendarEvent } from '../components/Calendar/EventModal';

const Schedule: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

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
    if (modalMode === 'create') {
      setEvents([...events, { ...eventData, id: String(Date.now()) }]);
    } else {
      setEvents(events.map(event => 
        event.id === selectedEvent?.id 
          ? { ...eventData, id: event.id }
          : event
      ));
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent?.id) {
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setShowEventModal(false);
      setSelectedEvent(undefined);
    }
  };

  const handleAddTodo = (todo: Omit<Todo, 'id'>) => {
    const newTodo = {
      ...todo,
      id: String(Date.now()),
    };

    // Add the todo to the list
    setTodos([...todos, newTodo]);

    // If the todo has a due date, also add it as a calendar event
    if (todo.dueDate) {
      const endDate = new Date(todo.dueDate);
      endDate.setHours(23, 59, 59);

      setEvents([...events, {
        id: `todo-${newTodo.id}`,
        title: `📋 ${todo.text}`,
        start: todo.dueDate,
        end: endDate,
        allDay: true,
        description: `Priority: ${todo.priority}\nCategory: ${todo.category}`,
      }]);
    }
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        // If the todo is being marked as completed, remove its calendar event
        if (!todo.completed && todo.dueDate) {
          setEvents(events.filter(event => event.id !== `todo-${id}`));
        }
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    }));
  };

  const handleDeleteTodo = (id: string) => {
    // Remove the todo
    setTodos(todos.filter(todo => todo.id !== id));
    // Remove the corresponding calendar event if it exists
    setEvents(events.filter(event => event.id !== `todo-${id}`));
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
          event={selectedEvent}
          mode={modalMode}
        />
      </div>
    </div>
  );
};

export default Schedule; 