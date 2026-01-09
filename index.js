// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const drakorkitaRoutes = require('./src/routes/drakorkita');

// Routes
app.use('/api/drakorkita', drakorkitaRoutes);

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'Drakorkita Scraper API',
        endpoints: {
            series: '/api/drakorkita/series',
            movies: '/api/drakorkita/movie',
            search: '/api/drakorkita/search?s=keyword',
            detail: '/api/drakorkita/detail/:endpoint',
            genres: '/api/drakorkita/genres'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}`);
});