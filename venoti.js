require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const moment = require('moment-timezone');

const app = express();
app.use(express.json());

const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN;
const LINE_NOTIFY_API = 'https://notify-api.line.me/api/notify';

const luckyColors = [
    {   // อาทิตย์
        อำนาจ: 'ชมพู',
        ศิริมงคล: 'เขียว',
        อุปถัมภ์: 'ดำ น้ำตาล เทา'
    },
    {   // จันทร์
        อำนาจ: 'เขียว',
        ศิริมงคล: 'ม่วง',
        อุปถัมภ์: 'ฟ้า น้ำเงินสด'
    },
    {   // อังคาร
        อำนาจ: 'ม่วง',
        ศิริมงคล: 'ส้ม',
        อุปถัมภ์: 'แดง'
    },
    {   // พุธ
        อำนาจ: 'ส้ม แสด',
        ศิริมงคล: 'ดำ น้ำตาล เทา',
        อุปถัมภ์: 'เหลือง ขาว ครีม'
    },
    {   // พฤหัสบดี
        อำนาจ: 'ฟ้า น้ำเงินสด',
        ศิริมงคล: 'แดง',
        อุปถัมภ์: 'เขียว'
    },
    {   // ศุกร์
        อำนาจ: 'เหลือง ขาว ครีม',
        ศิริมงคล: 'ชมพู',
        อุปถัมภ์: 'ส้ม แสด'
    },
    {   // เสาร์
        อำนาจ: 'ดำ น้ำตาล เทา',
        ศิริมงคล: 'ฟ้า น้ำเงินสด',
        อุปถัมภ์: 'ชมพู'
    }
];

let calendarEvents = [];

app.post('/api/calendar', (req, res) => {
    calendarEvents = req.body.events;
    console.log('Received calendar events:', calendarEvents);
    res.json({ status: 'OK', message: 'Calendar events received successfully' });
});

async function sendLineNotify(message) {
    try {
        const response = await axios.post(
            LINE_NOTIFY_API, 
            `message=${encodeURIComponent(message)}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`
                }
            }
        );
        console.log('Notification sent successfully:', response.data);
    } catch (error) {
        console.error('Failed to send notification:', error.response ? error.response.data : error.message);
    }
}

function getDailyLuckyColor() {
    const today = moment().tz('Asia/Bangkok');
    const dayOfWeek = today.day();
    return luckyColors[dayOfWeek];
}

function getTodayEvents() {
    const today = moment().tz('Asia/Bangkok').startOf('day');
    return calendarEvents.filter(event => 
        moment(event.date).isSame(today, 'day')
    );
}

function sendDailyNotification() {
    const today = moment().tz('Asia/Bangkok');
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const dayName = dayNames[today.day()];
    const formattedDate = today.format('DD/MM/YYYY');
    const luckyColor = getDailyLuckyColor();
    
    let message = `
🌈 สีมงคลประจำวัน${dayName}ที่ ${formattedDate} 🌈

🔴 สีแห่งอำนาจ: ${luckyColor.อำนาจ}
💰 สีแห่งศิริมงคล โชคลาภ เงินทอง: ${luckyColor.ศิริมงคล}
🤝 สีแห่งผู้อุปถัมภ์ช่วยเหลือ: ${luckyColor.อุปถัมภ์}

แต่งกายด้วยสีมงคลเพื่อเสริมดวงและความเป็นสิริมงคลนะคะ! 😊
    `;

    const todayEvents = getTodayEvents();
    if (todayEvents.length > 0) {
        message += "\n\n📅 กำหนดการวันนี้:";
        todayEvents.forEach(event => {
            message += `\n- ${event.title}`;
        });
    }

    sendLineNotify(message);
}

function testNotification() {
    console.log('Sending test notification...');
    sendDailyNotification();
}

cron.schedule('0 5 * * *', () => {
    console.log('Sending daily lucky color and calendar notification...');
    sendDailyNotification();
}, {
    timezone: 'Asia/Bangkok'
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Lucky color and calendar notification service is running...');
});

testNotification();