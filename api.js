const express = require('express');
const router = express.Router();

let calendarEvents = [];

router.post('/calendar', (req, res) => {
    calendarEvents = req.body.events;
    console.log('Received calendar events:', calendarEvents);
    res.json({ status: 'OK', message: 'Calendar events received successfully' });
});

router.get('/calendar', (req, res) => {
    res.json(calendarEvents);
});

module.exports = { router, getCalendarEvents: () => calendarEvents };