// src/pages/DriverAvailability.js
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Box } from '@mui/material';

export default function DriverAvailability() {
  const [unavailability, setUnavailability] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ start_time: '', end_time: '' });
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  // Fetch unavailability and bookings (with polling for real-time updates)
  useEffect(() => {
    let interval;
    const fetchData = () => {
      if (user && user.id) {
        fetch(`http://localhost:5000/api/driver-availability/${user.id}`)
          .then(res => res.json())
          .then(data => setUnavailability(Array.isArray(data) ? data : []));
        fetch(`http://localhost:5000/api/bookings/driver/${user.id}`)
          .then(res => res.json())
          .then(data => setBookings(Array.isArray(data) ? data : []));
      }
    };
    fetchData();
    interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [open, user]);

  // Color coding: unavailability (red), bookings (orange, not editable), past gray
  const now = new Date();
  const unavailabilityEvents = unavailability.map(slot => {
    const isPast = new Date(slot.end_time) < now;
    return {
      id: `unavail-${slot.id}`,
      title: 'Unavailable',
      start: slot.start_time,
      end: slot.end_time,
      backgroundColor: isPast ? '#bdbdbd' : '#d32f2f',
      borderColor: isPast ? '#bdbdbd' : '#d32f2f',
      textColor: 'white',
      editable: !isPast,
      allDay: false,
      extendedProps: { type: 'unavailability', slotId: slot.id }
    };
  });
  const bookingEvents = bookings.map(b => {
    const isPast = new Date(b.end_time) < now;
    return {
      id: `booking-${b.id}`,
      title: b.vehicle_model ? `Booked: ${b.vehicle_model}` : 'Booked',
      start: b.start_time,
      end: b.end_time,
      backgroundColor: isPast ? '#bdbdbd' : '#ff9800',
      borderColor: isPast ? '#bdbdbd' : '#ff9800',
      textColor: 'black',
      editable: false,
      allDay: false,
      extendedProps: { type: 'booking' }
    };
  });
  const events = [...unavailabilityEvents, ...bookingEvents];

  // Add unavailability slot
  const handleDateSelect = (selectInfo) => {
    setForm({
      start_time: selectInfo.startStr,
      end_time: selectInfo.endStr
    });
    setError('');
    setOpen(true);
  };

  // Delete unavailability slot
  const handleEventClick = async (clickInfo) => {
    if (clickInfo.event.extendedProps.type === 'unavailability') {
      if (window.confirm('Delete this unavailability slot?')) {
        const slotId = clickInfo.event.extendedProps.slotId;
        await fetch(`http://localhost:5000/api/driver-availability/${slotId}`, { method: 'DELETE' });
        setUnavailability(unavailability.filter(s => String(s.id) !== String(slotId)));
      }
    }
  };

  // Drag & drop or resize unavailability slot
  const handleEventDropOrResize = async (changeInfo) => {
    if (changeInfo.event.extendedProps.type !== 'unavailability') {
      changeInfo.revert();
      return;
    }
    const { id, start, end } = changeInfo.event;
    if (new Date(end) < new Date()) {
      setError('Cannot move or resize past slots.');
      changeInfo.revert();
      return;
    }
    const slotId = changeInfo.event.extendedProps.slotId;
    const res = await fetch(`http://localhost:5000/api/driver-availability/${slotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_time: start.toISOString(), end_time: end.toISOString() })
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error || 'Failed to update slot.');
      changeInfo.revert();
      return;
    }
    fetch(`http://localhost:5000/api/driver-availability/${user.id}`)
      .then(res => res.json())
      .then(data => setUnavailability(Array.isArray(data) ? data : []));
  };

  // Dialog form submit (add unavailability)
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.start_time || !form.end_time) {
      setError('Both start and end time are required.');
      return;
    }
    if (new Date(form.end_time) < new Date()) {
      setError('Cannot add a slot in the past.');
      return;
    }
    const res = await fetch('http://localhost:5000/api/driver-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver_id: user.id, ...form })
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error || 'Failed to add slot.');
      return;
    }
    setOpen(false);
    fetch(`http://localhost:5000/api/driver-availability/${user.id}`)
      .then(res => res.json())
      .then(data => setUnavailability(Array.isArray(data) ? data : []));
  };

  const handleClose = () => setOpen(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Prevent drag/resize for past events or bookings
  const eventAllow = (dropInfo, draggedEvent) => {
    // Defensive: dropInfo.event may be undefined
    const event = dropInfo?.event;
    const end = dropInfo.end || event?.end;
    if (!event || !event.extendedProps) return false;
    if (event.extendedProps.type === 'booking') return false;
    return new Date(end) >= new Date();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>My Unavailability</Typography>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        editable
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDropOrResize}
        eventResize={handleEventDropOrResize}
        eventAllow={eventAllow}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        height={650}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Unavailability Slot</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              label="Start Time"
              name="start_time"
              type="datetime-local"
              value={form.start_time}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="End Time"
              name="end_time"
              type="datetime-local"
              value={form.end_time}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            {error && <Typography color="error">{error}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
