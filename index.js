const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./server/models').sequelize;
const userRoutes = require('./server/routes/userRoutes');
const roomRoutes = require('./server/routes/roomRoutes');
const bookingRoutes = require('./server/routes/bookingRoutes');
const mainRoutes = require('./server/routes/mainRoutes')
const cron = require('node-cron')
const expressApp = express();
cron.schedule('0 0 * * *', () => {
    // console.log('Running the exportBookingsToExcel job at 00:00');
    exportBookingsToExcel().catch(error => {
        // console.error('Error exporting bookings:', error);
    });
})
// Middleware
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: true }));

// Routes
expressApp.use('/api/users', userRoutes);
expressApp.use('/api/rooms', roomRoutes);
expressApp.use('/api/bookings', bookingRoutes);
expressApp.use('/', mainRoutes);

// Serve static files from the React app
expressApp.use(express.static(path.join(__dirname,'server','assets')));
expressApp.set('view engine', 'ejs');
expressApp.set('views', path.join(__dirname, 'server/views'));


// Serve React front-end through Electron

// Sync models and start the Express server
sequelize.sync().then(() => {
    expressApp.listen(3000, () => {
        console.log('Express server listening on port 3000');
    });
}).catch((error) => {
    console.error('Error syncing the database:', error);
});

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'server/preload.js'), // If you have a preload script
        },
    });

    mainWindow.loadURL('http://localhost:3000');

    mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
